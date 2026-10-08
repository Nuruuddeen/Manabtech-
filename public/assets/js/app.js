"use strict";

const SVG_PATHS = {
  discover: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 3l.8 1.7L7.5 5.5l-1.7.8L5 8l-.8-1.7-1.7-.8 1.7-.8L5 3Z"/>',
  heart: '<path d="M20.8 8.6c0 5.5-8.8 11-8.8 11s-8.8-5.5-8.8-11A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.2Z"/>',
  message: '<path d="M20.5 11.4a7.8 7.8 0 0 1-.9 3.6 8 8 0 0 1-7.2 4.5 7.8 7.8 0 0 1-3.6-.9L3 20l1.4-5.8a7.8 7.8 0 0 1-.9-3.6A8 8 0 0 1 8 3.4a7.8 7.8 0 0 1 3.6-.9h.5a8 8 0 0 1 8.4 8.4v.5Z"/>',
  community: '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.9M16 3.2a4 4 0 0 1 0 7.6"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  admin: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h4M7 12h4M7 16h4M15 8h2M15 12h2M15 16h2"/>',
  settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.8-.7a8 8 0 0 1-1.7 1l-.3 1.9h-2.8l-.3-1.9a8 8 0 0 1-1.7-1l-1.8.7-1.4-2.4 1.4-1.1A8 8 0 0 1 6.8 13l-1.9-.3V9.9l1.9-.3a8 8 0 0 1 1-1.7l-.7-1.8 2.4-1.4 1.1 1.4a8 8 0 0 1 2-.1l.3-1.9h2.8l.3 1.9a8 8 0 0 1 1.7 1l1.8-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 .1 2l1.9.3v2.8l-1.9.3a8 8 0 0 1-.2 1.8Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  location: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  checkCircle: '<path d="M21 11.1V12a9 9 0 1 1-5.3-8.2"/><path d="m9 11 3 3L22 4"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  filter: '<path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/>',
  sort: '<path d="M8 6h12M8 12h8M8 18h4M4 6v12m0 0-2-2m2 2 2-2"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.7L7.6 9.5a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.7-.6l2.8.4a2 2 0 0 1 1.6 2Z"/>',
  video: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  play: '<path d="m8 5 12 7-12 7V5Z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  share: '<path d="M12 16V4m-4 4 4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  comment: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.4Z"/>',
  paperclip: '<path d="m21.4 11.1-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.2a1.8 1.8 0 0 1-2.6-2.6l8.5-8.5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
  more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6"/>',
  chart: '<path d="M3 3v18h18M18 17V9m-5 8V5m-5 12v-4"/>',
  coins: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  campaign: '<path d="m3 11 18-5v12L3 13v-2ZM5 13l2 7h4l-2-6"/><path d="M21 9v6"/>',
  ad: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m8 15 2-5 2 5m-3.4-1h2.8M15 10v5m0-5h2a2 2 0 0 1 0 4h-2"/>',
  support: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 5h18m-11 0v2h4v-2"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  lock: '<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3m-5 5v2"/>',
  camera: '<path d="M14 4H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7l-5-1-2-5Z"/><circle cx="11" cy="12" r="3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8H7a2.5 2.5 0 1 1 2.5-2.5C9.5 7 12 8 12 8Zm0 0h5a2.5 2.5 0 1 0-2.5-2.5C14.5 7 12 8 12 8Z"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m5 5 14 14"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  trend: '<path d="m3 17 6-6 4 4 8-9M15 6h6v6"/>',
  audio: '<path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1m7 8v4m-4 0h8"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  key: '<circle cx="8" cy="15" r="5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7"/>',
  flag: '<path d="M4 22V4m0 1c5-4 9 4 16 0v11c-7 4-11-4-16 0"/>',
  messageSquare: '<path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 10h8m-8 4h5"/>',
  external: '<path d="M14 3h7v7m0-7-9 9"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/>',
  crown: '<path d="m2 7 5 5 5-8 5 8 5-5-2 13H4L2 7Z"/><path d="M5 20h14"/>',
  shieldCheck: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 17.5 6L20 8M4 16l2.5 2A7 7 0 0 0 18.4 15"/>',
  sparkles: '<path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
  wallet: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18m-6 6h2M7 5V3h11"/>',
  sliders: '<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4"/>',
  toggle: '<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="7" cy="12" r="3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  logout: '<path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>'
};

const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${SVG_PATHS[name] || SVG_PATHS.sparkle}</svg>`;
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const imagePath = name => /^https?:\/\//.test(String(name || '')) || String(name || '').startsWith('/') || String(name || '').startsWith('api.php?') ? String(name) : `assets/images/${name}`;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const profiles = [
  { id: 'yusuf', name: 'Yusuf A.', age: 31, city: 'Abuja, FCT', job: 'Product designer', image: 'portrait-yusuf.jpg', score: 96, tags: ['Family-minded', 'Hausa', 'University educated'], online: true, joined: 'Today', about: 'A thoughtful product designer who finds joy in the little things — weekend cooking, family time and building useful things. Looking for a kind, grounded partner to grow with, insha’Allah.', education: 'MSc, Information Design', intention: 'Marriage within 1–2 years', interests: ['Design', 'Reading', 'Family', 'Travelling'], language: 'Hausa, English', religion: 'Practising', location: 'Abuja, FCT' },
  { id: 'omar', name: 'Omar S.', age: 29, city: 'Kaduna, Kaduna', job: 'Civil engineer', image: 'portrait-omar.jpg', score: 92, tags: ['Ready for marriage', 'Hausa', 'Outdoors'], online: false, joined: 'This week', about: 'Engineer by profession, curious by nature. I value open communication, faith, close family bonds and a good cup of tea after a long day.', education: 'BEng, Civil Engineering', intention: 'Ready to meet my person', interests: ['Architecture', 'Nature', 'Football', 'Faith'], language: 'Hausa, English, Arabic', religion: 'Practising', location: 'Kaduna, Kaduna' },
  { id: 'khalid', name: 'Khalid M.', age: 33, city: 'Kano, Kano', job: 'Entrepreneur', image: 'portrait-khalid.jpg', score: 89, tags: ['Community-minded', 'Hausa', 'Business'], online: true, joined: 'Yesterday', about: 'Building a small family business in Kano. I enjoy mentoring young founders, visiting new places and making time for the people who matter.', education: 'BSc, Business Administration', intention: 'Marriage-minded', interests: ['Entrepreneurship', 'Community', 'Food', 'Travel'], language: 'Hausa, English', religion: 'Practising', location: 'Kano, Kano' }
];

const conversations = [
  { id: 'yusuf', name: 'Yusuf A.', image: 'portrait-yusuf.jpg', online: true, time: '9:42 am', preview: 'That sounds like a lovely tradition.', unread: 1 },
  { id: 'omar', name: 'Omar S.', image: 'portrait-omar.jpg', online: false, time: 'Yesterday', preview: 'It was great talking with you.', unread: 0 },
  { id: 'khalid', name: 'Khalid M.', image: 'portrait-khalid.jpg', online: true, time: 'Mon', preview: 'Assalamu alaikum, Fatima!', unread: 0 }
];

const featureCatalog = [
  { key: 'registration', label: 'Registration', detail: 'Phone and email registration with OTP verification.', icon: 'user', enabled: true },
  { key: 'discovery', label: 'Profile discovery', detail: 'Approved member profiles and compatibility-led introductions.', icon: 'discover', enabled: true },
  { key: 'opposite_gender_matching', label: 'Strict opposite-gender rule', detail: 'When enabled, members only discover approved opposite-gender profiles.', icon: 'heart', enabled: true },
  { key: 'video_verification', label: 'Video verification', detail: 'Private, reviewer-only verification submissions.', icon: 'video', enabled: true },
  { key: 'audio_calls', label: 'Audio calls', detail: 'In-app audio calling, with phone numbers kept private.', icon: 'audio', enabled: true },
  { key: 'video_calls', label: 'Video calls', detail: 'In-app video calls for mutual matches.', icon: 'video', enabled: true },
  { key: 'messaging', label: 'Messaging', detail: 'Private matched-member conversations.', icon: 'message', enabled: true },
  { key: 'community', label: 'Community', detail: 'Member posts with reporting and moderation controls.', icon: 'community', enabled: true },
  { key: 'comments', label: 'Comments', detail: 'Comments and replies on community posts.', icon: 'comment', enabled: true },
  { key: 'sharing', label: 'Sharing', detail: 'Public community links; private match data stays private.', icon: 'share', enabled: true },
  { key: 'campaigns', label: 'Campaigns', detail: 'Audience-targeted growth campaigns and analytics.', icon: 'campaign', enabled: true },
  { key: 'advertisements', label: 'Advertisements', detail: 'Manage placements, creatives and approvals.', icon: 'ad', enabled: true },
  { key: 'premium_membership', label: 'Premium membership', detail: 'Plans and paid member features.', icon: 'crown', enabled: true },
  { key: 'notifications', label: 'Notifications', detail: 'In-app and email notification delivery.', icon: 'bell', enabled: true },
  { key: 'gifts', label: 'Gifts', detail: 'Virtual gifts between members.', icon: 'gift', enabled: false },
  { key: 'events', label: 'Events', detail: 'Community gatherings and events.', icon: 'calendar', enabled: false }
];

const verificationQueue = [
  { id: 'VR-4821', user: 'Amina Bello', age: 26, city: 'Kano, Kano', image: 'portrait-aisha.jpg', submitted: '8 min ago', status: 'Pending', reviewer: 'Unassigned', gender: 'Female', job: 'Teacher', video: true },
  { id: 'VR-4819', user: 'Musa Ibrahim', age: 31, city: 'Abuja, FCT', image: 'portrait-yusuf.jpg', submitted: '24 min ago', status: 'Under review', reviewer: 'S. Ahmed', gender: 'Male', job: 'Product designer', video: true },
  { id: 'VR-4815', user: 'Zainab Hassan', age: 29, city: 'Kaduna, Kaduna', image: 'portrait-zainab.jpg', submitted: '1 hr ago', status: 'Pending', reviewer: 'Unassigned', gender: 'Female', job: 'Doctor', video: true },
  { id: 'VR-4810', user: 'Ibrahim Yusuf', age: 34, city: 'Lagos, Lagos', image: 'portrait-omar.jpg', submitted: '2 hrs ago', status: 'Pending', reviewer: 'Unassigned', gender: 'Male', job: 'Architect', video: true }
];

const demoUsers = [
  { id: 'USR-04921', name: 'Amina Bello', gender: 'Female', city: 'Kano', joined: 'Oct 08, 2026', status: 'Pending', verified: false, image: 'portrait-aisha.jpg' },
  { id: 'USR-04920', name: 'Musa Ibrahim', gender: 'Male', city: 'Abuja', joined: 'Oct 08, 2026', status: 'Under review', verified: false, image: 'portrait-yusuf.jpg' },
  { id: 'USR-04918', name: 'Zainab Hassan', gender: 'Female', city: 'Kaduna', joined: 'Oct 07, 2026', status: 'Approved', verified: true, image: 'portrait-zainab.jpg' },
  { id: 'USR-04912', name: 'Ibrahim Yusuf', gender: 'Male', city: 'Lagos', joined: 'Oct 06, 2026', status: 'Approved', verified: true, image: 'portrait-omar.jpg' },
  { id: 'USR-04899', name: 'Maryam Aliyu', gender: 'Female', city: 'Abuja', joined: 'Oct 04, 2026', status: 'Suspended', verified: false, image: 'portrait-safiya.jpg' },
  { id: 'USR-04871', name: 'Khalid Musa', gender: 'Male', city: 'Kano', joined: 'Oct 02, 2026', status: 'Rejected', verified: false, image: 'portrait-khalid.jpg' }
];

const communityPosts = [
  { id: 'post-1', author: 'Zainab Hassan', image: 'portrait-zainab.jpg', time: '2 hours ago', location: 'Kaduna', text: 'A gentle reminder for anyone on this journey: there is no timeline you have to keep up with. Keep making du’a, keep becoming the person you hope to meet, and trust that the right things arrive in their own time. 🌿', likes: 48, comments: 12, liked: false, verified: true },
  { id: 'post-2', author: 'Aisha B.', image: 'portrait-aisha.jpg', time: 'Yesterday', location: 'Abuja', text: 'Our sisters’ book circle is meeting this Saturday at the community library. We’ll be sharing reflections on building a peaceful home, with tea and a little time to get to know one another. Everyone is welcome. #Community #SistersCircle', likes: 31, comments: 8, liked: true, verified: true },
  { id: 'post-3', author: 'Mariam Yusuf', image: 'portrait-mariam.jpg', time: '2 days ago', location: 'Kano', text: 'What is one quality that made you feel safe and respected when getting to know someone? For me, it is consistency between someone’s words and actions.', likes: 67, comments: 19, liked: false, verified: true }
];

const messagesByUser = {
  yusuf: [
    { mine: false, text: 'Assalamu alaikum, Fatima. I enjoyed reading about your love of family cooking.', time: '9:31 am' },
    { mine: true, text: 'Wa alaikum salam, Yusuf! It is one of my favourite ways to bring everyone together.', time: '9:36 am' },
    { mine: false, text: 'That sounds like a lovely tradition. What is your favourite dish to make?', time: '9:42 am' }
  ],
  omar: [
    { mine: false, text: 'It was great talking with you. I hope your week is off to a good start.', time: 'Yesterday' },
    { mine: true, text: 'It was lovely speaking with you too, Omar. Have a peaceful week.', time: 'Yesterday' }
  ],
  khalid: [
    { mine: false, text: 'Assalamu alaikum, Fatima! I saw that you are interested in community work too.', time: 'Mon' },
    { mine: true, text: 'Wa alaikum salam. It has always been important to me.', time: 'Mon' }
  ]
};

const roles = [
  { name: 'Super Admin', users: 2, description: 'Full platform control, roles and security.', icon: 'crown', permissions: ['*'] },
  { name: 'Admin', users: 4, description: 'General platform and account management.', icon: 'admin', permissions: ['users.view', 'users.edit', 'community.moderate', 'settings.view'] },
  { name: 'Verification Officer', users: 8, description: 'Review profiles and verification submissions.', icon: 'shieldCheck', permissions: ['verification.view', 'verification.approve', 'verification.reject'] },
  { name: 'Finance', users: 3, description: 'Payments, subscriptions and refunds.', icon: 'wallet', permissions: ['payments.view', 'payments.refund', 'payments.export'] },
  { name: 'Support', users: 6, description: 'Member tickets, complaints and reports.', icon: 'support', permissions: ['users.view', 'support.view', 'reports.view'] },
  { name: 'Moderator', users: 5, description: 'Community safety and content moderation.', icon: 'flag', permissions: ['community.view', 'community.moderate', 'reports.view'] },
  { name: 'Advert Manager', users: 2, description: 'Advertising campaigns, placements and analytics.', icon: 'ad', permissions: ['ads.create', 'ads.edit', 'ads.approve'] },
  { name: 'Content Manager', users: 3, description: 'Community content and platform resources.', icon: 'book', permissions: ['community.view', 'community.create', 'community.edit'] }
];

const campaigns = [
  { name: 'Ramadan Marriage Campaign', target: 'Northern Nigeria · 22–40', status: 'Scheduled', dates: '01 Mar — 31 Mar 2027', reach: '—', registrations: '—', accent: 'sand' },
  { name: 'Verified, Seen, Respected', target: 'All members · Nigeria', status: 'Active', dates: '01 Oct — 31 Oct 2026', reach: '48.2k', registrations: '624', accent: 'green' },
  { name: 'Abuja Community Launch', target: 'Abuja FCT · 24–38', status: 'Active', dates: '15 Sep — 15 Nov 2026', reach: '21.8k', registrations: '317', accent: 'blue' }
];

const ads = [
  { name: 'Noor Books — Autumn reads', type: 'Banner', placement: 'Community feed', status: 'Approved', impressions: '18,204', clicks: '842', image: 'portrait-mariam.jpg' },
  { name: 'Nikkah Essentials', type: 'Sponsored post', placement: 'Discover', status: 'In review', impressions: '—', clicks: '—', image: 'portrait-zainab.jpg' },
  { name: 'Zamzam Travel', type: 'Campaign', placement: 'Homepage', status: 'Active', impressions: '44,590', clicks: '1,208', image: 'portrait-aisha.jpg' }
];

const state = {
  workspace: 'member',
  route: 'discover',
  searchTerm: '',
  profileFilter: 'All',
  ageRange: 'Any age',
  likedIds: new Set(['khalid']),
  matchedIds: new Set(),
  activeConversation: 'yusuf',
  posts: communityPosts.map(post => ({ ...post })),
  features: featureCatalog.map(feature => ({ ...feature })),
  queue: verificationQueue.map(item => ({ ...item })),
  pendingPhotos: [
    { id: 'PH-2801', user: 'Amina Bello', location: 'Kano, Kano', uploaded: '12 min ago', image: 'portrait-aisha.jpg', status: 'Pending' },
    { id: 'PH-2798', user: 'Zainab Hassan', location: 'Kaduna, Kaduna', uploaded: '42 min ago', image: 'portrait-zainab.jpg', status: 'Pending' },
    { id: 'PH-2791', user: 'Maryam Aliyu', location: 'Abuja, FCT', uploaded: '2 hrs ago', image: 'portrait-safiya.jpg', status: 'Pending' }
  ],
  users: demoUsers.map(user => ({ ...user })),
  roles: roles.map(role => ({ ...role })),
  campaigns: campaigns.map(campaign => ({ ...campaign })),
  ads: ads.map(ad => ({ ...ad })),
  onboardingStep: 0,
  onboardingData: {},
  onboardingMode: 'preview',
  authPending: false,
  otpChannel: 'email',
  adminTwoFactorMode: 'verify',
  adminSetupSecret: '',
  csrfToken: '',
  backendAvailable: false,
  apiUser: null,
  adminSearch: '',
  dashboardData: null,
  matchingWeights: null,
  paymentProviders: null,
  verificationFilter: 'All',
  communityFilter: 'For you',
  modalOpen: false
};

const MEMBER_NAV = [
  { label: 'Discover', route: 'discover', icon: 'discover' },
  { label: 'My likes', route: 'likes', icon: 'heart', badge: '4' },
  { label: 'Messages', route: 'messages', icon: 'message', badge: '2' },
  { label: 'Community', route: 'community', icon: 'community' }
];
const ADMIN_NAV = [
  { label: 'Overview', route: 'admin:overview', icon: 'chart' },
  { label: 'Verification', route: 'admin:verification', icon: 'shield', badge: '86' },
  { label: 'Photo review', route: 'admin:photos', icon: 'image' },
  { label: 'Users', route: 'admin:users', icon: 'users' },
  { label: 'Matching', route: 'admin:matching', icon: 'heart' },
  { label: 'Community', route: 'admin:community', icon: 'community' },
  { label: 'Messages & calls', route: 'admin:messages', icon: 'message' },
  { label: 'Payments', route: 'admin:payments', icon: 'wallet' },
  { label: 'Campaigns', route: 'admin:campaigns', icon: 'campaign' },
  { label: 'Advertisements', route: 'admin:ads', icon: 'ad' },
  { label: 'Support', route: 'admin:support', icon: 'support' },
  { label: 'Staff & roles', route: 'admin:staff', icon: 'key' },
  { label: 'Feature controls', route: 'admin:features', icon: 'toggle' },
  { label: 'Settings & audit', route: 'admin:settings', icon: 'settings' }
];

function navButton(item) {
  const isActive = state.route === item.route;
  return `<button class="nav-link${isActive ? ' active' : ''}" type="button" data-nav="${escapeHtml(item.route)}" ${isActive ? 'aria-current="page"' : ''}>${icon(item.icon)}<span>${escapeHtml(item.label)}</span>${item.badge ? `<b class="${item.badge === '86' ? 'nav-tag' : 'nav-count'}">${escapeHtml(item.badge)}</b>` : ''}</button>`;
}

function renderSidebar() {
  const root = $('#sidebarContent');
  if (!root) return;
  const admin = state.workspace === 'admin';
  root.innerHTML = `<div class="sidebar-inner ${admin ? 'sidebar-admin' : ''}">
    <a class="brand-lockup" href="#home" data-nav="${admin ? 'admin:overview' : 'discover'}" aria-label="HalalMatch home">
      <span class="brand-mark"><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 3.8 21.3 11 28.7 8l-3 7.4 7.2 3.3-7.2 3.3 3 7.4-7.4-3L18 33.6l-3.3-7.2-7.4 3 3-7.4-7.2-3.3 7.2-3.3-3-7.4 7.4 3L18 3.8Z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="18" cy="18" r="3.5" fill="currentColor" stroke="none"/><path d="M18 1.5v4M34.5 18h-4M18 34.5v-4M1.5 18h4" stroke="currentColor" stroke-width="1.2"/></svg></span>
      <span><b class="brand-name">HalalMatch</b><small class="brand-caption">${admin ? 'Control centre' : 'meaningful, made halal'}</small></span>
    </a>
    ${admin ? `<div class="admin-mode-pill">Super admin workspace</div><div class="workspace-label">Control centre</div><nav class="nav-list" aria-label="Admin workspace">${ADMIN_NAV.map(navButton).join('')}</nav>` : `<div class="workspace-label">Your space</div><nav class="nav-list" aria-label="Member navigation">${MEMBER_NAV.map(navButton).join('')}</nav><div class="workspace-label">Your account</div><nav class="nav-list" aria-label="Account navigation">${navButton({ label: 'My profile', route: 'profile', icon: 'user' })}${navButton({ label: 'Verification', route: 'verification', icon: 'shield' })}</nav><div class="sidebar-spacer"></div>${(!state.backendAvailable || state.apiUser?.is_admin) ? `<div class="admin-callout"><div class="admin-callout-top"><strong>Platform administration</strong>${icon('lock')}</div><p>Manage members, safety and the tools behind every connection.</p><button class="workspace-launch" type="button" data-action="switch-workspace">Open admin workspace${icon('arrow')}</button></div>` : ''}`}
    ${admin ? `<div class="sidebar-spacer"></div><div class="admin-callout"><div class="admin-callout-top"><strong>Member experience</strong>${icon('heart')}</div><p>Return to the member platform view.</p><button class="workspace-launch" type="button" data-action="switch-workspace">Switch to member view${icon('arrow')}</button></div>` : ''}
    <a class="sidebar-help" href="#help" data-action="help">${icon('support')}<span>${admin ? 'Admin support' : 'Safety & support'}</span></a>
    <button class="account-card" type="button" data-action="profile"><img src="${imagePath(admin ? 'portrait-omar.jpg' : 'portrait-aisha.jpg')}" alt=""><span class="account-info"><strong>${admin ? 'Ibrahim Adeyemi' : 'Fatima Bello'}</strong><small>${admin ? 'Super administrator' : 'Verified member · Kano'}</small></span>${icon('more', 'account-menu')}</button>
  </div>`;
}

function setWorkspace(workspace) {
  if (workspace === 'admin' && state.backendAvailable && !state.apiUser?.is_admin) {
    toast('Administrator access required', 'Sign in with an authorised staff account to open the control centre.');
    return;
  }
  state.workspace = workspace;
  state.route = workspace === 'admin' ? 'admin:overview' : 'discover';
  state.searchTerm = '';
  $('#globalSearch').value = '';
  const topName = $('.topbar-profile-copy strong');
  const topRole = $('.topbar-profile-copy small');
  const topAvatar = $('.avatar-top');
  if (topName) topName.textContent = workspace === 'admin' ? 'Ibrahim' : 'Fatima';
  if (topRole) topRole.textContent = workspace === 'admin' ? 'Super administrator' : 'Verified member';
  if (topAvatar) {
    topAvatar.src = imagePath(workspace === 'admin' ? 'portrait-omar.jpg' : 'portrait-aisha.jpg');
    topAvatar.alt = workspace === 'admin' ? 'Administrator profile photo' : 'Member profile photo';
  }
  render();
}

function render() {
  renderSidebar();
  const view = $('#mainView');
  if (view) view.innerHTML = state.workspace === 'admin' ? renderAdmin() : renderMember();
  const breadcrumb = $('#currentCrumb');
  if (breadcrumb) breadcrumb.textContent = currentPageLabel();
  document.body.classList.remove('sidebar-open');
}

function currentPageLabel() {
  if (state.route.startsWith('admin:')) return ADMIN_NAV.find(item => item.route === state.route)?.label || 'Overview';
  const labels = { discover: 'Discover', likes: 'My likes', messages: 'Messages', community: 'Community', profile: 'My profile', verification: 'Verification', onboarding: 'Get started' };
  return labels[state.route] || 'Discover';
}

function memberHeading({ eyebrow = 'Your journey, your pace', title, subtitle, action = '' }) {
  return `<div class="page-heading member-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span>${escapeHtml(eyebrow)}</div><h1>${title}</h1><p>${escapeHtml(subtitle)}</p></div><div class="member-head-right">${action}</div></div>`;
}

