<?php
declare(strict_types=1);

function age_from_date(string $date): int
{
    return (new DateTimeImmutable($date))->diff(new DateTimeImmutable('today'))->y;
}

function assert_discovery_pair(array $viewer, array $candidate): void
{
    $pdo = db();
    if ((int)$candidate['id'] === (int)$viewer['id']) {
        api_error('You cannot discover your own profile.', 422);
    }
    if ($viewer['account_status'] !== 'active' || $viewer['verification_status'] !== 'approved') {
        api_error('Only approved members can browse matching profiles.', 403);
    }
    if ($candidate['account_status'] !== 'active' || $candidate['verification_status'] !== 'approved') {
        api_error('This profile is not available for discovery.', 404);
    }

    $strict = $pdo->prepare('SELECT enabled FROM feature_settings WHERE feature_key = ?');
    $strict->execute(['opposite_gender_matching']);
    $strictEnabled = (int)$strict->fetchColumn() === 1;
    if ($strictEnabled && $viewer['gender'] === $candidate['gender']) {
        api_error('This profile does not match your discovery preferences.', 404);
    }

    $block = $pdo->prepare('SELECT 1 FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?) LIMIT 1');
    $block->execute([(int)$viewer['id'], (int)$candidate['id'], (int)$candidate['id'], (int)$viewer['id']]);
    if ($block->fetchColumn()) {
        api_error('This profile is not available for discovery.', 404);
    }

    if (!$strictEnabled) {
        $prefs = $pdo->prepare('SELECT preferred_gender FROM profile_preferences WHERE user_id = ?');
        $prefs->execute([(int)$viewer['id']]);
        $preferredGender = $prefs->fetchColumn();
        if ($preferredGender && $preferredGender !== 'any' && $candidate['gender'] !== $preferredGender) {
            api_error('This profile does not match your discovery preferences.', 404);
        }
    }
}

function matching_weights(PDO $pdo): array
{
    $rows = $pdo->query('SELECT weight_key, weight FROM matching_weights')->fetchAll();
    $weights = [];
    foreach ($rows as $row) {
        $weights[$row['weight_key']] = (float)$row['weight'];
    }
    return $weights;
}

