import { createFileRoute } from '@tanstack/react-router'
import Privacy from '../pages/Privacy'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [
    { title: 'Privacy Policy — NIXORA STUDIOS' },
    { name: 'description', content: 'NIXORA STUDIOS privacy policy for accounts, uploads, and creative content.' },
    { property: 'og:title', content: 'Privacy Policy — NIXORA STUDIOS' },
    { property: 'og:description', content: 'NIXORA STUDIOS privacy policy for accounts, uploads, and creative content.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Privacy,
})
