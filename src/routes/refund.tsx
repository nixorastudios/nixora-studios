import { createFileRoute } from '@tanstack/react-router'
import Refund from '../pages/Refund'

export const Route = createFileRoute('/refund')({
  head: () => ({ meta: [
    { title: 'Refund Policy — NIXORA STUDIOS' },
    { name: 'description', content: 'NIXORA STUDIOS refund policy: unused credits refundable within 7 days, failed generations auto-refunded in 24 hours.' },
    { property: 'og:title', content: 'Refund Policy — NIXORA STUDIOS' },
    { property: 'og:description', content: 'NIXORA STUDIOS refund policy: unused credits refundable within 7 days, failed generations auto-refunded in 24 hours.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  staticData: { sitemap: true },
  component: Refund,
})