function profileCard(profile) {
  const liked = state.likedIds.has(profile.id);
  return `<article class="profile-card" data-profile-card="${escapeHtml(profile.id)}">
    <div class="profile-photo-wrap" role="button" tabindex="0" data-action="open-profile" data-id="${escapeHtml(profile.id)}" aria-label="View ${escapeHtml(profile.name)}'s profile">
      <img class="profile-photo" src="${imagePath(profile.image)}" alt="${escapeHtml(profile.name)}'s profile" loading="lazy">
      <span class="photo-overlay"></span><span class="compatibility-badge">${icon('sparkle')}${profile.score}% compatible</span>
      <button class="profile-heart${liked ? ' is-liked' : ''}" type="button" data-action="like" data-id="${escapeHtml(profile.id)}" aria-label="${liked ? 'Unlike' : 'Like'} ${escapeHtml(profile.name)}">${icon('heart')}</button>
      <div class="profile-photo-caption"><div><strong>${escapeHtml(profile.name)}, ${profile.age}</strong><span>${icon('location')} ${escapeHtml(profile.city)}</span></div>${profile.online ? '<span class="online-indicator">Online</span>' : ''}</div>
    </div>
    <div class="profile-card-body">
      <div class="profile-summary"><span>${icon('briefcase')}${escapeHtml(profile.job)}</span><span class="verified-check">${icon('checkCircle')} Verified</span></div>
      <div class="profile-tags">${profile.tags.slice(0, 3).map(tag => `<span class="profile-tag">${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="profile-actions"><button class="primary-button" type="button" data-action="like" data-id="${escapeHtml(profile.id)}">${icon(liked ? 'check' : 'heart')}${liked ? 'Liked' : 'Send a like'}</button><button class="secondary-button" type="button" data-action="message" data-id="${escapeHtml(profile.id)}" aria-label="Message ${escapeHtml(profile.name)}">${icon('message')}</button><button class="icon-button" type="button" data-action="call" data-id="${escapeHtml(profile.id)}" aria-label="Call ${escapeHtml(profile.name)}">${icon('phone')}</button></div>
    </div>
  </article>`;
}

function filterProfiles() {
  const needle = state.searchTerm.trim().toLowerCase();
  return profiles.filter(profile => {
    const matchesSearch = !needle || `${profile.name} ${profile.city} ${profile.job} ${profile.tags.join(' ')}`.toLowerCase().includes(needle);
    const matchesFilter = state.profileFilter === 'All' || state.profileFilter === 'For you' || (state.profileFilter === 'Nearby' && ['Kano, Kano', 'Kaduna, Kaduna', 'Abuja, FCT'].includes(profile.city)) || (state.profileFilter === 'Online' && profile.online) || (state.profileFilter === 'New' && profile.joined === 'Today');
    const maxAge = state.ageRange === '22–30' ? 30 : state.ageRange === '31–35' ? 35 : state.ageRange === '36–40' ? 40 : 100;
    const minAge = state.ageRange === '31–35' ? 31 : state.ageRange === '36–40' ? 36 : 18;
    return matchesSearch && matchesFilter && profile.age >= minAge && profile.age <= maxAge;
  });
}

function renderDiscover() {
  const action = `<span class="intent-status">${icon('shield')} Marriage-minded</span><button class="secondary-button" type="button" data-action="filters">${icon('sliders')} Filters</button>`;
  const profilesMarkup = filterProfiles().map(profileCard).join('') || `<div class="empty-search"><strong>No introductions just yet</strong>Try a different search or widen your preferences a little.</div>`;
  return `${memberHeading({ eyebrow: 'Thursday, October 8, 2026', title: 'Assalamu alaikum, <em>Fatima</em> <span aria-hidden="true">✦</span>', subtitle: 'A few thoughtful introductions, chosen with your intentions in mind.', action })}
    <div class="member-layout"><section class="member-main">
      <div class="welcome-banner"><div class="banner-copy"><div class="banner-kicker">A sincere connection starts with intention</div><h2>Meet someone who shares what matters.</h2><p>Only verified, opposite-gender profiles are shown here — always with your privacy in mind.</p></div><button class="banner-cta" type="button" data-nav="profile">Strengthen your profile ${icon('arrow')}</button><span class="banner-flower" aria-hidden="true"></span></div>
      <div class="member-quick-stats"><div class="quick-stat"><span class="quick-stat-icon rose">${icon('heart')}</span><span><strong>12</strong><small>New likes for you</small></span></div><div class="quick-stat"><span class="quick-stat-icon">${icon('sparkle')}</span><span><strong>3</strong><small>Thoughtful introductions</small></span></div><div class="quick-stat"><span class="quick-stat-icon gold">${icon('eye')}</span><span><strong>82%</strong><small>Profile completeness</small></span></div></div>
      <div class="section-head"><div><h2>Today’s thoughtful introductions</h2><p>Selected for shared values, intention and the things you care about.</p></div><button class="link-button" type="button" data-action="refresh">Refresh picks ${icon('refresh')}</button></div>
      <div class="filter-row"><div class="filter-tabs" aria-label="Filter introductions">${['All', 'For you', 'Nearby', 'Online'].map(tab => `<button class="filter-tab${state.profileFilter === tab ? ' active' : ''}" type="button" data-filter="${escapeHtml(tab)}">${escapeHtml(tab)}</button>`).join('')}</div><select class="select-control" id="ageFilter" aria-label="Preferred age range"><option${state.ageRange === 'Any age' ? ' selected' : ''}>Any age</option><option${state.ageRange === '22–30' ? ' selected' : ''}>22–30</option><option${state.ageRange === '31–35' ? ' selected' : ''}>31–35</option><option${state.ageRange === '36–40' ? ' selected' : ''}>36–40</option></select></div>
      <div class="profile-grid" id="profileGridMount">${profilesMarkup}</div>
    </section><aside class="member-rail">
      <section class="rail-card journey-card"><div class="journey-top"><h3>Your journey</h3><span class="journey-percent">82%</span></div><div class="progress-track"><div class="progress-fill" style="width:82%"></div></div><div class="journey-caption"><span>Profile strength</span><span>One small step left</span></div><button class="journey-next" type="button" data-nav="profile"><span class="journey-next-icon">${icon('camera')}</span><span><strong>Add a second photo</strong><small>Complete your profile for better matches</small></span><span class="arrow-mini">${icon('right')}</span></button></section>
      <section class="rail-card reminder-card"><div class="rail-card-head"><h3>A gentle reminder</h3><span class="reminder-mark">${icon('sparkle')}</span></div><p>Take your time, ask thoughtful questions, and let trust grow at a pace that feels right for you.</p><div class="reminder-footer">${icon('shield')} Your safety comes first</div></section>
      <section class="rail-card"><div class="rail-card-head"><h3>In your community</h3><button type="button" data-nav="community">View all</button></div><div class="rail-community-item"><img src="${imagePath('portrait-zainab.jpg')}" alt=""><p><strong>Zainab H.</strong> shared a kind reminder for the journey.<small>2 hours ago · 12 replies</small></p></div><div class="rail-community-item"><img src="${imagePath('portrait-mariam.jpg')}" alt=""><p><strong>Mariam Y.</strong> asked: what makes a home feel peaceful?<small>Yesterday · 19 replies</small></p></div><button class="rail-community-link" type="button" data-nav="community">Join the conversation ${icon('arrow')}</button></section>
    </aside></div>`;
}

function renderLikes() {
  const likedProfiles = profiles.filter(profile => state.likedIds.has(profile.id));
  const incoming = [profiles[0], profiles[2]];
  return `${memberHeading({ eyebrow: 'A little appreciation', title: 'Your likes', subtitle: 'See who has noticed your profile, and the people you’d like to know better.', action: `<button class="secondary-button" type="button" data-nav="discover">${icon('discover')} Discover people</button>` })}
    <div class="filter-row"><div class="filter-tabs"><button class="filter-tab active" type="button" data-action="likes-tab" data-tab="received">Received <span class="nav-count">4</span></button><button class="filter-tab" type="button" data-action="likes-tab" data-tab="sent">Sent (${likedProfiles.length})</button><button class="filter-tab" type="button" data-action="likes-tab" data-tab="matches">Matches (${state.matchedIds.size})</button></div><span class="soft-chip">${icon('lock')} Only you can see your likes</span></div>
    <div class="panel"><div class="panel-head"><div><h2>${state.likesTab === 'sent' ? 'People you’ve liked' : state.likesTab === 'matches' ? 'Your mutual connections' : 'People who liked you'}</h2><p>Every connection begins with mutual respect and a little curiosity.</p></div><span class="soft-chip">${icon('heart')} ${state.likesTab === 'sent' ? likedProfiles.length : 4} new this week</span></div><div class="simple-list">${(state.likesTab === 'sent' ? likedProfiles : state.likesTab === 'matches' ? profiles.filter(profile => state.matchedIds.has(profile.id)) : incoming).length ? (state.likesTab === 'sent' ? likedProfiles : state.likesTab === 'matches' ? profiles.filter(profile => state.matchedIds.has(profile.id)) : incoming).map(profile => `<div class="simple-list-item"><div class="role-row"><img src="${imagePath(profile.image)}" alt="" style="width:42px;height:42px;border-radius:50%;object-fit:cover"><div><strong>${escapeHtml(profile.name)}, ${profile.age} · ${escapeHtml(profile.city)}</strong><small>${escapeHtml(profile.job)} · ${profile.score}% compatible · ${state.likesTab === 'received' ? 'Liked your profile today' : 'Your like was sent'}</small></div></div><div style="display:flex;gap:7px"><button class="secondary-button" type="button" data-action="open-profile" data-id="${escapeHtml(profile.id)}">View profile</button><button class="primary-button" type="button" data-action="like" data-id="${escapeHtml(profile.id)}">${icon('heart')}${state.likesTab === 'received' ? 'Like back' : 'Liked'}</button></div></div>`).join('') : '<div class="table-empty">No mutual connections yet. A thoughtful like can be a lovely beginning.</div>'}</div></div>`;
}

function renderMessages() {
  const active = profiles.find(profile => profile.id === state.activeConversation) || profiles[0];
  const messages = messagesByUser[state.activeConversation] || [];
  return `${memberHeading({ eyebrow: 'Thoughtful conversations', title: 'Your messages', subtitle: 'Take the time you need. Your phone number always stays private.', action: '<span class="intent-status">' + icon('lock') + ' Private by design</span>' })}
    <div class="messaging-layout"><aside class="conversation-list"><div class="conversation-list-head"><h2>Conversations</h2><label class="conversation-search">${icon('search')}<input type="search" placeholder="Search conversations" aria-label="Search conversations"></label></div>${conversations.map(conversation => `<button class="conversation-item${state.activeConversation === conversation.id ? ' active' : ''}" type="button" data-action="select-conversation" data-id="${escapeHtml(conversation.id)}"><img src="${imagePath(conversation.image)}" alt=""><span class="conversation-copy"><div><strong>${escapeHtml(conversation.name)}</strong><time>${escapeHtml(conversation.time)}</time></div><p>${escapeHtml(conversation.preview)}</p></span>${conversation.unread ? `<span class="unread-count">${conversation.unread}</span>` : ''}</button>`).join('')}</aside>
    <section class="chat-window"><div class="chat-head"><img src="${imagePath(active.image)}" alt=""><span class="chat-head-copy"><strong>${escapeHtml(active.name)}</strong><small>${active.online ? 'Online now' : 'Last seen recently'} · Matched</small></span><div class="chat-head-actions"><button class="icon-button" type="button" data-action="call" data-id="${escapeHtml(active.id)}" aria-label="Start audio call">${icon('phone')}</button><button class="icon-button" type="button" data-action="video-call" data-id="${escapeHtml(active.id)}" aria-label="Start video call">${icon('video')}</button><button class="icon-button" type="button" data-action="conversation-menu" aria-label="Conversation options">${icon('more')}</button></div></div><div class="chat-scroll" id="chatScroll"><span class="chat-date">Today</span>${messages.map(message => `<div class="message-bubble${message.mine ? ' sent' : ''}">${escapeHtml(message.text)}<time>${escapeHtml(message.time)}</time></div>`).join('')}</div><form class="chat-composer" id="messageForm"><button class="icon-button" type="button" data-action="attach" aria-label="Attach a photo">${icon('paperclip')}</button><input id="messageInput" name="message" type="text" maxlength="2000" autocomplete="off" placeholder="Write a thoughtful message..." aria-label="Write a message"><button class="send-message" type="submit" aria-label="Send message">${icon('send')}</button></form><p class="message-privacy">${icon('shield')} Keep personal details private until you feel comfortable.</p></section></div>`;
}

function renderProfile() {
  return `${memberHeading({ eyebrow: 'Your profile, your story', title: 'My profile', subtitle: 'A little more about you helps us make more thoughtful introductions.', action: '<button class="secondary-button" type="button" data-action="onboarding">' + icon('sparkle') + ' Preview onboarding</button><button class="text-button" type="button" data-action="signout">Sign out</button>' })}
    <div class="member-profile-layout"><section class="panel profile-edit-card"><div class="profile-edit-header"><img src="${imagePath('portrait-aisha.jpg')}" alt="Fatima Bello"><div><h2>Fatima Bello <span class="verified-check">${icon('checkCircle')} Verified</span></h2><p>Member since May 2026 · Kano, Nigeria</p></div><span class="nav-tag" style="margin-left:auto">82% complete</span></div><div class="form-grid"><div class="form-field"><label for="profile-name">Full name</label><input id="profile-name" value="Fatima Bello"></div><div class="form-field"><label for="profile-dob">Date of birth</label><input id="profile-dob" value="14 / 05 / 1999" readonly></div><div class="form-field"><label for="profile-state">State</label><select id="profile-state"><option>Kano</option><option>Abuja FCT</option><option>Kaduna</option></select></div><div class="form-field"><label for="profile-lga">LGA</label><input id="profile-lga" value="Nassarawa"></div><div class="form-field"><label for="profile-education">Education</label><select id="profile-education"><option>University graduate</option><option>Postgraduate</option><option>Undergraduate</option></select></div><div class="form-field"><label for="profile-job">Occupation</label><input id="profile-job" value="Education consultant"></div><div class="form-field"><label for="profile-marital">Marital status</label><select id="profile-marital"><option>Never married</option><option>Divorced</option><option>Widowed</option></select></div><div class="form-field"><label for="profile-languages">Languages</label><input id="profile-languages" value="Hausa, English"></div><div class="form-field full"><label for="profile-about">A little about me</label><textarea id="profile-about">Faith, family and a life of learning matter most to me. I enjoy sharing a home-cooked meal, meaningful conversation and time spent in community. Hoping to meet someone kind, intentional and ready to build a peaceful partnership.</textarea><div class="form-hint">Keep it warm, genuine and personal. 50–500 characters works well.</div></div><div class="form-field full"><label>Profile photos</label><label class="photo-upload-box" for="profilePhotoUpload">${icon('camera')}<span><strong>Add another photo</strong><small>Choose a clear, recent photo. Photos are reviewed before they appear.</small></span><input type="file" id="profilePhotoUpload" accept="image/jpeg,image/png,image/webp" hidden></label></div></div><div class="form-actions"><button class="secondary-button" type="button" data-action="onboarding">Continue profile setup</button><button class="primary-button" type="button" data-action="save-profile">${icon('check')} Save changes</button></div></section>
      <aside class="member-rail"><section class="panel verification-status-card"><div class="verification-status-top"><span class="verification-status-icon">${icon('shieldCheck')}</span><div><h3>Identity verified</h3><p>Your profile has been reviewed. Only verified profiles can appear in discovery.</p></div></div><div class="verification-checklist"><span>${icon('checkCircle')} Selfie and video approved</span><span>${icon('checkCircle')} Profile photo reviewed</span><span>${icon('checkCircle')} Private details protected</span></div><button class="link-button" type="button" data-nav="verification" style="margin-top:12px">View verification history ${icon('arrow')}</button></section><section class="rail-card"><div class="rail-card-head"><h3>Profile strength</h3><span class="journey-percent">82%</span></div><div class="progress-track"><div class="progress-fill" style="width:82%"></div></div><div class="journey-caption"><span>Almost there</span><span>82 / 100</span></div><button class="journey-next" type="button" data-action="onboarding"><span class="journey-next-icon">${icon('image')}</span><span><strong>Add more interests</strong><small>Help us find your shared values</small></span><span class="arrow-mini">${icon('right')}</span></button></section></aside></div>`;
}

function renderVerification() {
  const status = state.apiUser?.verification_status || 'approved';
  if (status !== 'approved') {
    const waiting = ['pending', 'under_review'].includes(status);
    const statusLabel = status.replaceAll('_', ' ');
    const upload = !waiting && state.apiUser;
    return `${memberHeading({ eyebrow: 'A safer, more sincere space', title: 'Your verification', subtitle: 'Your verification video is stored privately and can only be reviewed by authorised staff.', action: `<span class="status-pill ${waiting ? 'review' : status === 'rejected' ? 'rejected' : ''}">${escapeHtml(statusLabel)}</span>` })}<div class="member-profile-layout"><section class="panel profile-edit-card">${waiting ? `<div class="verification-status-top"><span class="verification-status-icon" style="color:#6a8498;background:#eef3f7">${icon('clock')}</span><div><h2 style="margin:2px 0 5px;font-family:var(--font-serif);font-size:23px">Your video is in safe hands.</h2><p style="margin:0;color:#87948a;font-size:9px">A verification officer will review your video and profile. You cannot appear in discovery until the review is approved.</p></div></div><div style="margin-top:20px" class="simple-list"><div class="simple-list-item"><div><strong>Contact verified</strong><small>Email or phone confirmation is complete.</small></div><span class="status-pill approved">Complete</span></div><div class="simple-list-item"><div><strong>Verification review</strong><small>Your private submission is in the authorised review queue.</small></div><span class="status-pill review">${escapeHtml(statusLabel)}</span></div><div class="simple-list-item"><div><strong>Discovery access</strong><small>Unlocks only after staff approval.</small></div><span class="soft-chip">Locked</span></div></div>` : upload ? `<div class="verification-status-top"><span class="verification-status-icon">${icon('shield')}</span><div><h2 style="margin:2px 0 5px;font-family:var(--font-serif);font-size:23px">A quick video helps everyone feel safer.</h2><p style="margin:0;color:#87948a;font-size:9px">Record a short introduction. Only authorised verification officers can view your submission.</p></div></div><form id="verificationForm" enctype="multipart/form-data" style="margin-top:17px"><div class="form-grid"><div class="form-field full"><label for="verificationVideo">Verification video · required</label><input id="verificationVideo" name="video" type="file" accept="video/mp4,video/webm,video/quicktime" required><small class="form-hint">MP4, WebM or MOV · maximum 100 MB · stored outside the public web folder.</small></div><div class="form-field full"><label for="verificationSelfie">Selfie/photo · optional</label><input id="verificationSelfie" name="selfie" type="file" accept="image/jpeg,image/png,image/webp"><small class="form-hint">A clear selfie helps staff compare the video to your profile photo.</small></div><div class="form-field full"><label for="verificationDocument">Identity document · optional</label><input id="verificationDocument" name="id_document" type="file" accept="application/pdf,image/jpeg,image/png,image/webp"><small class="form-hint">PDF, JPG, PNG or WebP · maximum 10 MB · stored privately.</small></div><div class="form-field"><label for="verificationName">Full name</label><input id="verificationName" name="full_name" required value="${escapeHtml(state.apiUser?.name || '')}"></div><div class="form-field"><label for="verificationBirth">Date of birth</label><input id="verificationBirth" name="date_of_birth" type="date" required value="${escapeHtml(state.apiUser?.date_of_birth || '')}"></div><div class="form-field full"><label for="verificationState">State</label><input id="verificationState" name="state" value="${escapeHtml(state.apiUser?.state || '')}" required></div></div>${status === 'rejected' || status === 'resubmission_requested' ? `<div class="soft-chip" style="margin-top:13px">${icon('file')} A reviewer requested an updated submission. Please follow the note sent to your account.</div>` : ''}<div class="form-actions"><button class="primary-button" type="submit">${icon('shieldCheck')} Submit for review</button></div></form>` : `<div class="verification-status-top"><span class="verification-status-icon">${icon('mail')}</span><div><h2 style="margin:2px 0 5px;font-family:var(--font-serif);font-size:23px">Verify your contact first.</h2><p style="margin:0;color:#87948a;font-size:9px">Sign in and verify your email or phone before submitting a private video.</p></div></div><button class="primary-button" type="button" data-action="show-signin" style="margin-top:16px">${icon('lock')} Sign in to continue</button>`}</section><aside class="rail-card"><div class="rail-card-head"><h3>Your privacy matters</h3><span class="reminder-mark" style="color:#62816b;background:#eff5ee">${icon('lock')}</span></div><p style="color:#829087;font-size:9px;line-height:1.7">Verification videos and identity details are never public. Only staff with verification permissions can access a submission, and every review is recorded in the admin audit log.</p><div class="verification-checklist"><span>${icon('checkCircle')} Stored outside public uploads</span><span>${icon('checkCircle')} Access-controlled review</span><span>${icon('checkCircle')} Reviewer action history</span></div></aside></div>`;
  }
  return `${memberHeading({ eyebrow: 'A safer, more sincere space', title: 'Your verification', subtitle: 'Your verification video is stored privately and can only be reviewed by authorised staff.', action: '<span class="intent-status">' + icon('shieldCheck') + ' Approved</span>' })}
    <div class="member-profile-layout"><section class="panel profile-edit-card"><div class="verification-status-top"><span class="verification-status-icon">${icon('shieldCheck')}</span><div><h2 style="margin:2px 0 5px;font-family:var(--font-serif);font-size:23px">You’re verified, Fatima</h2><p style="margin:0;color:#87948a;font-size:9px">Your verified badge helps other members feel confident getting to know you.</p></div></div><div style="margin-top:21px"><div class="section-head"><div><h2 style="font-size:18px">Verification history</h2><p>A transparent record of your review.</p></div><span class="status-pill approved">Approved</span></div><div class="simple-list"><div class="simple-list-item"><div><strong>Video verification</strong><small>Submitted 14 May 2026 · Reviewed by authorised staff</small></div><span class="status-pill approved">Approved</span></div><div class="simple-list-item"><div><strong>Profile photo review</strong><small>Completed 14 May 2026</small></div><span class="status-pill approved">Approved</span></div><div class="simple-list-item"><div><strong>Identity document</strong><small>Optional document not requested</small></div><span class="soft-chip">Not required</span></div></div></div></section><aside class="rail-card"><div class="rail-card-head"><h3>Your privacy matters</h3><span class="reminder-mark" style="color:#62816b;background:#eff5ee">${icon('lock')}</span></div><p style="color:#829087;font-size:9px;line-height:1.7">Verification videos and identity details are never public. Only staff with verification permissions can access a submission, and each review is recorded in the admin audit log.</p><div class="verification-checklist"><span>${icon('checkCircle')} Stored outside public uploads</span><span>${icon('checkCircle')} Access-controlled review</span><span>${icon('checkCircle')} Reviewer action history</span></div></aside></div>`;
}

function renderAuth() {
  return `${memberHeading({ eyebrow: 'A more meaningful kind of introduction', title: 'Welcome to <em>HalalMatch</em>.', subtitle: 'A thoughtful space for Muslim singles looking to build a life with intention.' })}
    <div class="member-profile-layout"><section class="panel profile-edit-card" style="max-width:560px"><div class="eyebrow"><span class="eyebrow-dot"></span>Member sign in</div><h2 style="margin:8px 0 6px;font-family:var(--font-serif);font-size:25px">Good to have you back.</h2><p style="color:#87948a;font-size:9px;margin-bottom:18px">Sign in to continue your journey. Staff accounts are protected with two-factor authentication.</p><form id="loginForm"><div class="form-grid"><div class="form-field full"><label for="loginIdentifier">Email address or phone number</label><input id="loginIdentifier" name="identifier" type="text" required autocomplete="username" placeholder="you@example.com or +234..."></div><div class="form-field full"><label for="loginPassword">Password</label><input id="loginPassword" name="password" type="password" required autocomplete="current-password" placeholder="Your password"></div></div><div class="form-actions" style="justify-content:space-between"><button class="text-button" type="button" data-action="forgot-password">Forgot password?</button><button class="primary-button" type="submit">${icon('lock')} Sign in</button></div></form><div style="margin-top:18px;padding-top:15px;border-top:1px solid #eff1ec;color:#819087;font-size:9px;text-align:center">New to HalalMatch? <button class="link-button" type="button" data-action="show-register">Create an account ${icon('arrow')}</button></div><p style="margin:14px 0 0;color:#9aa59c;font-size:8px;text-align:center">By continuing, you agree to our community and privacy commitments.</p></section><aside class="member-rail"><section class="welcome-banner" style="min-height:190px;display:block;padding:22px"><div class="banner-copy"><div class="banner-kicker">Built around your values</div><h2>Trust first. Always.</h2><p>Verified members, intentional introductions and privacy in every conversation.</p></div><span class="banner-flower" aria-hidden="true"></span></section><section class="rail-card"><div class="rail-card-head"><h3>What makes it different?</h3>${icon('shield')}</div><div class="verification-checklist"><span>${icon('checkCircle')} Verified profiles only in discovery</span><span>${icon('checkCircle')} Your contact details stay private</span><span>${icon('checkCircle')} Staff permissions are reviewed and logged</span></div></section></aside></div>`;
}

function renderOtp() {
  return `${memberHeading({ eyebrow: 'One secure step', title: 'Verify your <em>contact</em>.', subtitle: 'We sent a six-digit code to the email address or phone number on your account.' })}<div class="panel profile-edit-card" style="max-width:520px"><div class="verification-status-top"><span class="verification-status-icon">${icon('mail')}</span><div><h2 style="margin:2px 0 5px;font-family:var(--font-serif);font-size:20px">Check your inbox</h2><p style="margin:0;color:#87948a;font-size:9px">The code expires after 10 minutes. It is never shared with other members.</p></div></div><form id="otpForm" style="margin-top:18px"><div class="form-field"><label for="otpCode">Six-digit verification code</label><input id="otpCode" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required placeholder="000000" style="letter-spacing:5px;font-size:18px;text-align:center"></div><div class="form-actions" style="justify-content:space-between"><button class="text-button" type="button" data-action="resend-otp">Resend code</button><button class="primary-button" type="submit">Verify contact ${icon('arrow')}</button></div></form><div class="journey-next" style="margin-top:16px"><span class="journey-next-icon">${icon('shield')}</span><span><strong>Your profile stays private</strong><small>Discovery stays locked until your profile is approved.</small></span></div></div>`;
}

function renderAdminTwoFactor() {
  const setup = state.adminTwoFactorMode === 'setup';
  return `${memberHeading({ eyebrow: 'Administrator security', title: setup ? 'Set up two-factor <em>authentication</em>.' : 'Confirm it’s <em>you</em>.', subtitle: setup ? 'Protect the administrator workspace with an authenticator app.' : 'Enter the current code from your authenticator app to continue.' })}<div class="panel profile-edit-card" style="max-width:540px"><div class="verification-status-top"><span class="verification-status-icon">${icon('lock')}</span><div><h2 style="margin:2px 0 5px;font-family:var(--font-serif);font-size:20px">${setup ? 'Authenticator setup required' : 'Two-factor check'}</h2><p style="margin:0;color:#87948a;font-size:9px">Administrator access is not available until this security step is complete.</p></div></div>${setup ? `<div class="setting-group" style="margin-top:17px"><h3>Authenticator secret</h3><p>Add this secret to your authenticator app, then confirm a current six-digit code.</p><div style="padding:12px;border-radius:8px;background:#f4f7f2;color:#355640;font-family:monospace;font-size:11px;word-break:break-all">${escapeHtml(state.adminSetupSecret || 'Loading secure setup…')}</div></div>` : ''}<form id="adminTwoFactorForm" style="margin-top:17px"><div class="form-field"><label for="adminTotpCode">Authenticator code</label><input id="adminTotpCode" name="code" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" placeholder="000000" style="letter-spacing:5px;font-size:18px;text-align:center"></div><div class="form-actions"><button class="primary-button" type="submit">${setup ? 'Enable and continue' : 'Verify and continue'} ${icon('arrow')}</button></div></form></div>`;
}

function renderMember() {
  const pages = { discover: renderDiscover, likes: renderLikes, messages: renderMessages, community: renderCommunity, profile: renderProfile, verification: renderVerification, onboarding: renderOnboarding, login: renderAuth, register: renderOnboarding, otp: renderOtp, 'admin-2fa': renderAdminTwoFactor };
  return (pages[state.route] || renderDiscover)();
}

function renderCommunity() {
  const filteredPosts = state.communityFilter === 'For you' ? state.posts : state.communityFilter === 'Following' ? state.posts.slice(0, 2) : [...state.posts].reverse();
  return `${memberHeading({ eyebrow: 'Good conversations, shared with care', title: 'Community', subtitle: 'A welcoming space for advice, reflection and the things that bring us together.', action: '<button class="primary-button" type="button" data-action="compose-post">' + icon('plus') + ' Create a post</button>' })}
    <div class="community-layout"><section class="community-main"><div class="panel post-composer"><div class="composer-top"><img src="${imagePath('portrait-aisha.jpg')}" alt=""><button type="button" class="composer-input" data-action="compose-post">Share a thought, Fatima…</button></div><div class="composer-tools"><button type="button" data-action="compose-post">${icon('image')} Photo</button><button type="button" data-action="compose-post">${icon('video')} Video</button><button type="button" data-action="compose-post">${icon('sparkle')} Ask the community</button><button type="button" data-action="compose-post">${icon('calendar')} Create an event</button></div></div>
      <div class="community-filter"><h2>Community feed</h2><div class="filter-tabs">${['For you', 'Following', 'Latest'].map(label => `<button class="filter-tab${state.communityFilter === label ? ' active' : ''}" type="button" data-action="community-filter" data-filter="${escapeHtml(label)}">${escapeHtml(label)}</button>`).join('')}</div></div>
      <div id="communityFeed">${filteredPosts.map(renderPost).join('')}</div></section><aside class="community-rail"><section class="panel community-guidelines"><h3>A space with care</h3><p>Keep this community thoughtful, welcoming and safe for everyone.</p><div class="guideline-list"><span>${icon('checkCircle')} Speak with kindness and respect</span><span>${icon('checkCircle')} Protect personal information</span><span>${icon('checkCircle')} Report content that feels unsafe</span></div><button class="link-button" type="button" data-action="guidelines" style="margin-top:12px">Read community guidelines ${icon('arrow')}</button></section><section class="rail-card"><div class="rail-card-head"><h3>Popular this week</h3><span class="nav-tag">COMMUNITY</span></div><div class="rail-community-item"><span class="journey-next-icon">${icon('book')}</span><p><strong>Building a peaceful home</strong><small>128 members talking · 42 replies</small></p></div><div class="rail-community-item"><span class="journey-next-icon">${icon('users')}</span><p><strong>Family & first introductions</strong><small>87 members talking · 21 replies</small></p></div></section><section class="rail-card reminder-card"><div class="rail-card-head"><h3>Keep it respectful</h3><span class="reminder-mark">${icon('shield')}</span></div><p>Community sharing creates public links only for community posts. Your matching profile and conversations stay private.</p></section></aside></div>`;
}

function renderPost(post) {
  return `<article class="panel post-card" data-post="${escapeHtml(post.id)}"><div class="post-head"><img src="${imagePath(post.image)}" alt=""><div class="post-author"><strong>${escapeHtml(post.author)} ${post.verified ? icon('checkCircle') : ''}</strong><small>${escapeHtml(post.time)} · ${escapeHtml(post.location)} <span aria-hidden="true">·</span> Community</small></div><button class="post-more" type="button" data-action="post-menu" data-id="${escapeHtml(post.id)}" aria-label="More post options">${icon('more')}</button></div><p class="post-text">${escapeHtml(post.text).replace(/#([\w]+)/g, '<span class="hashtag">#$1</span>')}</p>${post.imageUrl ? `<img class="post-image" src="${escapeHtml(post.imageUrl)}" alt="Community post attachment">` : ''}<div class="post-stats"><span>${icon('heart')} ${post.likes} appreciations</span><span>${post.comments} comments</span></div><div class="post-actions"><button class="post-action${post.liked ? ' liked' : ''}" type="button" data-action="like-post" data-id="${escapeHtml(post.id)}">${icon('heart')} Appreciate</button><button class="post-action" type="button" data-action="comment-post" data-id="${escapeHtml(post.id)}">${icon('comment')} Comment</button><button class="post-action" type="button" data-action="share-post" data-id="${escapeHtml(post.id)}">${icon('share')} Share</button></div></article>`;
}

function renderOnboarding() {
  const steps = ['Your details', 'About you', 'Your preferences', 'Photos & verification'];
  const step = state.onboardingStep;
  const d = state.onboardingData;
  let fields = '';
  if (step === 0) fields = `<div class="form-grid"><div class="form-field full"><label for="on-name">Full name</label><input id="on-name" name="full_name" required value="${escapeHtml(d.full_name || '')}" placeholder="As you’d like to be known"></div><div class="form-field"><label for="on-gender">Account type</label><select id="on-gender" name="gender" required><option value="">Choose one</option><option value="female"${d.gender === 'female' ? ' selected' : ''}>Female</option><option value="male"${d.gender === 'male' ? ' selected' : ''}>Male</option></select></div><div class="form-field"><label for="on-dob">Date of birth</label><input id="on-dob" name="date_of_birth" type="date" required value="${escapeHtml(d.date_of_birth || '')}"><small class="form-hint">You must be 18 or older to join.</small></div><div class="form-field"><label for="on-email">Email address</label><input id="on-email" name="email" type="email" value="${escapeHtml(d.email || '')}" placeholder="you@example.com"></div><div class="form-field"><label for="on-phone">Phone number</label><input id="on-phone" name="phone" type="tel" value="${escapeHtml(d.phone || '')}" placeholder="+234 800 000 0000"></div><div class="form-field"><label for="on-state">State</label><select id="on-state" name="state" required><option value="">Choose your state</option>${['Abuja FCT', 'Kano', 'Kaduna', 'Lagos', 'Katsina', 'Sokoto', 'Other'].map(value => `<option${d.state === value ? ' selected' : ''}>${value}</option>`).join('')}</select></div><div class="form-field"><label for="on-lga">LGA</label><input id="on-lga" name="lga" value="${escapeHtml(d.lga || '')}" placeholder="Local government area"></div><div class="form-field full"><label for="on-password">Create a password</label><input id="on-password" name="password" type="password" minlength="10" required value="${escapeHtml(d.password || '')}" placeholder="At least 10 characters"><small class="form-hint">Use a unique password with at least 10 characters.</small></div></div>`;
  if (step === 1) fields = `<div class="form-grid"><div class="form-field"><label for="on-education">Education</label><select id="on-education" name="education"><option value="">Select education</option>${['Secondary school', 'Diploma', 'University graduate', 'Postgraduate', 'Other'].map(value => `<option${d.education === value ? ' selected' : ''}>${value}</option>`).join('')}</select></div><div class="form-field"><label for="on-occupation">Occupation</label><input id="on-occupation" name="occupation" value="${escapeHtml(d.occupation || '')}" placeholder="What do you do?"></div><div class="form-field"><label for="on-marital">Marital status</label><select id="on-marital" name="marital_status"><option value="">Select status</option>${['Never married', 'Divorced', 'Widowed'].map(value => `<option${d.marital_status === value ? ' selected' : ''}>${value}</option>`).join('')}</select></div><div class="form-field"><label for="on-religious">Religious practice</label><select id="on-religious" name="religious_practice"><option value="">Choose what feels right</option>${['Practising', 'Learning and growing', 'Prefer not to say'].map(value => `<option${d.religious_practice === value ? ' selected' : ''}>${value}</option>`).join('')}</select></div><div class="form-field full"><label for="on-languages">Languages</label><input id="on-languages" name="languages" value="${escapeHtml(d.languages || '')}" placeholder="e.g. Hausa, English, Arabic"></div><div class="form-field full"><label for="on-about">About me</label><textarea id="on-about" name="about_me" maxlength="600" placeholder="Share a little about your values, interests and the life you hope to build.">${escapeHtml(d.about_me || '')}</textarea><small class="form-hint">Share only what you’re comfortable making visible after verification.</small></div></div>`;
  if (step === 2) fields = `<div class="form-grid"><div class="form-field"><label for="on-marriage">Marriage intention</label><select id="on-marriage" name="marriage_intention"><option value="">Choose intention</option>${['Ready to meet my person', 'Marriage within 1–2 years', 'Marriage-minded, taking my time'].map(value => `<option${d.marriage_intention === value ? ' selected' : ''}>${value}</option>`).join('')}</select></div><div class="form-field"><label for="on-age">Preferred age range</label><select id="on-age" name="preferred_age_range"><option>22–30</option><option>25–35</option><option>28–40</option><option>Open to discussion</option></select></div><div class="form-field"><label for="on-location">Preferred location</label><select id="on-location" name="preferred_location"><option>Northern Nigeria</option><option>Anywhere in Nigeria</option><option>My state</option><option>Open to discussion</option></select></div><div class="form-field"><label for="on-education-pref">Education preference</label><select id="on-education-pref" name="education_preference"><option>Similar or higher education</option><option>Open to all</option><option>Prefer not to say</option></select></div><div class="form-field full"><label for="on-interests">Interests and values</label><input id="on-interests" name="interests" value="${escapeHtml(d.interests || '')}" placeholder="Family, reading, faith, travel…"><small class="form-hint">Your preferences are private and only used to guide introductions.</small></div></div>`;
  if (step === 3) fields = `<div class="form-grid"><div class="form-field full"><label>Profile photo</label><label class="photo-upload-box" for="on-photo">${icon('camera')}<span><strong>Choose a clear, recent photo</strong><small>JPG, PNG or WebP · reviewed before the profile is shown</small></span><input id="on-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" hidden></label></div><div class="form-field full"><label>Video verification</label><label class="photo-upload-box" for="on-video">${icon('video')}<span><strong>Submit a private verification video</strong><small>MP4, MOV or WebM · securely stored for an authorised reviewer only</small></span><input id="on-video" name="video" type="file" accept="video/mp4,video/webm,video/quicktime" hidden></label></div><div class="form-field full"><label class="photo-upload-box" style="border-style:solid">${icon('shieldCheck')}<span><strong>Your privacy is protected</strong><small>Unapproved profiles never appear in discovery. Your phone number is never shown to another member.</small></span></label></div></div>`;
  return `${memberHeading({ eyebrow: 'A thoughtful beginning', title: 'Let’s make this <em>yours</em>.', subtitle: 'A few gentle steps help us introduce you to the right people.', action: '<button class="text-button" type="button" data-nav="profile">Save and finish later</button>' })}
    <div class="member-profile-layout"><section class="panel profile-edit-card"><div class="section-head"><div><div class="eyebrow">Step ${step + 1} of ${steps.length}</div><h2 class="section-title" style="margin-top:7px">${steps[step]}</h2><p>Your information stays private until you choose to share it.</p></div><span class="journey-percent">${Math.round((step + 1) / steps.length * 100)}%</span></div><div class="progress-track" style="margin-bottom:20px"><div class="progress-fill" style="width:${(step + 1) / steps.length * 100}%"></div></div><form id="onboardingForm"><div class="form-grid">${fields}</div><div class="form-actions" style="justify-content:space-between"><button class="secondary-button" type="button" data-action="onboarding-back" ${step === 0 ? 'disabled' : ''}>${icon('right')} Back</button><button class="primary-button" type="submit">${step === steps.length - 1 ? icon('check') : ''}${step === steps.length - 1 ? 'Create my profile' : 'Continue'}${step < steps.length - 1 ? icon('arrow') : ''}</button></div></form></section><aside class="member-rail"><section class="rail-card"><div class="rail-card-head"><h3>Your steps</h3>${icon('shield')}</div>${steps.map((label, index) => `<div class="journey-next" style="margin-top:${index ? '0' : '2px'};padding-top:${index ? '10px' : '0'};border-top:${index ? '1px solid #edf0eb' : '0'}"><span class="journey-next-icon" style="color:${index < step ? '#4c805c' : index === step ? '#876b3d' : '#a0aaa2'};background:${index < step ? '#edf5eb' : index === step ? '#f8f2e8' : '#f3f5f2'}">${icon(index < step ? 'check' : index === step ? 'sparkle' : 'lock')}</span><span><strong>${escapeHtml(label)}</strong><small>${index < step ? 'Complete' : index === step ? 'In progress' : 'Up next'}</small></span></div>`).join('')}</section><section class="rail-card reminder-card"><div class="rail-card-head"><h3>Built around intention</h3><span class="reminder-mark">${icon('sparkle')}</span></div><p>We’ll only show your profile to approved members of the opposite gender, based on your preferences.</p></section></aside></div>`;
}

function adminHeading(title, subtitle, action = '', eyebrow = 'Platform overview') {
  return `<div class="page-heading admin-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span>${escapeHtml(eyebrow)}</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div><div class="heading-actions">${action}</div></div>`;
}

function metricCard({ label, value, trend, iconName, tone = '', caption }) {
  return `<article class="metric-card"><div class="metric-card-top"><span class="metric-icon ${tone}">${icon(iconName)}</span>${trend ? `<span class="metric-trend${trend.startsWith('-') ? ' down' : ''}">${icon(trend.startsWith('-') ? 'trend' : 'trend')}${escapeHtml(trend)}</span>` : ''}</div><div class="metric-value">${escapeHtml(value)}</div><div class="metric-label">${escapeHtml(label)}</div>${caption ? `<div class="metric-caption">${caption}</div>` : ''}</article>`;
}

function statusClass(status) {
  const normalized = String(status).toLowerCase();
  if (normalized.includes('approv') || normalized === 'active' || normalized === 'paid' || normalized === 'resolved') return 'approved';
  if (normalized.includes('reject') || normalized.includes('suspend') || normalized.includes('failed')) return 'rejected';
  if (normalized.includes('review') || normalized.includes('pending') || normalized.includes('scheduled')) return 'review';
  return '';
}

function verificationTable(items, compact = false) {
  return `<div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Member</th><th>Location</th><th>Submitted</th><th>Status</th><th>Reviewer</th><th>Action</th></tr></thead><tbody>${items.map(item => `<tr data-search-row="${escapeHtml(`${item.user} ${item.city} ${item.id} ${item.status}`.toLowerCase())}"><td><div class="user-cell"><img src="${imagePath(item.image)}" alt=""><span><strong>${escapeHtml(item.user)}</strong><small>${escapeHtml(item.id)} · ${item.age} · ${escapeHtml(item.gender)}</small></span></div></td><td>${escapeHtml(item.city)}</td><td>${escapeHtml(item.submitted)}</td><td><span class="status-pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td><td>${escapeHtml(item.reviewer)}</td><td><div class="table-actions"><button class="mini-action" type="button" data-action="review" data-id="${escapeHtml(item.id)}" aria-label="Review ${escapeHtml(item.user)}">${icon('eye')}</button>${compact ? '' : `<button class="mini-action approve" type="button" data-action="review-decision" data-id="${escapeHtml(item.id)}" data-decision="approve" aria-label="Approve ${escapeHtml(item.user)}">${icon('check')}</button>`}</div></td></tr>`).join('')}</tbody></table>${items.length ? '' : '<div class="table-empty">No verification requests in this view.</div>'}</div>`;
}

function renderAdminOverview() {
  const live = state.dashboardData;
  const number = (key, fallback) => live && live[key] !== undefined ? Number(live[key]).toLocaleString('en-NG') : fallback;
  const revenue = live ? `₦${(Number(live.revenue_minor_month || 0) / 100).toLocaleString('en-NG')}` : '₦4.82m';
  const stats = [
    { label: 'Total members', value: number('users_total', '18,420'), trend: live ? '' : '+12.8%', iconName: 'users', tone: '', caption: live ? '<b>Live count</b> active member accounts' : '<b>+2,084</b> members this quarter' },
    { label: 'Verified members', value: number('verified_users', '15,986'), trend: live ? '' : '+8.2%', iconName: 'shieldCheck', tone: 'blue', caption: live ? '<b>Approved</b> profiles in discovery' : '<b>86.8%</b> of active accounts' },
    { label: 'Pending verification', value: number('pending_verification', '86'), trend: live ? '' : '18 priority', iconName: 'clock', tone: 'sand', caption: live ? '<b>Pending</b> officer review' : '<b>12</b> waiting longer than 24 hours' },
    { label: 'Revenue this month', value: revenue, trend: live ? '' : '+17.4%', iconName: 'coins', tone: 'coral', caption: live ? '<b>Verified</b> successful payments' : '<b>₦812k</b> from new subscriptions' }
  ];
  const pulses = [['Male users', number('male_users', '10,240')], ['Female users', number('female_users', '8,180')], ['Rejected profiles', number('rejected_profiles', '312')], ['Pending payments', number('pending_payments', '13')]];
  const pulseChips = [['Active matches', number('active_matches', '2,416')], ['Messages today', number('messages_today', '1,284')], ['Calls today', number('calls_today', '96')], ['Community posts', number('community_posts', '3,840')], ['Reports to review', number('reports_open', '29')], ['Subscriptions', number('subscriptions_active', '4,206')], ['Active campaigns', number('active_campaigns', '4')], ['Active advertisements', number('active_advertisements', '18')]];
  const top = `<div class="page-heading admin-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span>Thursday, October 8, 2026 · System health <span class="status-pill approved" style="padding:4px 7px;margin-left:4px">All systems normal</span></div><h1>Good morning, Ibrahim</h1><p>Here’s what’s happening across HalalMatch today.</p></div><div class="heading-actions"><button class="secondary-button" type="button" data-action="export-report">${icon('file')} Export report</button><button class="primary-button" type="button" data-action="create-campaign">${icon('plus')} New campaign</button></div></div>`;
  return `${top}<div class="metric-grid">${stats.map(metricCard).join('')}</div><div class="admin-submetrics">${pulses.map(([label, value]) => `<div class="admin-submetric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>
    <div class="filter-row" style="margin:0 1px 11px"><div class="eyebrow">A live view across your platform</div><div class="heading-actions"><span class="soft-chip">${icon('clock')} Updated just now</span></div></div><div class="feature-admin-grid" style="grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:17px">${pulseChips.map(([label, value], index) => `<div class="stat-card"><span>${escapeHtml(label)}</span><strong style="font-size:16px">${escapeHtml(value)}</strong></div>`).join('')}</div>
    <div class="admin-content-grid"><section class="panel"><div class="panel-head"><div><h2>Verification queue</h2><p>New submissions from members seeking approval.</p></div><button class="link-button" type="button" data-nav="admin:verification">Open queue ${icon('arrow')}</button></div>${verificationTable(state.queue.filter(item => ['Pending', 'Under review'].includes(item.status)).slice(0, 4), true)}<div class="panel-foot"><span>Showing the latest 4 of 86 pending requests</span><button class="link-button" type="button" data-nav="admin:verification">Review all ${icon('arrow')}</button></div></section>
    <section class="panel feature-summary"><div class="feature-summary-head"><div><h3>Feature controls</h3><p>Modules currently available</p></div><button type="button" data-nav="admin:features">Manage all</button></div>${state.features.filter(feature => ['registration', 'video_verification', 'messaging', 'community', 'gifts'].includes(feature.key)).map(feature => `<div class="feature-line"><div class="feature-line-label"><span class="feature-line-icon">${icon(feature.icon)}</span><span>${escapeHtml(feature.label)}</span></div><button class="switch${feature.enabled ? ' on' : ''}" type="button" role="switch" aria-checked="${feature.enabled}" data-action="toggle-feature" data-key="${escapeHtml(feature.key)}" aria-label="Toggle ${escapeHtml(feature.label)}"></button></div>`).join('')}</section></div>`;
}

function renderAdminVerification() {
  const counts = [
    ['Pending review', '86'], ['Under review', '18'], ['Approved today', '142'], ['Rejected this month', '312']
  ];
  const filtered = state.verificationFilter === 'All' ? state.queue : state.queue.filter(item => item.status === state.verificationFilter);
  return `${adminHeading('Verification review', 'Review video and profile submissions with care. Every decision is recorded.', `<button class="secondary-button" type="button" data-action="export-report">${icon('file')} Export queue</button>`, 'Member safety · Verification')}<div class="stat-strip">${counts.map(([label, value]) => `<div class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div><div class="panel"><div class="table-toolbar"><div class="filter-tabs">${['All', 'Pending', 'Under review', 'Approved', 'Rejected'].map(label => `<button class="filter-tab${state.verificationFilter === label ? ' active' : ''}" type="button" data-action="verification-filter" data-filter="${escapeHtml(label)}">${escapeHtml(label)}</button>`).join('')}</div><label class="table-search">${icon('search')}<input type="search" id="adminTableSearch" placeholder="Search member or ID…" value="${escapeHtml(state.adminSearch)}"></label></div>${verificationTable(filtered)}<div class="panel-foot"><span>All verification videos are private and access-controlled.</span><span>${filtered.length} sample records · 86 open requests</span></div></div>`;
}

function renderAdminPhotos() {
  return `${adminHeading('Profile photo review', 'Approve clear, recent member photos before they appear on a verified profile.', '<button class="secondary-button" type="button" data-action="export-report">' + icon('file') + ' Export queue</button>', 'Member safety · Photo review')}<div class="stat-strip"><div class="stat-card"><span>Photos awaiting review</span><strong>${state.pendingPhotos.length || 0}</strong></div><div class="stat-card"><span>Approved today</span><strong>218</strong></div><div class="stat-card"><span>Rejected this month</span><strong>74</strong></div><div class="stat-card"><span>Average review time</span><strong>22 min</strong></div></div><div class="panel"><div class="panel-head"><div><h2>Pending profile photos</h2><p>Uploaded photos remain private until approved by a verification officer.</p></div><span class="status-pill review">${state.pendingPhotos.length} pending</span></div><div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Member</th><th>Location</th><th>Uploaded</th><th>Preview</th><th>Actions</th></tr></thead><tbody>${state.pendingPhotos.map(photo => `<tr data-search-row="${escapeHtml(`${photo.user} ${photo.location} ${photo.id}`.toLowerCase())}"><td><div class="user-cell"><img src="${imagePath(photo.image)}" alt=""><span><strong>${escapeHtml(photo.user)}</strong><small>${escapeHtml(photo.id)}</small></span></div></td><td>${escapeHtml(photo.location)}</td><td>${escapeHtml(photo.uploaded)}</td><td><button class="mini-action" type="button" data-action="preview-photo" data-id="${escapeHtml(photo.id)}" aria-label="Preview profile photo">${icon('eye')}</button></td><td><div class="table-actions"><button class="mini-action approve" type="button" data-action="photo-decision" data-id="${escapeHtml(photo.id)}" data-decision="approve" aria-label="Approve photo">${icon('check')}</button><button class="mini-action reject" type="button" data-action="photo-decision" data-id="${escapeHtml(photo.id)}" data-decision="reject" aria-label="Reject photo">${icon('close')}</button></div></td></tr>`).join('')}</tbody></table>${state.pendingPhotos.length ? '' : '<div class="table-empty">No photos are waiting for review.</div>'}</div><div class="panel-foot"><span>Private uploads are never visible to other members until approved.</span><span>All photo review actions are logged.</span></div></div>`;
}

function renderAdminUsers() {
  const rows = state.users.map(user => `<tr data-search-row="${escapeHtml(`${user.id} ${user.name} ${user.gender} ${user.city} ${user.status}`.toLowerCase())}"><td><div class="user-cell"><img src="${imagePath(user.image)}" alt=""><span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.id)}</small></span></div></td><td>${escapeHtml(user.gender)}</td><td>${escapeHtml(user.city)}</td><td>${escapeHtml(user.joined)}</td><td><span class="status-pill ${statusClass(user.status)}">${escapeHtml(user.status)}</span></td><td><div class="table-actions"><button class="mini-action" type="button" data-action="user-detail" data-id="${escapeHtml(user.id)}" aria-label="View ${escapeHtml(user.name)}">${icon('eye')}</button><button class="mini-action" type="button" data-action="user-menu" data-id="${escapeHtml(user.id)}" aria-label="More user actions">${icon('more')}</button></div></td></tr>`).join('');
  return `${adminHeading('Member directory', 'Manage accounts, approval status and member safety.', `<button class="secondary-button" type="button" data-action="export-report">${icon('file')} Export users</button>`, 'Platform management · Users')}<div class="stat-strip"><div class="stat-card"><span>Total members</span><strong>18,420</strong></div><div class="stat-card"><span>Male members</span><strong>10,240</strong></div><div class="stat-card"><span>Female members</span><strong>8,180</strong></div><div class="stat-card"><span>Suspended</span><strong>47</strong></div></div><div class="panel"><div class="table-toolbar"><div class="filter-tabs">${['All members', 'Male', 'Female', 'Verified', 'Pending'].map((label, index) => `<button class="filter-tab${index === 0 ? ' active' : ''}" type="button" data-action="user-filter" data-filter="${escapeHtml(label)}">${escapeHtml(label)}</button>`).join('')}</div><label class="table-search">${icon('search')}<input id="adminTableSearch" type="search" placeholder="Search name, ID or location…" value="${escapeHtml(state.adminSearch)}"></label></div><div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Member</th><th>Gender</th><th>Location</th><th>Joined</th><th>Account status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div><div class="panel-foot"><span>Showing 6 recent accounts</span><span>Page 1 of 3,070</span></div></div>`;
}

function renderAdminFeatures() {
  return `${adminHeading('Feature controls', 'Turn product modules on or off without changing application code.', '<button class="secondary-button" type="button" data-action="save-settings">' + icon('check') + ' Save changes</button>', 'Platform controls · Feature engine')}<div class="panel-head" style="padding:13px 16px;margin-bottom:13px;border:1px solid #e8ece6;border-radius:12px;background:#fff"><div><h2 style="font-size:16px">Availability by module</h2><p>Changes are applied centrally and recorded in the audit log.</p></div><span class="soft-chip">${icon('lock')} ${state.features.filter(item => item.enabled).length} enabled · ${state.features.filter(item => !item.enabled).length} off</span></div><div class="feature-admin-grid">${state.features.map(feature => `<article class="feature-admin-card"><div class="feature-admin-card-head"><span class="feature-line-icon" style="width:31px;height:31px">${icon(feature.icon)}</span><button class="switch${feature.enabled ? ' on' : ''}" type="button" role="switch" aria-checked="${feature.enabled}" data-action="toggle-feature" data-key="${escapeHtml(feature.key)}" aria-label="Toggle ${escapeHtml(feature.label)}"></button></div><h3>${escapeHtml(feature.label)}</h3><p>${escapeHtml(feature.detail)}</p><div class="feature-admin-card-foot"><span>feature.${escapeHtml(feature.key)}</span><span class="status-pill ${feature.enabled ? 'approved' : ''}" style="padding:4px 7px">${feature.enabled ? 'Enabled' : 'Disabled'}</span></div></article>`).join('')}</div>`;
}

function renderAdminMatching() {
  const weights = [
    ['age_compatibility', 'Age compatibility', 20], ['location', 'Location', 15], ['marriage_intention', 'Marriage intention', 15], ['education', 'Education', 10], ['religion_practice', 'Religion & practice', 15], ['shared_interests', 'Shared interests', 10], ['languages', 'Languages', 5], ['lifestyle', 'Lifestyle', 10]
  ];
  return `${adminHeading('Matching engine', 'Tune compatibility signals and keep discovery safe by default.', '<button class="primary-button" type="button" data-action="save-settings">' + icon('check') + ' Save matching rules</button>', 'Platform controls · Matching')}<div class="admin-content-layout"><section><div class="setting-group"><h3>Compatibility weights</h3><p>Weights are used to calculate a member’s compatibility score. Total should equal 100%.</p>${weights.map(([key, label, fallback]) => { const weight = Number(state.matchingWeights?.find(item => item.weight_key === key)?.weight ?? fallback); return `<div class="setting-row"><span><strong>${escapeHtml(label)}</strong><small>Influence in the member compatibility score</small></span><span class="weight-control"><input type="range" min="0" max="30" value="${weight}" data-weight="${escapeHtml(key)}"><b>${weight}%</b></span></div>`; }).join('')}<div class="setting-row"><span><strong>Total score weight</strong><small>All compatibility weights combined</small></span><span class="status-pill approved" id="weightTotal">100% total</span></div></div><div class="setting-group"><h3>Discovery safeguards</h3><p>These checks run on the server before a profile can be discovered.</p>${[['Only approved profiles are discoverable', true], ['Opposite-gender discovery rule', true], ['Hide blocked or reported accounts', true], ['Require age 18+ for all accounts', true]].map(([label, enabled]) => `<div class="setting-row"><span><strong>${escapeHtml(label)}</strong><small>Enforced for every discovery request</small></span><button class="switch${enabled ? ' on' : ''}" type="button" role="switch" aria-checked="${enabled}" data-action="safeguard-toggle" data-key="${escapeHtml(label)}"></button></div>`).join('')}</div></section><aside class="content-note"><h3>A considered introduction</h3><p>Members see an explanation alongside their compatibility score, not only a number. Scores never override safety, privacy or a member’s preferences.</p><div class="note-line"><span>Age & location</span><strong>35%</strong></div><div class="note-line"><span>Intention & values</span><strong>30%</strong></div><div class="note-line"><span>Education & interests</span><strong>20%</strong></div><div class="note-line"><span>Language & lifestyle</span><strong>15%</strong></div><div style="margin-top:16px;padding:12px;border-radius:10px;background:#f4f7f1;color:#718278;font-size:8px;line-height:1.6">${icon('shield')} Every matching query excludes unapproved, suspended, self, blocked and opposite-preference-incompatible profiles.</div></aside></div>`;
}

function renderAdminCommunity() {
  const reports = [
    ['RP-10382', 'Public post', 'Harassment', 'Zainab H.', '23 min ago', 'Open'],
    ['RP-10377', 'Comment', 'Personal information', 'M. Ibrahim', '1 hr ago', 'Under review'],
    ['RP-10361', 'Community post', 'Spam', 'A. Bello', '4 hrs ago', 'Open'],
    ['RP-10349', 'Profile', 'Impersonation', 'S. Yusuf', 'Yesterday', 'Resolved']
  ];
  return `${adminHeading('Community & moderation', 'Support positive conversation and respond quickly to member reports.', '<button class="secondary-button" type="button" data-action="export-report">' + icon('file') + ' Export reports</button>', 'Trust & safety · Community')}<div class="stat-strip"><div class="stat-card"><span>Posts this month</span><strong>3,840</strong></div><div class="stat-card"><span>Open reports</span><strong>29</strong></div><div class="stat-card"><span>Avg. response time</span><strong>1.8 hrs</strong></div><div class="stat-card"><span>Removed this month</span><strong>114</strong></div></div><div class="admin-content-layout"><div class="panel"><div class="panel-head"><div><h2>Member reports</h2><p>Reports are private and visible only to authorised moderators.</p></div><span class="status-pill review">29 open</span></div><div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Report</th><th>Content type</th><th>Reason</th><th>Reported member</th><th>Received</th><th>Status</th><th></th></tr></thead><tbody>${reports.map(row => `<tr data-search-row="${escapeHtml(row.join(' ').toLowerCase())}"><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td><td>${escapeHtml(row[3])}</td><td>${escapeHtml(row[4])}</td><td><span class="status-pill ${statusClass(row[5])}">${escapeHtml(row[5])}</span></td><td><button class="mini-action" data-action="moderate-report" type="button" aria-label="Review report">${icon('eye')}</button></td></tr>`).join('')}</tbody></table></div></div><aside class="content-note"><h3>Moderation principles</h3><p>Keep human review at the centre. Use the least restrictive action that resolves the concern, and record your decision.</p>${[['Posts reviewed today', '81'], ['Accounts actioned', '14'], ['Staff on duty', '6']].map(([label, value]) => `<div class="note-line"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}<button class="secondary-button" style="width:100%;margin-top:14px" type="button" data-action="guidelines">${icon('file')} Open moderator guide</button></aside></div>`;
}

function renderAdminMessages() {
  const calls = [
    ['CL-28211', 'Audio call', 'M. Bello · K. Musa', '12 min', 'Completed', 'Today, 10:42'],
    ['CL-28207', 'Video call', 'F. Aliyu · O. Sule', '28 min', 'Completed', 'Today, 10:18'],
    ['CL-28191', 'Audio call', 'A. Ibrahim · Z. Hassan', '—', 'Unanswered', 'Today, 09:55'],
    ['CL-28162', 'Video call', 'S. Yusuf · M. Ahmed', '6 min', 'Completed', 'Yesterday']
  ];
  return `${adminHeading('Messages & calls', 'Monitor platform health without exposing private conversation content.', '<button class="secondary-button" type="button" data-action="export-report">' + icon('file') + ' Export logs</button>', 'Platform activity · Communication')}<div class="stat-strip"><div class="stat-card"><span>Messages today</span><strong>1,284</strong></div><div class="stat-card"><span>Audio calls today</span><strong>64</strong></div><div class="stat-card"><span>Video calls today</span><strong>32</strong></div><div class="stat-card"><span>Reports this week</span><strong>11</strong></div></div><div class="panel"><div class="panel-head"><div><h2>Recent call logs</h2><p>Call metadata only. No call audio or private messages are exposed here.</p></div><div class="filter-tabs"><button class="filter-tab active" type="button">All calls</button><button class="filter-tab" type="button">Audio</button><button class="filter-tab" type="button">Video</button></div></div><div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Call ID</th><th>Type</th><th>Participants</th><th>Duration</th><th>Status</th><th>Started</th><th></th></tr></thead><tbody>${calls.map(row => `<tr data-search-row="${escapeHtml(row.join(' ').toLowerCase())}">${row.map((cell, index) => `<td>${index === 4 ? `<span class="status-pill ${statusClass(cell)}">${escapeHtml(cell)}</span>` : escapeHtml(cell)}</td>`).join('')}<td><button class="mini-action" data-action="call-detail" type="button">${icon('eye')}</button></td></tr>`).join('')}</tbody></table></div><div class="panel-foot"><span>Calls are end-to-end private; only operational metadata is retained.</span><button class="link-button" type="button" data-action="call-settings">Call settings ${icon('arrow')}</button></div></div>`;
}

function renderAdminPayments() {
  const transactions = [
    ['TX-892061', 'Amina Bello', 'Premium · Monthly', '₦2,500', 'Paystack', 'Successful', 'Oct 08, 2026'],
    ['TX-892054', 'Musa Ibrahim', 'VIP · Annual', '₦20,000', 'Flutterwave', 'Successful', 'Oct 08, 2026'],
    ['TX-892047', 'Zainab Hassan', 'Premium Plus · 3 months', '₦6,000', 'Paystack', 'Pending', 'Oct 08, 2026'],
    ['TX-892032', 'Khalid Musa', 'Profile boost', '₦1,200', 'Paystack', 'Failed', 'Oct 07, 2026']
  ];
  return `${adminHeading('Payments & subscriptions', 'Review transactions, manage plans and configure payment providers securely.', '<button class="secondary-button" type="button" data-action="export-report">' + icon('file') + ' Export transactions</button>', 'Business · Payments')}<div class="stat-strip"><div class="stat-card"><span>Revenue this month</span><strong>₦4.82m</strong></div><div class="stat-card"><span>Active subscriptions</span><strong>4,206</strong></div><div class="stat-card"><span>Pending payments</span><strong>13</strong></div><div class="stat-card"><span>Refunds this month</span><strong>₦82,500</strong></div></div><div class="admin-content-layout"><section class="panel"><div class="panel-head"><div><h2>Recent transactions</h2><p>Webhook-verified payment records.</p></div><span class="soft-chip">${icon('lock')} Secure</span></div><div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Transaction</th><th>Member</th><th>Item</th><th>Amount</th><th>Provider</th><th>Status</th><th>Date</th></tr></thead><tbody>${transactions.map(row => `<tr data-search-row="${escapeHtml(row.join(' ').toLowerCase())}"><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td><td>${escapeHtml(row[3])}</td><td>${escapeHtml(row[4])}</td><td><span class="status-pill ${statusClass(row[5])}">${escapeHtml(row[5])}</span></td><td>${escapeHtml(row[6])}</td></tr>`).join('')}</tbody></table></div><div class="panel-foot"><span>Secret and webhook keys never enter frontend JavaScript.</span><button class="link-button" type="button" data-action="subscription-plans">Manage plans ${icon('arrow')}</button></div></section><aside class="panel feature-summary"><div class="feature-summary-head"><div><h3>Payment providers</h3><p>Credentials are encrypted server-side.</p></div>${icon('lock')}</div>${[['Paystack', 'Enabled'], ['Flutterwave', 'Enabled']].map(([name, status]) => `<div class="feature-line"><div class="feature-line-label"><span class="feature-line-icon">${icon('wallet')}</span><span>${name}<small style="display:block;margin-top:2px;color:#a0aaa2;font-size:7px">Public key · Secret key · Webhook</small></span></div><span class="status-pill approved">${status}</span></div>`).join('')}<button class="secondary-button" type="button" data-nav="admin:settings" style="width:100%;margin-top:10px">${icon('settings')} Provider settings</button></aside></div>`;
}

function renderAdminCampaigns() {
  return `${adminHeading('Campaign management', 'Create targeted campaigns and measure meaningful outcomes.', '<button class="primary-button" type="button" data-action="create-campaign">' + icon('plus') + ' Create campaign</button>', 'Growth · Campaigns')}<div class="stat-strip"><div class="stat-card"><span>Active campaigns</span><strong>${state.campaigns.filter(item => item.status === 'Active').length}</strong></div><div class="stat-card"><span>Impressions this month</span><strong>146.8k</strong></div><div class="stat-card"><span>Registrations from campaigns</span><strong>1,284</strong></div><div class="stat-card"><span>Verified conversions</span><strong>846</strong></div></div><div class="panel"><div class="panel-head"><div><h2>All campaigns</h2><p>Audience, schedule and performance in one place.</p></div><button class="secondary-button" type="button" data-action="campaign-analytics">${icon('chart')} Analytics</button></div><div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Campaign</th><th>Target audience</th><th>Dates</th><th>Reach</th><th>Registrations</th><th>Status</th><th></th></tr></thead><tbody>${state.campaigns.map((campaign, index) => `<tr data-search-row="${escapeHtml(`${campaign.name} ${campaign.target} ${campaign.status}`.toLowerCase())}"><td><div class="role-row"><span class="role-icon ${campaign.accent}">${icon(index === 0 ? 'sparkle' : 'campaign')}</span><span><strong>${escapeHtml(campaign.name)}</strong><small>${index === 0 ? 'CAM-0082' : `CAM-008${index}`}</small></span></div></td><td>${escapeHtml(campaign.target)}</td><td>${escapeHtml(campaign.dates)}</td><td>${escapeHtml(campaign.reach)}</td><td>${escapeHtml(campaign.registrations)}</td><td><span class="status-pill ${statusClass(campaign.status)}">${escapeHtml(campaign.status)}</span></td><td><button class="mini-action" type="button" data-action="campaign-detail" data-id="${index}">${icon('more')}</button></td></tr>`).join('')}</tbody></table></div><div class="panel-foot"><span>Attribution: registered → verified → matched.</span><button class="link-button" type="button" data-action="campaign-analytics">View campaign analytics ${icon('arrow')}</button></div></div>`;
}

function renderAdminAds() {
  const placements = [['Homepage', '3 active'], ['Discovery', '5 active'], ['Community feed', '7 active'], ['Profile page', '2 active'], ['Messages', '1 active']];
  return `${adminHeading('Advertisement management', 'Manage placements, creative review and delivery performance.', '<button class="primary-button" type="button" data-action="create-ad">' + icon('plus') + ' Create advertisement</button>', 'Growth · Advertisements')}<div class="stat-strip"><div class="stat-card"><span>Active ads</span><strong>18</strong></div><div class="stat-card"><span>Impressions this month</span><strong>284k</strong></div><div class="stat-card"><span>Clicks</span><strong>8,204</strong></div><div class="stat-card"><span>Click-through rate</span><strong>2.9%</strong></div></div><div class="admin-content-layout"><section class="panel"><div class="panel-head"><div><h2>Creative review & delivery</h2><p>Only approved advertising appears to members.</p></div><span class="status-pill review">1 in review</span></div><div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Advertisement</th><th>Type</th><th>Placement</th><th>Impressions</th><th>Clicks</th><th>Status</th><th></th></tr></thead><tbody>${state.ads.map(ad => `<tr data-search-row="${escapeHtml(`${ad.name} ${ad.type} ${ad.placement} ${ad.status}`.toLowerCase())}"><td><div class="role-row"><img src="${imagePath(ad.image)}" alt="" style="width:29px;height:29px;border-radius:7px;object-fit:cover"><strong>${escapeHtml(ad.name)}</strong></div></td><td>${escapeHtml(ad.type)}</td><td>${escapeHtml(ad.placement)}</td><td>${escapeHtml(ad.impressions)}</td><td>${escapeHtml(ad.clicks)}</td><td><span class="status-pill ${statusClass(ad.status)}">${escapeHtml(ad.status)}</span></td><td><button class="mini-action" type="button" data-action="ad-detail">${icon('more')}</button></td></tr>`).join('')}</tbody></table></div></section><aside class="panel feature-summary"><div class="feature-summary-head"><div><h3>Ad placements</h3><p>Member experience locations</p></div><button type="button" data-action="placements">Manage</button></div>${placements.map(([label, count]) => `<div class="feature-line"><div class="feature-line-label"><span class="feature-line-icon">${icon('ad')}</span><span>${label}</span></div><span style="color:#7c8e81;font-size:8px;white-space:nowrap">${count}</span></div>`).join('')}</aside></div>`;
}

function renderAdminSupport() {
  const tickets = [
    ['TK-24081', 'Maryam Y.', 'Account verification delay', 'High', 'Open', '12 min ago'],
    ['TK-24077', 'Khalid M.', 'Subscription payment question', 'Normal', 'In progress', '42 min ago'],
    ['TK-24051', 'Amina B.', 'Profile photo review', 'Normal', 'Open', '2 hrs ago'],
    ['TK-24029', 'Musa I.', 'Report a safety concern', 'Urgent', 'Escalated', '3 hrs ago']
  ];
  return `${adminHeading('Support & complaints', 'Help members feel heard and route sensitive concerns to the right team.', '<button class="secondary-button" type="button" data-action="export-report">' + icon('file') + ' Export tickets</button>', 'Member care · Support')}<div class="stat-strip"><div class="stat-card"><span>Open tickets</span><strong>42</strong></div><div class="stat-card"><span>Urgent concerns</span><strong>3</strong></div><div class="stat-card"><span>Avg. first response</span><strong>24 min</strong></div><div class="stat-card"><span>Resolved this week</span><strong>186</strong></div></div><div class="panel"><div class="panel-head"><div><h2>Recent tickets</h2><p>Private member details are only visible to authorised support roles.</p></div><div class="filter-tabs"><button class="filter-tab active" type="button">All tickets</button><button class="filter-tab" type="button">Urgent</button><button class="filter-tab" type="button">Open</button></div></div><div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Ticket</th><th>Member</th><th>Subject</th><th>Priority</th><th>Status</th><th>Received</th><th></th></tr></thead><tbody>${tickets.map(row => `<tr data-search-row="${escapeHtml(row.join(' ').toLowerCase())}"><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td><td><span class="status-pill ${row[3] === 'Urgent' ? 'rejected' : row[3] === 'High' ? 'review' : ''}">${escapeHtml(row[3])}</span></td><td><span class="status-pill ${statusClass(row[4])}">${escapeHtml(row[4])}</span></td><td>${escapeHtml(row[5])}</td><td><button class="mini-action" type="button" data-action="ticket-detail">${icon('eye')}</button></td></tr>`).join('')}</tbody></table></div><div class="panel-foot"><span>Safety concerns are escalated to Support and Trust & Safety.</span><button class="link-button" type="button" data-action="ticket-settings">Support settings ${icon('arrow')}</button></div></div>`;
}

function renderAdminStaff() {
  return `${adminHeading('Staff & permissions', 'A database-driven RBAC system keeps access clear and accountable.', '<button class="primary-button" type="button" data-action="create-role">' + icon('plus') + ' Create a role</button>', 'Platform governance · Staff')}<div class="panel-head" style="padding:13px 16px;margin-bottom:13px;border:1px solid #e8ece6;border-radius:12px;background:#fff"><div><h2 style="font-size:16px">Platform roles</h2><p>Grant the minimum permissions each team needs. Super Admin can create additional roles.</p></div><span class="soft-chip">${icon('lock')} Role-based access control</span></div><div class="feature-admin-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${state.roles.map(role => `<article class="feature-admin-card"><div class="feature-admin-card-head"><span class="role-icon">${icon(role.icon)}</span><span class="role-count">${role.users} members</span></div><h3>${escapeHtml(role.name)}</h3><p>${escapeHtml(role.description)}</p><div class="feature-admin-card-foot"><span>${role.permissions.length === 1 && role.permissions[0] === '*' ? 'Full access' : `${role.permissions.length} permissions`}</span><button class="link-button" type="button" data-action="role-detail" data-id="${escapeHtml(role.name)}">Manage ${icon('arrow')}</button></div></article>`).join('')}</div><div class="panel" style="margin-top:16px"><div class="panel-head"><div><h2>Recent staff activity</h2><p>Account and role changes are included in the audit log.</p></div><button class="link-button" type="button" data-nav="admin:audit">Open audit log ${icon('arrow')}</button></div><div class="simple-list">${[['S. Ahmed', 'Verification Officer', 'Reviewed 18 submissions', '4 min ago'], ['I. Adeyemi', 'Super Admin', 'Updated matching weights', '32 min ago'], ['N. Bello', 'Moderator', 'Resolved a community report', '1 hr ago']].map(row => `<div class="simple-list-item"><div class="role-row"><span class="role-icon">${icon('user')}</span><span><strong>${escapeHtml(row[0])} · ${escapeHtml(row[1])}</strong><small>${escapeHtml(row[2])}</small></span></div><span style="color:#98a39a;font-size:8px">${escapeHtml(row[3])}</span></div>`).join('')}</div></div>`;
}

function renderAdminSettings() {
  return `${adminHeading('Platform settings & security', 'Control payment providers, verification policy and core platform settings.', '<button class="primary-button" type="button" data-action="save-settings">' + icon('check') + ' Save settings</button>', 'Platform governance · Settings')}<div class="admin-content-layout"><section>
    <div class="setting-group"><h3>General & onboarding</h3><p>Start with a clear, accessible experience for every member.</p>${[['Platform name', 'HalalMatchmaking'], ['Support email', 'support@halalmatch.example'], ['Minimum member age', '18'], ['Administrator two-factor authentication', 'Required']].map(([label, value], i) => `<div class="setting-row"><span><strong>${escapeHtml(label)}</strong><small>${i === 3 ? 'Required for all staff and administrators' : 'Visible settings and service defaults'}</small></span>${i === 3 ? '<span class="status-pill approved">Enabled</span>' : `<input class="setting-input" type="${i === 2 ? 'number' : 'text'}" value="${escapeHtml(value)}">`}</div>`).join('')}</div>
    <div class="setting-group"><h3>Payment providers</h3><p>Keys are saved server-side and encrypted at rest. Secret keys are never returned to the browser.</p>${[['Paystack'], ['Flutterwave']].map(([provider]) => { const key = provider.toLowerCase(); const saved = state.paymentProviders?.[key]; const connected = Boolean(saved?.secret_configured); return `<div class="setting-row"><span><strong>${escapeHtml(provider)}</strong><small>Public key</small></span><input class="setting-input" type="text" data-payment-provider="${key}" data-payment-field="public_key" value="${escapeHtml(saved?.public_key || '')}" placeholder="Enter public key" aria-label="${escapeHtml(provider)} public key"><span class="status-pill ${connected ? 'approved' : ''}">${connected ? 'Connected' : 'Not connected'}</span></div><div class="setting-row"><span><strong>${escapeHtml(provider)} secret key</strong><small>Write-only · saved securely</small></span><input class="setting-input" type="password" data-payment-provider="${key}" data-payment-field="secret_key" placeholder="${connected ? 'Saved securely · leave blank to keep' : 'Enter secret key'}" autocomplete="new-password" aria-label="${escapeHtml(provider)} secret key"></div><div class="setting-row"><span><strong>${escapeHtml(provider)} webhook secret</strong><small>Server-side signature check</small></span><input class="setting-input" type="password" data-payment-provider="${key}" data-payment-field="webhook_secret" placeholder="${saved?.webhook_secret_configured ? 'Saved securely · leave blank to keep' : 'Enter webhook secret'}" autocomplete="new-password" aria-label="${escapeHtml(provider)} webhook secret"></div>${key === 'flutterwave' ? `<div class="setting-row"><span><strong>Encryption key</strong><small>Write-only · saved securely</small></span><input class="setting-input" type="password" data-payment-provider="flutterwave" data-payment-field="encryption_key" placeholder="${saved?.encryption_key_configured ? 'Saved securely · leave blank to keep' : 'Enter encryption key'}" autocomplete="new-password"></div>` : ''}`; }).join('')}</div>
    <div class="setting-group"><h3>Security safeguards</h3><p>Keep private member information and admin actions protected.</p>${[['Admin two-factor authentication', true], ['Login activity and session controls', true], ['Private verification storage', true], ['Webhook signature verification', true], ['Audit all sensitive staff actions', true]].map(([label, enabled]) => `<div class="setting-row"><span><strong>${escapeHtml(label)}</strong><small>Recommended baseline security control</small></span><button class="switch${enabled ? ' on' : ''}" role="switch" type="button" aria-checked="${enabled}" data-action="safeguard-toggle" data-key="${escapeHtml(label)}"></button></div>`).join('')}</div>
    </section><aside><div class="content-note"><h3>Safe by default</h3><p>Verification videos use private storage, and reviewers receive access only through an authorised backend route. Payment secrets are write-only and must never be placed in a public JavaScript file.</p><div class="note-line"><span>Last security review</span><strong>Oct 01, 2026</strong></div><div class="note-line"><span>Admin 2FA coverage</span><strong>100%</strong></div><div class="note-line"><span>Active staff sessions</span><strong>18</strong></div></div><div class="content-note" style="margin-top:13px"><h3>Matching settings</h3><p>Fine-tune match weights and discovery safeguards.</p><button class="secondary-button" type="button" data-nav="admin:matching" style="width:100%;margin-top:12px">${icon('sliders')} Matching controls</button></div></aside></div>`;
}

function renderAdminAudit() {
  const logs = [
    ['Ibrahim Adeyemi', 'Verification approved', 'User #USR-04871 · VR-4801', '197.210.55.18', 'Today · 10:34'],
    ['S. Ahmed', 'Verification rejected', 'User #USR-04848 · VR-4788', '105.112.32.91', 'Today · 10:18'],
    ['Ibrahim Adeyemi', 'Matching weights updated', 'Location weight: 10% → 15%', '197.210.55.18', 'Today · 09:42'],
    ['N. Bello', 'Community report resolved', 'Report #RP-10349 · Content removed', '41.190.12.67', 'Yesterday'],
    ['Ibrahim Adeyemi', 'Staff role created', 'Community Safety Reviewer', '197.210.55.18', 'Oct 07 · 16:21']
  ];
  return `${adminHeading('Admin audit log', 'Accountability for every sensitive platform action.', '<button class="secondary-button" type="button" data-action="export-report">' + icon('file') + ' Export audit log</button>', 'Security · Audit')}<div class="stat-strip"><div class="stat-card"><span>Actions today</span><strong>248</strong></div><div class="stat-card"><span>Staff members active</span><strong>18</strong></div><div class="stat-card"><span>Security alerts</span><strong>0</strong></div><div class="stat-card"><span>Retention period</span><strong>365 days</strong></div></div><div class="panel"><div class="panel-head"><div><h2>Recent administrator actions</h2><p>Action, target, IP and timestamp are captured. Before/after values are retained for changes.</p></div><span class="soft-chip">${icon('lock')} Append-only log</span></div><div class="queue-table-wrap"><table class="data-table"><thead><tr><th>Administrator</th><th>Action</th><th>Target / change</th><th>IP address</th><th>Date & time</th></tr></thead><tbody>${logs.map(row => `<tr data-search-row="${escapeHtml(row.join(' ').toLowerCase())}"><td>${escapeHtml(row[0])}</td><td><strong>${escapeHtml(row[1])}</strong></td><td>${escapeHtml(row[2])}</td><td>${escapeHtml(row[3])}</td><td>${escapeHtml(row[4])}</td></tr>`).join('')}</tbody></table></div><div class="panel-foot"><span>Audit entries cannot be edited or removed from this dashboard.</span><span>Last event: just now</span></div></div>`;
}

function renderAdmin() {
  const pages = {
    'admin:overview': renderAdminOverview,
    'admin:verification': renderAdminVerification,
    'admin:photos': renderAdminPhotos,
    'admin:users': renderAdminUsers,
    'admin:matching': renderAdminMatching,
    'admin:community': renderAdminCommunity,
    'admin:messages': renderAdminMessages,
    'admin:payments': renderAdminPayments,
    'admin:campaigns': renderAdminCampaigns,
    'admin:ads': renderAdminAds,
    'admin:support': renderAdminSupport,
    'admin:staff': renderAdminStaff,
    'admin:features': renderAdminFeatures,
    'admin:settings': renderAdminSettings,
    'admin:audit': renderAdminAudit
  };
  return (pages[state.route] || renderAdminOverview)();
}

function toast(title, message = '') {
  const region = $('#toastRegion');
  if (!region) return;
  const element = document.createElement('div');
  element.className = 'toast';
  element.innerHTML = `<span class="toast-icon">${icon('check')}</span><span><strong>${escapeHtml(title)}</strong>${message ? `<p>${escapeHtml(message)}</p>` : ''}</span>`;
  region.appendChild(element);
  window.setTimeout(() => element.remove(), 3600);
}

function closeModal() {
  $('#modalRoot').innerHTML = '';
  state.modalOpen = false;
}

function showModal(content, className = '') {
  const root = $('#modalRoot');
  if (!root) return;
  state.modalOpen = true;
  root.innerHTML = `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal-card ${className}" role="dialog" aria-modal="true"><button class="modal-close" type="button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button>${content}</section></div>`;
  window.setTimeout(() => $('input, textarea, select, button', root)?.focus(), 30);
}

function showProfile(profileId) {
  const profile = profiles.find(item => item.id === profileId);
  if (!profile) return;
  showModal(`<div class="modal-profile-hero"><img src="${imagePath(profile.image)}" alt="${escapeHtml(profile.name)}"><div class="modal-profile-title"><h2>${escapeHtml(profile.name)}, ${profile.age}</h2><p>${icon('location')} ${escapeHtml(profile.city)} · ${escapeHtml(profile.job)}</p></div></div><div class="modal-profile-body"><div class="profile-summary"><span>${icon('sparkle')} ${profile.score}% compatibility</span><span class="verified-check">${icon('checkCircle')} Verified</span></div><p>${escapeHtml(profile.about)}</p><div class="detail-chips">${profile.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}<span>${escapeHtml(profile.education)}</span></div><div class="simple-list"><div class="simple-list-item"><div><strong>Marriage intention</strong><small>${escapeHtml(profile.intention)}</small></div></div><div class="simple-list-item"><div><strong>Languages & practice</strong><small>${escapeHtml(profile.language)} · ${escapeHtml(profile.religion)}</small></div></div><div class="simple-list-item"><div><strong>Shared interests</strong><small>${escapeHtml(profile.interests.join(' · '))}</small></div></div></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="message" data-id="${escapeHtml(profile.id)}">${icon('message')} Message</button><button class="primary-button" type="button" data-action="like" data-id="${escapeHtml(profile.id)}">${icon('heart')} Send a like</button></div></div>`, 'profile-detail-modal');
}

function showReviewModal(requestId) {
  const request = state.queue.find(item => item.id === requestId);
  if (!request) return;
  showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Verification request · ${escapeHtml(request.id)}</div><h2 style="margin-top:8px">Review ${escapeHtml(request.user)}</h2><p>Review the submitted video and member information. This private submission is visible only to authorised staff and the access is audit logged.</p><div class="role-row" style="margin-bottom:14px"><img src="${imagePath(request.image)}" alt="" style="width:50px;height:50px;border-radius:50%;object-fit:cover"><span><strong>${escapeHtml(request.user)}, ${request.age} · ${escapeHtml(request.gender)}</strong><small>${escapeHtml(request.job)} · ${escapeHtml(request.city)} · Submitted ${escapeHtml(request.submitted)}</small></span><span class="status-pill ${statusClass(request.status)}" style="margin-left:auto">${escapeHtml(request.status)}</span></div><div class="review-video-placeholder">${icon(request.video ? 'play' : 'video')}<span><strong>Private verification video</strong><small>${request.video ? 'Reviewer access is checked server-side. Demo preview contains no real video.' : 'No verification video was submitted.'}</small>${request.video ? `<button class="link-button" type="button" data-action="preview-video" data-id="${escapeHtml(request.id)}" style="margin:8px auto 0">Open access-controlled preview ${icon('arrow')}</button>` : ''}</span></div><div class="form-grid" style="margin-top:14px"><div class="form-field"><label>Profile photo</label><div class="soft-chip">${icon('checkCircle')} Submitted · reviewed</div></div><div class="form-field"><label>Identity details</label><div class="soft-chip">${icon('lock')} Private · staff only</div></div><div class="form-field full"><label for="reviewReason">Review note or rejection reason</label><textarea id="reviewReason" name="reason" placeholder="Required when rejecting or requesting resubmission"></textarea></div></div><div class="modal-actions" style="justify-content:space-between"><button class="danger-button" type="button" data-action="review-decision" data-id="${escapeHtml(request.id)}" data-decision="suspend">${icon('ban')} Suspend</button><span style="display:flex;gap:7px"><button class="secondary-button" type="button" data-action="review-decision" data-id="${escapeHtml(request.id)}" data-decision="request_resubmission">Request resubmission</button><button class="danger-button" type="button" data-action="review-decision" data-id="${escapeHtml(request.id)}" data-decision="reject">Reject</button><button class="primary-button" type="button" data-action="review-decision" data-id="${escapeHtml(request.id)}" data-decision="approve">${icon('check')} Approve</button></span></div></div>`);
}

function showPhotoReviewModal(photoId) {
  const photo = state.pendingPhotos.find(item => item.id === photoId);
  if (!photo) return;
  showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Profile photo · ${escapeHtml(photo.id)}</div><h2 style="margin-top:8px">Review ${escapeHtml(photo.user)}’s photo</h2><p>Only approved photos may appear on the member’s verified profile.</p><img src="${imagePath(photo.image)}" alt="Private profile photo submitted by ${escapeHtml(photo.user)}" style="width:100%;max-height:340px;object-fit:contain;border-radius:12px;background:#f3f5ef"><p style="margin:10px 0 0">${escapeHtml(photo.location)} · Uploaded ${escapeHtml(photo.uploaded)}</p><div class="form-field" style="margin-top:13px"><label for="photoReviewReason">Review note (required when rejecting)</label><textarea id="photoReviewReason" placeholder="Explain what should be changed"></textarea></div><div class="modal-actions"><button class="danger-button" type="button" data-action="photo-decision" data-id="${escapeHtml(photo.id)}" data-decision="reject">${icon('close')} Reject photo</button><button class="primary-button" type="button" data-action="photo-decision" data-id="${escapeHtml(photo.id)}" data-decision="approve">${icon('check')} Approve photo</button></div></div>`);
}

function showFilterModal() {
  const selectedRange = state.ageRange;
  showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Discovery preferences</div><h2 style="margin-top:8px">Your kind of introduction</h2><p>Adjust your discovery filters. Your private preferences are never shown on your public profile.</p><form id="filterForm"><div class="form-grid"><div class="form-field"><label for="filter-age">Age range</label><select id="filter-age" name="age"><option${selectedRange === 'Any age' ? ' selected' : ''}>Any age</option><option${selectedRange === '22–30' ? ' selected' : ''}>22–30</option><option${selectedRange === '31–35' ? ' selected' : ''}>31–35</option><option${selectedRange === '36–40' ? ' selected' : ''}>36–40</option></select></div><div class="form-field"><label for="filter-location">Location</label><select id="filter-location" name="location"><option>Northern Nigeria</option><option>My state</option><option>Anywhere in Nigeria</option></select></div><div class="form-field full"><label>What matters to you?</label><div class="detail-chips"><span>Marriage intention</span><span>Shared values</span><span>Languages</span><span>Education</span></div></div><div class="form-field full"><span class="soft-chip">${icon('shield')} Discovery only includes approved opposite-gender profiles</span></div></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">Apply preferences</button></div></form></div>`);
}

function showPostComposer() {
  showModal(`<div class="modal-content post-modal"><div class="eyebrow"><span class="eyebrow-dot"></span>Community · Share with care</div><h2 style="margin-top:8px">Start a conversation</h2><p>Your community post is separate from your private matchmaking profile.</p><form id="postForm"><div class="form-field"><label for="postContent">What would you like to share?</label><textarea id="postContent" name="content" maxlength="1200" required placeholder="Share a thought, ask a question or offer a kind reminder…"></textarea></div><div class="form-field" style="margin-top:12px"><label>Audience</label><div class="soft-chip">${icon('globe')} HalalMatch community · Public share link</div></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">${icon('share')} Publish post</button></div></form></div>`);
}

function showCreateModal(type) {
  if (type === 'campaign') {
    showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Growth tools · Campaigns</div><h2 style="margin-top:8px">Create a campaign</h2><p>Set an audience and schedule. Campaign targeting never exposes private member profiles.</p><form id="campaignForm"><div class="form-grid"><div class="form-field full"><label for="campaignName">Campaign name</label><input id="campaignName" name="name" required placeholder="e.g. Ramadan Marriage Campaign"></div><div class="form-field"><label for="campaignStart">Start date</label><input id="campaignStart" name="start" type="date" required></div><div class="form-field"><label for="campaignEnd">End date</label><input id="campaignEnd" name="end" type="date" required></div><div class="form-field"><label for="campaignTarget">Audience</label><select id="campaignTarget" name="target"><option>All members · Nigeria</option><option>Northern Nigeria · 22–40</option><option>Abuja FCT · 24–38</option><option>New members · Nationwide</option></select></div><div class="form-field"><label for="campaignStatus">Status</label><select id="campaignStatus" name="status"><option>Scheduled</option><option>Active</option><option>Draft</option></select></div></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">${icon('plus')} Save campaign</button></div></form></div>`);
  } else if (type === 'ad') {
    showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Growth tools · Advertisements</div><h2 style="margin-top:8px">Create an advertisement</h2><p>New creative is reviewed before any member sees it.</p><form id="adForm"><div class="form-grid"><div class="form-field full"><label for="adName">Advertisement name</label><input id="adName" name="name" required placeholder="Campaign or advertiser name"></div><div class="form-field"><label for="adType">Ad type</label><select id="adType" name="type"><option>Banner</option><option>Image</option><option>Video</option><option>Sponsored post</option><option>Featured profile</option></select></div><div class="form-field"><label for="adPlacement">Placement</label><select id="adPlacement" name="placement"><option>Homepage</option><option>Discovery</option><option>Community feed</option><option>Profile page</option><option>Dashboard</option></select></div><div class="form-field full"><label for="adBudget">Budget (₦)</label><input id="adBudget" name="budget" type="number" min="1000" placeholder="Enter budget"></div></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">Submit for review</button></div></form></div>`);
  }
}

function showRoleModal() {
  showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Role-based access control</div><h2 style="margin-top:8px">Create a staff role</h2><p>Choose a clear name and grant only the permissions this team needs.</p><form id="roleForm"><div class="form-field"><label for="roleName">Role name</label><input id="roleName" name="name" required placeholder="e.g. Community Safety Reviewer"></div><div class="form-field" style="margin-top:12px"><label for="roleDescription">Responsibility</label><textarea id="roleDescription" name="description" placeholder="What should this role be able to do?"></textarea></div><div class="form-field" style="margin-top:12px"><label for="rolePermission">Starter permission set</label><select id="rolePermission" name="permission"><option value="community.view">Community view & moderation</option><option value="verification.view">Verification view</option><option value="users.view">Member support view</option><option value="payments.view">Finance view</option><option value="ads.analytics">Advertisements analytics</option></select></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">${icon('plus')} Create role</button></div></form></div>`);
}

function showCommentModal(postId) {
  const post = state.posts.find(item => item.id === postId);
  if (!post) return;
  showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Community conversation</div><h2 style="margin-top:8px">Join the conversation</h2><p>${escapeHtml(post.author)}’s post · ${post.comments} replies so far.</p><form id="commentForm" data-id="${escapeHtml(post.id)}"><div class="form-field"><label for="commentContent">Your reply</label><textarea id="commentContent" name="content" required maxlength="600" placeholder="Share a thoughtful reply…"></textarea></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">${icon('send')} Reply</button></div></form></div>`);
}

async function requestApi(route, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  if (state.csrfToken && options.method && options.method.toUpperCase() !== 'GET') headers['X-CSRF-Token'] = state.csrfToken;
  const [routePath, routeQuery] = route.split('?', 2);
  const endpoint = `api.php?route=${encodeURIComponent(routePath)}${routeQuery ? `&${routeQuery}` : ''}`;
  const response = await fetch(endpoint, { method: options.method || 'GET', credentials: 'same-origin', headers, body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'The request could not be completed.');
  return payload;
}

function isModalAction(name) {
  return ['close-modal', 'review', 'review-decision', 'filters', 'compose-post', 'create-campaign', 'create-ad', 'create-role', 'comment-post'].includes(name);
}

async function handleClick(event) {
  const nav = event.target.closest('[data-nav]');
  if (nav) {
    event.preventDefault();
    const route = nav.dataset.nav;
    if (route.startsWith('admin:') && state.backendAvailable && !state.apiUser?.is_admin) { toast('Administrator access required', 'Sign in with an authorised staff account to open the control centre.'); return; }
    if (route.startsWith('admin:')) state.workspace = 'admin';
    else state.workspace = 'member';
    if (route === 'register') { state.route = 'onboarding'; state.onboardingMode = 'register'; state.onboardingStep = 0; state.onboardingData = {}; }
    else state.route = route;
    state.searchTerm = '';
    if ($('#globalSearch')) $('#globalSearch').value = '';
    render();
    if (state.modalOpen) closeModal();
    hydrateWorkspace();
    return;
  }

  const profileFilter = event.target.closest('button[data-filter]');
  if (profileFilter && state.workspace === 'member' && state.route === 'discover' && !profileFilter.dataset.action) {
    state.profileFilter = profileFilter.dataset.filter || 'All';
    render();
    return;
  }

  const button = event.target.closest('[data-action]');
  if (!button) {
    if (document.body.classList.contains('sidebar-open') && !event.target.closest('#sidebar')) document.body.classList.remove('sidebar-open');
    if (event.target.classList.contains('modal-backdrop')) closeModal();
    if (!event.target.closest('.notification-popover') && !event.target.closest('[data-action="notifications"]')) {
      const popover = $('.notification-popover');
      if (popover) popover.remove();
    }
    return;
  }
  const action = button.dataset.action;
  const id = button.dataset.id || '';

  if (action === 'toggle-sidebar') { document.body.classList.toggle('sidebar-open'); return; }
  if (action === 'switch-workspace') { closeModal(); setWorkspace(state.workspace === 'member' ? 'admin' : 'member'); return; }
  if (action === 'profile') { state.route = state.workspace === 'admin' ? 'admin:staff' : 'profile'; render(); return; }
  if (action === 'show-register') { state.workspace = 'member'; state.route = 'onboarding'; state.onboardingMode = 'register'; state.onboardingStep = 0; state.onboardingData = {}; render(); return; }
  if (action === 'show-signin') { state.workspace = 'member'; state.route = 'login'; render(); return; }
  if (action === 'signout') {
    if (state.backendAvailable) { try { await requestApi('logout', { method: 'POST', body: {} }); } catch (error) { /* The local sign-out still completes if the session has expired. */ } }
    state.apiUser = null; state.workspace = 'member'; state.route = 'login'; render(); toast('You’re signed out', 'Your session has ended.'); return;
  }
  if (action === 'resend-otp') {
    if (!state.backendAvailable) { toast('OTP delivery is not connected', 'Connect the PHP API and an email or SMS sender to test verification.'); return; }
    try { const result = await requestApi('contact/otp/request', { method: 'POST', body: { channel: state.otpChannel } }); toast('New code sent', result.message || 'Check your email.'); }
    catch (error) { toast('Could not send a new code', error.message); }
    return;
  }
  if (action === 'forgot-password') { toast('Password reset', 'Password reset delivery should be configured before launch.'); return; }
  if (action === 'help') { event.preventDefault(); showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>HalalMatch support</div><h2 style="margin-top:8px">We’re here to help.</h2><p>For account support, safety concerns or questions about verification, contact our team. Reports are private and reviewed by trained staff.</p><div class="simple-list"><div class="simple-list-item"><div><strong>Member support</strong><small>support@halalmatch.example</small></div>${icon('mail')}</div><div class="simple-list-item"><div><strong>Safety & urgent reports</strong><small>Available from a profile, message or community post</small></div>${icon('shield')}</div></div><div class="modal-actions"><button class="primary-button" type="button" data-action="close-modal">Got it</button></div></div>`); return; }
  if (action === 'notifications') {
    const existing = $('.notification-popover');
    if (existing) { existing.remove(); return; }
    const root = $('#modalRoot');
    root.insertAdjacentHTML('beforeend', `<section class="notification-popover" role="dialog" aria-label="Notifications"><h3>Your notifications <span class="nav-tag">2 NEW</span></h3><div class="notification-item"><i></i><p><strong>Someone appreciated your profile.</strong> A new introduction may be waiting in your likes.<small>18 minutes ago</small></p></div><div class="notification-item"><i></i><p><strong>Your profile is verified.</strong> You’re ready for thoughtful introductions.<small>Yesterday</small></p></div><div class="notification-item"><i></i><p><strong>Community conversation.</strong> Zainab replied to a post you follow.<small>2 days ago</small></p></div></section>`);
    return;
  }
  if (action === 'filters') { showFilterModal(); return; }
  if (action === 'refresh') { profiles.reverse(); render(); toast('Your introductions are refreshed', 'A new order, with the same thoughtful preferences.'); return; }
  if (action === 'like') {
    const receivedLike = state.route === 'likes' && (state.likesTab || 'received') === 'received';
    if (state.likedIds.has(id) && !receivedLike) {
      state.likedIds.delete(id);
      toast('Like removed', 'You can change your mind at any time.');
    } else {
      state.likedIds.add(id);
      if (receivedLike) {
        state.matchedIds.add(id);
        state.activeConversation = id;
        state.route = 'messages';
        toast('It’s a mutual connection', 'Say hello when you feel ready — your phone number stays private.');
      } else toast('Like sent thoughtfully', 'We’ll let you know if you both choose to connect.');
    }
    render(); return;
  }
  if (action === 'open-profile') { showProfile(id); return; }
  if (action === 'message') {
    const profile = profiles.find(item => item.id === id);
    if (profile && !conversations.some(item => item.id === id)) conversations.unshift({ id, name: profile.name, image: profile.image, online: profile.online, time: 'Now', preview: 'Your conversation is ready', unread: 0 });
    state.activeConversation = id || 'yusuf';
    state.workspace = 'member'; state.route = 'messages'; render();
    if (!messagesByUser[state.activeConversation]) messagesByUser[state.activeConversation] = [];
    return;
  }
  if (action === 'call' || action === 'video-call') {
    const featureKey = action === 'call' ? 'audio_calls' : 'video_calls';
    if (!state.features.find(feature => feature.key === featureKey)?.enabled) { toast('This feature is paused', 'The platform administrator has temporarily turned this feature off.'); return; }
    const profile = profiles.find(item => item.id === id) || profiles.find(item => item.id === state.activeConversation) || profiles[0];
    showModal(`<div class="modal-content" style="text-align:center;padding:38px 28px"><span class="verification-status-icon" style="width:58px;height:58px;margin:0 auto 14px;border-radius:18px">${icon(action === 'call' ? 'phone' : 'video')}</span><h2>${action === 'call' ? 'Starting a private audio call' : 'Starting a private video call'}</h2><p>Connecting you with ${escapeHtml(profile.name)}. Calls stay in HalalMatch — phone numbers are never shared.</p><div class="status-pill review" style="margin:3px auto 17px">${action === 'call' ? 'Audio call' : 'Video call'} · Demo preview</div><button class="secondary-button" type="button" data-action="close-modal">End call</button></div>`); return;
  }
  if (action === 'select-conversation') { state.activeConversation = id; render(); return; }
  if (action === 'conversation-menu') { showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Conversation privacy</div><h2 style="margin-top:8px">Keep this a safe space.</h2><p>You can mute, block or report a member. Blocking ends the match and prevents further contact.</p><div class="modal-actions" style="justify-content:space-between"><button class="danger-button" type="button" data-action="block-member">${icon('ban')} Block member</button><button class="secondary-button" type="button" data-action="report-member">${icon('flag')} Report conversation</button></div></div>`); return; }
  if (action === 'attach') { toast('Attachments are coming soon', 'Image and voice messages can be enabled from feature controls.'); return; }
  if (action === 'like-post') {
    const post = state.posts.find(item => item.id === id);
    if (post) { post.liked = !post.liked; post.likes += post.liked ? 1 : -1; render(); }
    return;
  }
  if (action === 'comment-post') { showCommentModal(id); return; }
  if (action === 'share-post') {
    const shareUrl = `${window.location.origin}${window.location.pathname}#community-${encodeURIComponent(id)}`;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(shareUrl).then(() => toast('Community link copied', 'This link shares only the public community post.')).catch(() => toast('Share link ready', 'Only the public community post is included.'));
    else toast('Share link ready', 'Only the public community post is included.');
    return;
  }
  if (action === 'post-menu') { showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Community safety</div><h2 style="margin-top:8px">A concern about this post?</h2><p>Reports are confidential and go to our moderation team for review.</p><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="danger-button" type="button" data-action="report-post" data-id="${escapeHtml(id)}">${icon('flag')} Report post</button></div></div>`); return; }
  if (action === 'report-post' || action === 'report-member') { closeModal(); toast('Report sent privately', 'Our safety team will review it. Thank you for helping keep this space kind.'); return; }
  if (action === 'block-member') { closeModal(); toast('Member blocked', 'They can no longer contact you or appear in your discovery.'); return; }
  if (action === 'compose-post') { showPostComposer(); return; }
  if (action === 'community-filter') { state.communityFilter = button.dataset.filter; render(); return; }
  if (action === 'guidelines') { showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Community guidelines</div><h2 style="margin-top:8px">Share with care.</h2><p>HalalMatch is a place for thoughtful, respectful conversation. Keep posts kind and constructive, respect each person’s privacy, and do not share phone numbers, addresses or another person’s images without consent. Harassment, hate, impersonation and spam are not allowed.</p><div class="guideline-list"><span>${icon('checkCircle')} Speak to people as you’d hope to be spoken to.</span><span>${icon('checkCircle')} Community posts can be shared publicly; match data cannot.</span><span>${icon('checkCircle')} Report a concern instead of engaging with harmful content.</span></div><div class="modal-actions"><button class="primary-button" type="button" data-action="close-modal">Understood</button></div></div>`); return; }
  if (action === 'onboarding') { state.onboardingStep = 0; state.onboardingData = {}; state.route = 'onboarding'; render(); return; }
  if (action === 'onboarding-back') { if (state.onboardingStep > 0) state.onboardingStep -= 1; render(); return; }
  if (action === 'save-profile') {
    if (state.backendAvailable && state.apiUser) {
      const values = { full_name: $('#profile-name')?.value || '', state: $('#profile-state')?.value || '', lga: $('#profile-lga')?.value || '', education: $('#profile-education')?.value || '', occupation: $('#profile-job')?.value || '', marital_status: $('#profile-marital')?.value || '', religious_practice: 'Practising', languages: $('#profile-languages')?.value || '', interests: state.apiUser.interests || [], about_me: $('#profile-about')?.value || '', marriage_intention: state.apiUser.marriage_intention || 'Marriage-minded' };
      try { const result = await requestApi('profile', { method: 'POST', body: values }); state.apiUser.name = values.full_name; state.apiUser.profile_completion = result.profile_completion; }
      catch (error) { toast('Profile changes were not saved', error.message); return; }
    }
    toast('Profile changes saved', 'Your profile information is updated. Private fields are not shown to other members.'); return;
  }
  if (action === 'verification-filter') { state.verificationFilter = button.dataset.filter; state.adminSearch = ''; render(); return; }
  if (action === 'user-filter') {
    $$('.filter-tab', button.parentElement).forEach(tab => tab.classList.remove('active'));
    button.classList.add('active');
    const value = button.dataset.filter;
    $$('[data-search-row]').forEach(row => {
      const text = row.dataset.searchRow || '';
      const visible = value === 'All members' || (value === 'Verified' ? text.includes('approved') : value === 'Pending' ? text.includes('pending') || text.includes('review') : text.includes(value.toLowerCase()));
      row.style.display = visible ? '' : 'none';
    });
    return;
  }
  if (action === 'review') { showReviewModal(id); return; }
  if (action === 'preview-video') {
    if (!state.backendAvailable || !/^\\d+$/.test(id)) { toast('Demo video unavailable', 'The preview uses sample requests only; production video streams require authorised server access.'); return; }
    showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Private media · request ${escapeHtml(id)}</div><h2 style="margin-top:8px">Verification video</h2><p>This stream is served by an authorised backend route and is never exposed as a public upload URL.</p><video controls autoplay style="width:100%;max-height:55vh;border-radius:11px;background:#10271d" src="api.php?route=admin/verifications/${encodeURIComponent(id)}/video"></video><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Close private preview</button></div></div>`); return;
  }
  if (action === 'preview-photo') { showPhotoReviewModal(id); return; }
  if (action === 'photo-decision') { await applyPhotoDecision(id, button.dataset.decision || 'approve'); return; }
  if (action === 'review-decision') { await applyReviewDecision(id, button.dataset.decision || 'approve'); return; }
  if (action === 'toggle-feature') {
    const feature = state.features.find(item => item.key === button.dataset.key);
    if (!feature) return;
    const previous = feature.enabled;
    feature.enabled = !feature.enabled;
    render();
    if (state.backendAvailable && state.apiUser?.is_admin) {
      try { await requestApi(`admin/features/${feature.key}`, { method: 'PUT', body: { enabled: feature.enabled } }); }
      catch (error) { feature.enabled = previous; render(); toast('Feature change was not saved', error.message); return; }
    }
    toast(`${feature.label} ${feature.enabled ? 'enabled' : 'paused'}`, 'The feature setting has been updated for the platform.');
    return;
  }
  if (action === 'safeguard-toggle') {
    button.classList.toggle('on');
    button.setAttribute('aria-checked', button.classList.contains('on') ? 'true' : 'false');
    toast('Safeguard updated', 'Changes are saved when you select Save settings.');
    return;
  }
  if (action === 'save-settings') {
    if (state.route === 'admin:matching') {
      const weights = Object.fromEntries($$('[data-weight]').map(input => [input.dataset.weight, Number(input.value)]));
      const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
      if (total !== 100) { toast('Matching weights must total 100%', `Current total: ${total}%. Adjust the sliders before saving.`); return; }
      if (state.backendAvailable && state.apiUser?.is_admin) {
        try { const result = await requestApi('admin/matching/weights', { method: 'PUT', body: { weights } }); state.matchingWeights = Object.entries(result.weights || weights).map(([weight_key, weight]) => ({ weight_key, weight })); }
        catch (error) { toast('Matching rules were not saved', error.message); return; }
      }
    } else if (state.route === 'admin:settings' && state.backendAvailable && state.apiUser?.is_admin) {
      const providers = ['paystack', 'flutterwave'];
      for (const provider of providers) {
        const values = Object.fromEntries($$(`[data-payment-provider="${provider}"]`).map(input => [input.dataset.paymentField, input.value.trim()]));
        if (Object.values(values).some(Boolean)) {
          try { await requestApi('admin/payment-settings', { method: 'PUT', body: { provider, ...values } }); }
          catch (error) { toast(`${provider} settings were not saved`, error.message); return; }
        }
      }
      try { const result = await requestApi('admin/payment-settings'); state.paymentProviders = result.providers || null; }
      catch (error) { toast('Provider status could not be refreshed', error.message); return; }
      $$('[data-payment-field="secret_key"], [data-payment-field="webhook_secret"], [data-payment-field="encryption_key"]').forEach(input => { input.value = ''; });
      render();
    }
    toast('Settings saved', 'Changes will be recorded in the admin audit log.'); return;
  }
  if (action === 'create-campaign') { showCreateModal('campaign'); return; }
  if (action === 'create-ad') { showCreateModal('ad'); return; }
  if (action === 'create-role') { showRoleModal(); return; }
  if (action === 'export-report') { downloadVisibleTable(); return; }
  if (action === 'likes-tab') { state.likesTab = button.dataset.tab; render(); return; }
  if (action === 'comment-post') { showCommentModal(id); return; }
  if (action === 'campaign-analytics') { toast('Campaign analytics', 'Reach, registrations, verification, matches and conversions are tracked separately.'); return; }
  if (action === 'subscription-plans') { toast('Subscription plans', 'Free, Premium, Premium Plus and VIP plans can be configured in Settings.'); return; }
  if (action === 'placements') { toast('Placement settings', 'Homepage, discovery, community, profile and dashboard placements are available.'); return; }
  if (action === 'role-detail') { const role = state.roles.find(item => item.name === id); if (role) showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Database-driven permissions</div><h2 style="margin-top:8px">${escapeHtml(role.name)}</h2><p>${escapeHtml(role.description)}</p><div class="form-field"><label>Assigned permissions</label><div class="detail-chips">${role.permissions.map(permission => `<span>${escapeHtml(permission)}</span>`).join('')}</div></div>${state.backendAvailable && role.roleKey ? `<form id="roleAssignmentForm" data-role-key="${escapeHtml(role.roleKey)}" style="margin-top:17px"><div class="form-field"><label for="roleTargetUser">Assign this role to a member</label><select id="roleTargetUser" name="user_id" required><option value="">Choose member account</option>${state.users.filter(user => user.userId).map(user => `<option value="${user.userId}">${escapeHtml(user.name)} · ${escapeHtml(user.id)}</option>`).join('')}</select></div><div class="form-field" style="margin-top:10px"><label for="roleAssignmentOperation">Action</label><select id="roleAssignmentOperation" name="operation"><option value="assign">Assign role</option><option value="revoke">Revoke role</option></select></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Close</button><button class="primary-button" type="submit">Update assignment</button></div></form>` : `<div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Close</button></div>`}</div>`); return; }
  if (action === 'user-detail') { const user = state.users.find(item => item.id === id); if (user) showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Member record · ${escapeHtml(user.id)}</div><h2 style="margin-top:8px">${escapeHtml(user.name)}</h2><p>${escapeHtml(user.gender)} · ${escapeHtml(user.city)} · Joined ${escapeHtml(user.joined)}</p><div class="simple-list"><div class="simple-list-item"><div><strong>Account status</strong><small>${escapeHtml(user.status)}</small></div><span class="status-pill ${statusClass(user.status)}">${escapeHtml(user.status)}</span></div><div class="simple-list-item"><div><strong>Verification</strong><small>${user.verified ? 'Approved and discoverable' : 'Not approved — never discoverable'}</small></div><span>${icon('shield')}</span></div></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Close record</button></div></div>`); return; }
  if (action === 'user-menu') { showModal(`<div class="modal-content"><div class="eyebrow"><span class="eyebrow-dot"></span>Member account · ${escapeHtml(id)}</div><h2 style="margin-top:8px">Account actions</h2><p>Account changes should include a reason and be recorded for audit.</p><div class="modal-actions"><button class="danger-button" type="button" data-action="suspend-user" data-id="${escapeHtml(id)}">${icon('ban')} Suspend account</button><button class="secondary-button" type="button" data-action="close-modal">Cancel</button></div></div>`); return; }
  if (action === 'suspend-user') { const user = state.users.find(item => item.id === id); if (user) user.status = 'Suspended'; closeModal(); render(); toast('Account suspended', 'The change is recorded in the admin audit log.'); return; }
  if (action === 'moderate-report' || action === 'ticket-detail' || action === 'call-detail' || action === 'ad-detail' || action === 'campaign-detail' || action === 'call-settings' || action === 'ticket-settings') { toast('Record opened', 'Sensitive details are available only to staff with the right permission.'); return; }
  if (action === 'close-modal') { closeModal(); return; }
  if (action === 'modal-backdrop') { if (event.target === button) closeModal(); return; }
}

async function applyReviewDecision(requestId, decision) {
  const request = state.queue.find(item => item.id === requestId);
  if (!request) return;
  const reason = $('#reviewReason')?.value.trim() || '';
  if (['reject', 'request_resubmission'].includes(decision) && reason.length < 4) {
    $('#reviewReason')?.focus();
    toast('A review note is required', 'Please provide a clear reason before taking this action.');
    return;
  }
  if (state.backendAvailable && /^\d+$/.test(requestId)) {
    try { await requestApi(`admin/verifications/${requestId}/review`, { method: 'POST', body: { decision, reason } }); }
    catch (error) { toast('Verification decision was not saved', error.message); return; }
  }
  const statusByDecision = { approve: 'Approved', reject: 'Rejected', request_resubmission: 'Resubmission requested', suspend: 'Suspended' };
  request.status = statusByDecision[decision] || 'Under review';
  request.reviewer = 'I. Adeyemi';
  if (decision === 'approve') {
    const user = state.users.find(item => item.name === request.user);
    if (user) { user.status = 'Approved'; user.verified = true; }
  }
  closeModal();
  render();
  const titles = { approve: 'Verification approved', reject: 'Verification rejected', request_resubmission: 'Resubmission requested', suspend: 'Account suspended' };
  toast(titles[decision] || 'Review recorded', decision === 'approve' ? 'This profile can now enter the approved discovery pool.' : 'The reviewer, date and reason are retained in the audit history.');
}

async function applyPhotoDecision(photoId, decision) {
  const photo = state.pendingPhotos.find(item => item.id === photoId);
  if (!photo) return;
  const reason = $('#photoReviewReason')?.value.trim() || '';
  if (decision === 'reject' && reason.length < 4) {
    $('#photoReviewReason')?.focus();
    toast('A rejection reason is required', 'Explain what the member should change before rejecting this photo.');
    return;
  }
  if (state.backendAvailable && /^\d+$/.test(photoId)) {
    try { await requestApi(`admin/profile-photos/${photoId}/review`, { method: 'POST', body: { decision, reason } }); }
    catch (error) { toast('Photo review was not saved', error.message); return; }
  }
  state.pendingPhotos = state.pendingPhotos.filter(item => item.id !== photoId);
  closeModal();
  render();
  toast(decision === 'approve' ? 'Profile photo approved' : 'Profile photo rejected', decision === 'approve' ? 'It can now appear on the member’s verified profile.' : 'The private photo remains hidden from discovery.');
}

function downloadVisibleTable() {
  const rows = $$('.data-table tr').filter(row => row.offsetParent !== null);
  if (rows.length < 2) { toast('Nothing to export yet', 'There are no visible rows in this section.'); return; }
  const csv = rows.map(row => $$('th,td', row).map(cell => `"${cell.innerText.trim().replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `halalmatch-${state.route.replace(/[^a-z0-9-]/gi, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast('CSV report downloaded', 'The export contains only the rows currently visible in this view.');
}