function compatibility_score(array $viewer, array $candidate, array $weights): array
{
    $viewerAge = age_from_date((string)$viewer['date_of_birth']);
    $candidateAge = age_from_date((string)$candidate['date_of_birth']);
    $viewerPrefs = $viewer['preference_data'] ?? [];
    $candidatePrefs = $candidate['preference_data'] ?? [];
    if (is_string($viewerPrefs)) $viewerPrefs = json_decode($viewerPrefs, true) ?: [];
    if (is_string($candidatePrefs)) $candidatePrefs = json_decode($candidatePrefs, true) ?: [];

    $viewerInterests = json_decode((string)($viewer['interests'] ?? '[]'), true) ?: [];
    $candidateInterests = json_decode((string)($candidate['interests'] ?? '[]'), true) ?: [];
    $viewerLanguages = json_decode((string)($viewer['languages'] ?? '[]'), true) ?: [];
    $candidateLanguages = json_decode((string)($candidate['languages'] ?? '[]'), true) ?: [];
    $sharedInterests = array_values(array_intersect(array_map('text_lower', $viewerInterests), array_map('text_lower', $candidateInterests)));
    $sharedLanguages = array_values(array_intersect(array_map('text_lower', $viewerLanguages), array_map('text_lower', $candidateLanguages)));

    $ageFit = 72;
    $minimumAge = (int)($viewer['minimum_age'] ?? 18);
    $maximumAge = (int)($viewer['maximum_age'] ?? 99);
    if ($candidateAge >= $minimumAge && $candidateAge <= $maximumAge) $ageFit = 100;
    else $ageFit = max(25, 100 - min(75, min(abs($candidateAge - $minimumAge), abs($candidateAge - $maximumAge)) * 13));

    $locationFit = 38;
    if (strcasecmp((string)($viewer['state'] ?? ''), (string)($candidate['state'] ?? '')) === 0 && !empty($viewer['state'])) $locationFit = 100;
    elseif (!empty($viewerPrefs['preferred_location']) && str_contains(text_lower((string)$viewerPrefs['preferred_location']), 'north') && in_array(text_lower((string)($candidate['state'] ?? '')), ['kano','kaduna','katsina','sokoto','jigawa','zamfara','yobe','borno','adamawa','bauchi','gombe','taraba','niger','plateau','abuja fct'], true)) $locationFit = 85;

    $viewerIntention = text_lower((string)($viewer['marriage_intention'] ?? ''));
    $candidateIntention = text_lower((string)($candidate['marriage_intention'] ?? ''));
    $intentionFit = $viewerIntention !== '' && $candidateIntention !== '' && $viewerIntention === $candidateIntention ? 100 : 73;
    if ($viewerIntention !== '' && $candidateIntention !== '' && str_contains($viewerIntention, 'marriage') && str_contains($candidateIntention, 'marriage')) $intentionFit = max($intentionFit, 91);

    $educationFit = !empty($viewer['education']) && !empty($candidate['education']) && strcasecmp((string)$viewer['education'], (string)$candidate['education']) === 0 ? 100 : 68;
    $religionFit = !empty($viewer['religious_practice']) && !empty($candidate['religious_practice']) && strcasecmp((string)$viewer['religious_practice'], (string)$candidate['religious_practice']) === 0 ? 100 : 74;
    $interestFit = count($viewerInterests) + count($candidateInterests) > 0 ? min(100, (int)round(count($sharedInterests) / max(1, min(count($viewerInterests), count($candidateInterests))) * 100)) : 60;
    $languageFit = count($sharedLanguages) > 0 ? 100 : 58;
    $lifestyleFit = !empty($viewer['marital_status']) && !empty($candidate['marital_status']) && strcasecmp((string)$viewer['marital_status'], (string)$candidate['marital_status']) === 0 ? 100 : 76;

    $signals = [
        'age_compatibility' => $ageFit,
        'location' => $locationFit,
        'marriage_intention' => $intentionFit,
        'education' => $educationFit,
        'religion_practice' => $religionFit,
        'shared_interests' => $interestFit,
        'languages' => $languageFit,
        'lifestyle' => $lifestyleFit,
    ];
    $totalWeight = array_sum(array_intersect_key($weights, $signals));
    $weighted = 0.0;
    foreach ($signals as $key => $fit) {
        $weighted += $fit * (float)($weights[$key] ?? 0);
    }
    $score = $totalWeight > 0 ? (int)round($weighted / $totalWeight) : 0;
    return ['score' => min(99, max(0, $score)), 'shared_interests' => array_slice($sharedInterests, 0, 8), 'shared_languages' => array_slice($sharedLanguages, 0, 4)];
}

