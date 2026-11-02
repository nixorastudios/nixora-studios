import { createFileRoute } from '@tanstack/react-router';
import Refund from '@/pages/Refund';

export const Route = createFileRoute('/refund-policy')({
  head: () => ({ links: [{ rel: 'canonical', href: 'https://nixorastudios.com/refund' }], meta: [
    { title: 'Credit Refunds & Consumer Rights — NIXORA STUDIOS' },
    { name: 'description', content: 'NIXORASTUDIOS LTD credit refund policy, failed-generation reconciliation and legal cash-refund exceptions.' },
    { property: 'og:title', content: 'Credit Refunds & Consumer Rights — NIXORA STUDIOS' },
    { property: 'og:description', content: 'Unused-credit requests, failed generations and mandatory consumer rights.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  staticData: { sitemap: false }, component: Refund,
});