function sendMessage() {
  const input = $('#messageInput');
  const value = input?.value.trim();
  if (!value) return;
  const id = state.activeConversation;
  if (!messagesByUser[id]) messagesByUser[id] = [];
  const stamp = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date());
  messagesByUser[id].push({ mine: true, text: value, time: stamp });
  const conversation = conversations.find(item => item.id === id);
  if (conversation) { conversation.preview = value; conversation.time = 'Now'; }
  render();
  const scroll = $('#chatScroll');
  if (scroll) scroll.scrollTop = scroll.scrollHeight;
}

function applyAdminTableSearch(query) {
  const needle = query.trim().toLowerCase();
  $$('[data-search-row]').forEach(row => { row.style.display = !needle || (row.dataset.searchRow || '').includes(needle) ? '' : 'none'; });
}

function updateProfileGrid() {
  const mount = $('#profileGridMount');
  if (mount) mount.innerHTML = filterProfiles().map(profileCard).join('') || `<div class="empty-search"><strong>No introductions match those filters</strong>Try clearing your search or changing the age range.</div>`;
}

function handleInput(event) {
  if (event.target.id === 'globalSearch') {
    state.searchTerm = event.target.value;
    if (state.workspace === 'member' && state.route === 'discover') updateProfileGrid();
    else if (state.workspace === 'admin') applyAdminTableSearch(event.target.value);
  }
  if (event.target.id === 'adminTableSearch') {
    state.adminSearch = event.target.value;
    applyAdminTableSearch(event.target.value);
  }
  if (event.target.matches('[data-weight]')) {
    const readout = event.target.parentElement.querySelector('b');
    if (readout) readout.textContent = `${event.target.value}%`;
    const total = $$('[data-weight]').reduce((sum, input) => sum + Number(input.value), 0);
    const badge = $('#weightTotal');
    if (badge) { badge.textContent = `${total}% ${total === 100 ? 'total' : total > 100 ? 'over target' : 'to allocate'}`; badge.className = `status-pill ${total === 100 ? 'approved' : 'review'}`; }
  }
}

