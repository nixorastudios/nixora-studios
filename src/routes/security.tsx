import { createFileRoute } from '@tanstack/react-router'
import Security from '../pages/Security'

export const Route = createFileRoute('/security')({
  head: () => ({ meta: [
    { title: 'Security — NIXORA STUDIOS' },
    { name: 'description', content: 'How NIXORA STUDIOS protects your data: SSL encryption, no card storage, PCI-DSS payments via Paystack, and encrypted storage.' },
    { property: 'og:title', content: 'Security — NIXORA STUDIOS' },
    { property: 'og:description', content: 'How NIXORA STUDIOS protects your data: SSL encryption, no card storage, PCI-DSS payments via Paystack, and encrypted storage.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  staticData: { sitemap: true },
  component: Security,
})
