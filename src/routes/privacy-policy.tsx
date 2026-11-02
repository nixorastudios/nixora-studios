import { createFileRoute } from '@tanstack/react-router';
import Privacy from '@/pages/Privacy';

export const Route = createFileRoute('/privacy-policy')({
  head: () => ({ links: [{ rel: 'canonical', href: 'https://nixorastudios.com/privacy' }], meta: [
    { title: 'Data Protection & Privacy Policy — NIXORA STUDIOS' },
    { name: 'description', content: 'NIXORASTUDIOS LTD privacy policy covering waitlist emails, payment evidence and data-protection rights.' },
    { property: 'og:title', content: 'Data Protection & Privacy Policy — NIXORA STUDIOS' },
    { property: 'og:description', content: 'How NIXORA STUDIOS handles personal data and data-protection requests.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  staticData: { sitemap: false }, component: Privacy,
});