async function handleChange(event) {
  if (event.target.id === 'ageFilter') { state.ageRange = event.target.value; updateProfileGrid(); }
  if (event.target.id === 'filter-age') state.ageRange = event.target.value;
  if (event.target.matches('input[type="file"]')) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast('Photo is too large', 'Choose an image smaller than 10 MB.'); event.target.value = ''; return; }
    if (event.target.id === 'profilePhotoUpload' && state.backendAvailable && state.apiUser) {
      const form = new FormData(); form.append('photo', file);
      try { await requestApi('profile/photos', { method: 'POST', body: form }); toast('Photo submitted for review', 'Your private photo will not appear to other members until it is approved.'); }
      catch (error) { toast('Photo upload failed', error.message); }
      event.target.value = '';
      return;
    }
    toast('File selected', `${file.name} is ready for a private, authorised review.`);
  }
}

function acceptAuthenticatedUser(result) {
  state.apiUser = result.user || null;
  state.csrfToken = result.csrf_token || state.csrfToken;
  state.authPending = false;
  const isAdmin = Boolean(state.apiUser?.is_admin);
  state.workspace = isAdmin ? 'admin' : 'member';
  state.route = isAdmin ? 'admin:overview' : state.apiUser?.verification_status === 'approved' ? 'discover' : 'verification';
  const topName = $('.topbar-profile-copy strong');
  const topRole = $('.topbar-profile-copy small');
  const topAvatar = $('.avatar-top');
  if (topName) topName.textContent = (state.apiUser?.name || 'Member').split(' ')[0];
  if (topRole) topRole.textContent = isAdmin ? 'Administrator' : 'HalalMatch member';
  if (topAvatar) topAvatar.src = imagePath(isAdmin ? 'portrait-omar.jpg' : 'portrait-aisha.jpg');
  render();
  hydrateWorkspace();
}

