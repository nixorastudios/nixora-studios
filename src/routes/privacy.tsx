import { createFileRoute } from '@tanstack/react-router'
import Privacy from '../pages/Privacy'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [
    { title: 'Privacy Policy — NIXORA STUDIOS' },
    { name: 'description', content: 'NIXORA STUDIOS privacy: securely stored early-access emails, local drafts, and your data access and deletion rights.' },
    { property: 'og:title', content: 'Privacy Policy — NIXORA STUDIOS' },
    { property: 'og:description', content: 'NIXORA STUDIOS privacy: securely stored early-access emails, local drafts, and your data access and deletion rights.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  staticData: { sitemap: true },
  component: Privacy,
})