function discover_profiles(PDO $pdo, array $viewer, array $query): array
{
    $viewerStmt = $pdo->prepare(
        'SELECT u.id, u.gender, u.date_of_birth, p.marital_status, p.state, p.education, p.religious_practice, p.languages, p.interests, p.marriage_intention, pp.minimum_age, pp.maximum_age, pp.preferred_gender, pp.preference_data '
        . 'FROM users u JOIN profiles p ON p.user_id = u.id LEFT JOIN profile_preferences pp ON pp.user_id = u.id WHERE u.id = ?'
    );
    $viewerStmt->execute([(int)$viewer['id']]);
    $viewerData = $viewerStmt->fetch();
    if (!$viewerData) api_error('Complete your profile before browsing introductions.', 403);

    $limit = max(1, min(50, (int)($query['limit'] ?? 20)));
    $strictStmt = $pdo->prepare('SELECT enabled FROM feature_settings WHERE feature_key = ?');
    $strictStmt->execute(['opposite_gender_matching']);
    $strict = (int)$strictStmt->fetchColumn() === 1;
    $genderSql = '';
    $params = [(int)$viewer['id']];
    if ($strict) {
        $genderSql = ' AND u.gender = ?';
        $params[] = $viewer['gender'] === 'male' ? 'female' : 'male';
    } else {
        $preferred = $viewerData['preferred_gender'] ?? null;
        if ($preferred && $preferred !== 'any') {
            $genderSql = ' AND u.gender = ?';
            $params[] = $preferred;
        }
    }
    $minAge = max(18, (int)($viewerData['minimum_age'] ?? 18));
    $maxAge = min(99, max($minAge, (int)($viewerData['maximum_age'] ?? 99)));
    $sql = 'SELECT u.id,u.gender,u.date_of_birth,u.verification_status,u.account_status,p.full_name,p.state,p.lga,p.education,p.occupation,p.marital_status,p.religious_practice,p.languages,p.interests,p.about_me,p.marriage_intention,pp.minimum_age AS preferred_minimum_age,pp.maximum_age AS preferred_maximum_age,pp.preferred_gender AS candidate_preferred_gender,pp.preference_data AS candidate_preference_data,ph.id AS profile_photo_id '
        . 'FROM users u JOIN profiles p ON p.user_id=u.id LEFT JOIN profile_preferences pp ON pp.user_id=u.id LEFT JOIN profile_photos ph ON ph.user_id=u.id AND ph.is_primary=1 AND ph.review_status=\'approved\' '
        . 'WHERE u.id <> ? AND u.account_status = \'active\' AND u.verification_status = \'approved\' AND p.profile_visibility = \'visible\' AND ph.id IS NOT NULL '
        . $genderSql
        . ' AND TIMESTAMPDIFF(YEAR,u.date_of_birth,CURDATE()) BETWEEN ? AND ? '
        . ' AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id=? AND b.blocked_id=u.id) OR (b.blocker_id=u.id AND b.blocked_id=?)) '
        . ' AND NOT EXISTS (SELECT 1 FROM likes l WHERE l.from_user_id=? AND l.to_user_id=u.id) '
        . ' ORDER BY u.created_at DESC LIMIT ' . $limit;
    $params[] = $minAge;
    $params[] = $maxAge;
    $params[] = (int)$viewer['id'];
    $params[] = (int)$viewer['id'];
    $params[] = (int)$viewer['id'];
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    $weights = matching_weights($pdo);
    $viewerData['preference_data'] = $viewerData['preference_data'] ?? null;
    $results = [];
    foreach ($rows as $row) {
        if (!candidate_accepts_viewer($viewerData, $row)) continue;
        $score = compatibility_score($viewerData, $row, $weights);
        $results[] = [
            'id' => (int)$row['id'],
            'photo_url' => 'api.php?route=profile-photos/' . (int)$row['profile_photo_id'],
            'name' => $row['full_name'],
            'age' => age_from_date($row['date_of_birth']),
            'location' => trim((string)$row['state'] . (!empty($row['lga']) ? ', ' . $row['lga'] : '')),
            'education' => $row['education'],
            'occupation' => $row['occupation'],
            'about' => $row['about_me'],
            'languages' => json_decode((string)$row['languages'], true) ?: [],
            'interests' => json_decode((string)$row['interests'], true) ?: [],
            'marriage_intention' => $row['marriage_intention'],
            'religious_practice' => $row['religious_practice'],
            'compatibility_score' => $score['score'],
            'shared_interests' => $score['shared_interests'],
            'shared_languages' => $score['shared_languages'],
            'verified' => true,
        ];
    }
    usort($results, static fn(array $a, array $b): int => $b['compatibility_score'] <=> $a['compatibility_score']);
    return $results;
}

function candidate_accepts_viewer(array $viewer, array $candidate): bool
{
    $viewerGender = (string)$viewer['gender'];
    $candidateGender = (string)$candidate['gender'];
    $candidatePreference = (string)($candidate['candidate_preferred_gender'] ?? '');
    $viewerPreference = (string)($viewer['preferred_gender'] ?? '');
    if ($candidatePreference !== '' && $candidatePreference !== 'any' && $candidatePreference !== $viewerGender) return false;
    if ($viewerPreference !== '' && $viewerPreference !== 'any' && $viewerPreference !== $candidateGender) return false;
    $candidatePreferences = $candidate['candidate_preference_data'] ?? [];
    if (is_string($candidatePreferences)) $candidatePreferences = json_decode($candidatePreferences, true) ?: [];
    $candidateMin = (int)($candidatePreferences['minimum_age'] ?? 18);
    $candidateMax = (int)($candidatePreferences['maximum_age'] ?? 99);
    $viewerAge = age_from_date((string)$viewer['date_of_birth']);
    return $viewerAge >= $candidateMin && $viewerAge <= $candidateMax;
}