async function hydrateWorkspace() {
  if (!state.backendAvailable || !state.apiUser) return;
  const routeAtStart = state.route;
  try {
    if (state.workspace === 'admin' && routeAtStart === 'admin:overview') {
      const result = await requestApi('admin/dashboard');
      state.dashboardData = result.dashboard || null;
      try {
        const queueResult = await requestApi('admin/verifications?status=pending');
        const photoFallbacks = ['portrait-aisha.jpg', 'portrait-yusuf.jpg', 'portrait-zainab.jpg', 'portrait-omar.jpg'];
        state.queue = (queueResult.requests || []).map((item, index) => ({ id: String(item.id), user: item.name, age: item.age, city: [item.state, item.lga].filter(Boolean).join(', '), image: photoFallbacks[index % photoFallbacks.length], submitted: item.submitted_at, status: ({ pending: 'Pending', under_review: 'Under review', approved: 'Approved', rejected: 'Rejected', resubmission_requested: 'Resubmission requested' })[item.status] || item.status, reviewer: item.reviewer || 'Unassigned', gender: item.gender === 'male' ? 'Male' : 'Female', job: item.occupation || 'Member', video: true }));
      } catch (queueError) { /* The dashboard summary remains available to roles without verification access. */ }
    } else if (state.workspace === 'admin' && routeAtStart === 'admin:verification') {
      const result = await requestApi('admin/verifications');
      const photoFallbacks = ['portrait-aisha.jpg', 'portrait-yusuf.jpg', 'portrait-zainab.jpg', 'portrait-omar.jpg'];
      state.queue = (result.requests || []).map((item, index) => ({ id: String(item.id), user: item.name, age: item.age, city: [item.state, item.lga].filter(Boolean).join(', '), image: photoFallbacks[index % photoFallbacks.length], submitted: item.submitted_at, status: ({ pending: 'Pending', under_review: 'Under review', approved: 'Approved', rejected: 'Rejected', resubmission_requested: 'Resubmission requested' })[item.status] || item.status, reviewer: item.reviewer || 'Unassigned', gender: item.gender === 'male' ? 'Male' : 'Female', job: item.occupation || 'Member', video: true }));
    } else if (state.workspace === 'admin' && routeAtStart === 'admin:photos') {
      const result = await requestApi('admin/profile-photos');
      state.pendingPhotos = (result.photos || []).map(photo => ({ id: String(photo.id), user: photo.full_name, location: [photo.state, photo.lga].filter(Boolean).join(', '), uploaded: photo.created_at, image: `api.php?route=admin/profile-photos/${photo.id}/media`, status: photo.review_status }));
    } else if (state.workspace === 'admin' && routeAtStart === 'admin:features') {
      const result = await requestApi('admin/features');
      (result.features || []).forEach(serverFeature => {
        const local = state.features.find(feature => feature.key === serverFeature.key);
        if (local) local.enabled = Boolean(Number(serverFeature.enabled));
      });
    } else if (state.workspace === 'admin' && routeAtStart === 'admin:users') {
      const result = await requestApi('admin/users');
      const photoFallbacks = ['portrait-aisha.jpg', 'portrait-yusuf.jpg', 'portrait-zainab.jpg', 'portrait-omar.jpg'];
      state.users = (result.users || []).map((user, index) => ({ id: `USR-${user.id}`, name: user.full_name, gender: user.gender === 'male' ? 'Male' : 'Female', city: [user.state, user.lga].filter(Boolean).join(', '), joined: user.created_at, status: user.account_status === 'suspended' ? 'Suspended' : user.verification_status === 'approved' ? 'Approved' : user.verification_status === 'rejected' ? 'Rejected' : user.verification_status === 'under_review' ? 'Under review' : 'Pending', verified: user.verification_status === 'approved', image: photoFallbacks[index % photoFallbacks.length] }));
    } else if (state.workspace === 'admin' && routeAtStart === 'admin:matching') {
      const result = await requestApi('admin/matching/weights');
      state.matchingWeights = result.weights || null;
    } else if (state.workspace === 'admin' && routeAtStart === 'admin:settings') {
      const result = await requestApi('admin/payment-settings');
      state.paymentProviders = result.providers || null;
    } else if (state.workspace === 'admin' && routeAtStart === 'admin:staff') {
      const result = await requestApi('admin/roles');
      state.roles = (result.roles || []).map(role => ({ id: Number(role.id), name: role.name, users: Number(role.member_count), description: role.description || '', icon: role.role_key === 'super_admin' ? 'key' : 'shieldCheck', permissions: role.permissions || [], roleKey: role.role_key }));
      try {
        const users = await requestApi('admin/users?limit=100');
        const photoFallbacks = ['portrait-aisha.jpg', 'portrait-yusuf.jpg', 'portrait-zainab.jpg', 'portrait-omar.jpg'];
        state.users = (users.users || []).map((user, index) => ({ userId: Number(user.id), id: `USR-${user.id}`, name: user.full_name, gender: user.gender === 'male' ? 'Male' : 'Female', city: [user.state, user.lga].filter(Boolean).join(', '), joined: user.created_at, status: user.account_status, verified: user.verification_status === 'approved', image: photoFallbacks[index % photoFallbacks.length] }));
      } catch (usersError) { /* Role viewers without user-list access can still inspect roles and permissions. */ }
    } else if (state.workspace === 'member' && routeAtStart === 'discover' && state.apiUser.verification_status === 'approved') {
      const result = await requestApi('discover');
      const photoFallbacks = ['portrait-yusuf.jpg', 'portrait-omar.jpg', 'portrait-khalid.jpg'];
      const mapped = (result.profiles || []).map((profile, index) => ({ id: String(profile.id), name: profile.name, age: profile.age, city: profile.location, job: profile.occupation || profile.education || 'Member', image: profile.photo_url || photoFallbacks[index % photoFallbacks.length], score: profile.compatibility_score || 0, tags: [...(profile.shared_interests || []).slice(0, 2), profile.marriage_intention || 'Marriage-minded'].filter(Boolean), online: false, joined: 'Recently', about: profile.about || 'A verified member looking for a thoughtful connection.', education: profile.education || 'Not shared', intention: profile.marriage_intention || 'Marriage-minded', interests: profile.interests || [], language: (profile.languages || []).join(', '), religion: profile.religious_practice || 'Not shared', location: profile.location }));
      profiles.splice(0, profiles.length, ...mapped);
    } else if (state.workspace === 'member' && routeAtStart === 'community') {
      const result = await requestApi('community');
      const photoFallbacks = ['portrait-zainab.jpg', 'portrait-aisha.jpg', 'portrait-mariam.jpg'];
      state.posts = (result.posts || []).map((post, index) => ({ id: String(post.id), author: post.full_name, image: photoFallbacks[index % photoFallbacks.length], time: post.created_at, location: post.state || 'HalalMatch', text: post.body, likes: Number(post.reaction_count), comments: Number(post.comment_count), liked: Boolean(Number(post.viewer_reacted)), verified: true }));
    }
    if (state.route === routeAtStart) render();
  } catch (error) {
    if (error.message && error.message !== 'You do not have permission to perform this action.') console.warn('HalalMatch data sync:', error.message);
  }
}

