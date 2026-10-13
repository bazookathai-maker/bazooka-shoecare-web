export const CONTACT_EMAIL = 'bazookathai@gmail.com';

export const contactInfo = [
  {
    id: 'email',
    label: 'Email',
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    icon: 'mail',
  },
  {
    // No confirmed page URL yet — keep as text until one is provided.
    id: 'facebook',
    label: 'Facebook',
    value: 'Bazooka ผลิตภัณฑ์ดูแลรองเท้า',
    icon: 'facebook',
  },
  {
    id: 'line',
    label: 'LINE',
    value: '@bazookath',
    href: 'https://line.me/R/ti/p/@bazookath',
    icon: 'line',
    external: true,
  },
  {
    id: 'hours',
    label: 'เวลาทำการ',
    value: '08.30–17.30 น.',
    icon: 'clock',
  },
];

export const socialLinks = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/bazookashoecare/' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@bazookashoecare' },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@bazookathailand' },
];