async function handleSubmit(event) {
  const form = event.target;
  if (!form.matches('form')) return;
  event.preventDefault();
  if (form.id === 'loginForm') {
    if (!state.backendAvailable) { toast('Sign in is not connected', 'Start the PHP API and configure the database to authenticate.'); return; }
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await requestApi('login', { method: 'POST', body: values });
      if (result.requires_contact_verification) { state.authPending = true; state.otpChannel = String(values.identifier || '').includes('@') ? 'email' : 'sms'; state.route = 'otp'; render(); toast('Contact verification required', result.message); return; }
      if (result.requires_two_factor || result.requires_two_factor_setup) {
        state.adminTwoFactorMode = result.requires_two_factor_setup ? 'setup' : 'verify';
        state.route = 'admin-2fa';
        if (state.adminTwoFactorMode === 'setup') {
          const setup = await requestApi('auth/admin-2fa/setup', { method: 'POST', body: {} });
          state.adminSetupSecret = setup.secret || '';
        }
        render();
        return;
      }
      acceptAuthenticatedUser(result);
      toast('Welcome back', `Signed in to HalalMatch${state.apiUser?.verification_status === 'approved' ? '' : ' — complete verification to appear in discovery'}.`);
    } catch (error) { toast('Could not sign in', error.message); }
    return;
  }
  if (form.id === 'otpForm') {
    if (!state.backendAvailable) { toast('Verification is not connected', 'Start the PHP API and configure email or SMS delivery.'); return; }
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await requestApi('contact/otp/verify', { method: 'POST', body: values });
      if (result.requires_two_factor) {
        state.adminTwoFactorMode = result.requires_two_factor_setup ? 'setup' : 'verify';
        state.route = 'admin-2fa';
        if (state.adminTwoFactorMode === 'setup') {
          const setup = await requestApi('auth/admin-2fa/setup', { method: 'POST', body: {} });
          state.adminSetupSecret = setup.secret || '';
        }
        render();
      } else {
        state.authPending = false;
        acceptAuthenticatedUser(result);
        toast('Contact verified', 'Your account is ready for secure profile review.');
      }
    } catch (error) { toast('Code could not be verified', error.message); }
    return;
  }
  if (form.id === 'adminTwoFactorForm') {
    if (!state.backendAvailable) { toast('Administrator sign-in is not connected', 'Start the PHP API to test two-factor authentication.'); return; }
    const values = Object.fromEntries(new FormData(form).entries());
    const route = state.adminTwoFactorMode === 'setup' ? 'auth/admin-2fa/verify-setup' : 'auth/admin-2fa/verify';
    try { const result = await requestApi(route, { method: 'POST', body: values }); acceptAuthenticatedUser(result); toast('Administrator access verified', 'Your security check has been recorded.'); }
    catch (error) { toast('Authenticator check failed', error.message); }
    return;
  }
  if (form.id === 'verificationForm') {
    if (!state.backendAvailable) { toast('Verification upload is not connected', 'The PHP API is required to store videos in private storage.'); return; }
    try {
      const result = await requestApi('verification/submit', { method: 'POST', body: new FormData(form) });
      if (state.apiUser) state.apiUser.verification_status = result.status || 'pending';
      render();
      toast('Verification submitted', 'Your profile is hidden from discovery while a verification officer reviews it.');
    } catch (error) { toast('Could not submit verification', error.message); }
    return;
  }
  if (form.id === 'messageForm') { sendMessage(); return; }
  if (form.id === 'filterForm') {
    state.ageRange = $('#filter-age')?.value || 'Any age';
    closeModal();
    render();
    toast('Preferences applied', 'Introductions will follow your updated age and location preferences.');
    return;
  }
  if (form.id === 'postForm') {
    const text = $('#postContent')?.value.trim();
    if (!text) return;
    state.posts.unshift({ id: `post-${Date.now()}`, author: 'Fatima Bello', image: 'portrait-aisha.jpg', time: 'Just now', location: 'Kano', text, likes: 0, comments: 0, liked: false, verified: true });
    state.route = 'community';
    closeModal(); render(); toast('Your post is live', 'Your community post is separate from your private matchmaking profile.');
    return;
  }
  if (form.id === 'commentForm') {
    const post = state.posts.find(item => item.id === form.dataset.id);
    if (post) post.comments += 1;
    closeModal(); render(); toast('Reply added', 'Thank you for keeping the conversation thoughtful.');
    return;
  }
  if (form.id === 'onboardingForm') {
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.name) state.onboardingData[`${key}_filename`] = value.name;
      } else state.onboardingData[key] = value;
    }
    if (state.onboardingStep === 0 && state.onboardingData.date_of_birth) {
      const birth = new Date(state.onboardingData.date_of_birth);
      const age = Math.floor((Date.now() - birth.getTime()) / 31557600000);
      if (age < 18) { toast('Members must be 18 or older', 'Please check your date of birth before continuing.'); return; }
    }
    if (state.onboardingStep === 0 && !state.onboardingData.email?.trim() && !state.onboardingData.phone?.trim()) { toast('Add a contact method', 'Enter an email address or phone number so we can send your verification code.'); return; }
    if (state.onboardingStep < 3) { state.onboardingStep += 1; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (state.backendAvailable && state.onboardingMode === 'register') {
      try {
        const result = await requestApi('register', { method: 'POST', body: state.onboardingData });
        state.otpChannel = result.channel || (state.onboardingData.email ? 'email' : 'sms');
        delete state.onboardingData.password;
        state.authPending = true;
        state.route = 'otp';
        render();
        toast(result.delivery_ready ? 'Account details received' : 'Account created — delivery needs setup', result.message || 'Complete contact verification before profile review.');
      } catch (error) { toast('Account could not be created', error.message); return; }
    } else if (state.onboardingMode === 'register') {
      toast('Connect the PHP API to create an account', 'The onboarding flow is ready; the static preview does not save personal information.');
    } else {
      toast('Onboarding preview complete', 'In production, contact verification and private video review come next.');
    }
    state.onboardingMode = 'preview';
    state.route = state.backendAvailable && state.authPending ? 'otp' : 'verification'; render(); return;
  }
  if (form.id === 'campaignForm') {
    const data = new FormData(form);
    const start = data.get('start'); const end = data.get('end');
    if (end < start) { toast('Check your campaign dates', 'The end date should be after the start date.'); return; }
    state.campaigns.unshift({ name: data.get('name'), target: data.get('target'), status: data.get('status'), dates: `${start} — ${end}`, reach: '—', registrations: '—', accent: 'green' });
    closeModal(); state.route = 'admin:campaigns'; render(); toast('Campaign created', 'Audience, duration and status are saved. Add creative and budget in campaign setup.'); return;
  }
  if (form.id === 'adForm') {
    const data = new FormData(form);
    state.ads.unshift({ name: data.get('name'), type: data.get('type'), placement: data.get('placement'), status: 'In review', impressions: '—', clicks: '—', image: 'portrait-mariam.jpg' });
    closeModal(); state.route = 'admin:ads'; render(); toast('Advertisement submitted', 'The creative is queued for approval before any member sees it.'); return;
  }
  if (form.id === 'roleForm') {
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const permission = String(data.get('permission'));
    if (state.roles.some(role => role.name.toLowerCase() === name.toLowerCase())) { toast('That role already exists', 'Choose a unique role name.'); return; }
    if (state.backendAvailable && state.apiUser?.is_admin) {
      try { await requestApi('admin/roles', { method: 'POST', body: { name, description: String(data.get('description') || ''), permissions: [permission] } }); }
      catch (error) { toast('Role could not be created', error.message); return; }
    }
    state.roles.push({ name, users: 0, description: String(data.get('description') || 'Custom staff role with assigned permissions.'), icon: 'key', permissions: [permission] });
    closeModal(); state.route = 'admin:staff'; render(); hydrateWorkspace(); toast('Role created', 'Assign the role to a staff account from the role management screen.'); return;
  }
  if (form.id === 'roleAssignmentForm') {
    const data = new FormData(form);
    const userId = Number(data.get('user_id'));
    const roleKey = form.dataset.roleKey;
    if (!userId || !roleKey) { toast('Choose a member account', 'Select a valid account before changing role assignments.'); return; }
    try { await requestApi(`admin/users/${userId}/roles`, { method: 'POST', body: { role_key: roleKey, operation: data.get('operation') } }); }
    catch (error) { toast('Role assignment was not saved', error.message); return; }
    closeModal(); hydrateWorkspace(); toast('Role assignment updated', 'Database permissions and the administrator audit log have been updated.'); return;
  }
}

async function initialize() {
  render();
  try {
    const session = await requestApi('session');
    state.backendAvailable = true;
    state.csrfToken = session.csrf_token || '';
    state.apiUser = session.user || null;
    state.authPending = Boolean(session.pending_contact_verification);
    if (session.features && Array.isArray(session.features)) {
      session.features.forEach(serverFeature => {
        const local = state.features.find(feature => feature.key === serverFeature.key);
        if (local) local.enabled = Boolean(serverFeature.enabled);
      });
    }
    if (state.apiUser) {
      acceptAuthenticatedUser({ user: state.apiUser, csrf_token: state.csrfToken });
    } else if (session.pending_contact_verification) {
      state.route = 'otp'; render();
    } else if (session.pending_admin_two_factor) {
      state.adminTwoFactorMode = 'verify'; state.route = 'admin-2fa'; render();
    } else {
      state.workspace = 'member'; state.route = 'login'; render();
    }
  } catch (error) {
    state.backendAvailable = false;
  }
}

document.addEventListener('click', event => { handleClick(event); });
document.addEventListener('input', handleInput);
document.addEventListener('change', handleChange);
document.addEventListener('submit', event => { handleSubmit(event); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && state.modalOpen) closeModal();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#globalSearch')?.focus(); }
  if (event.key === 'Enter' && event.target.id === 'messageInput') { event.preventDefault(); sendMessage(); }
});

initialize();
