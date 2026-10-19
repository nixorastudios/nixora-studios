import { createFileRoute } from '@tanstack/react-router'
import Terms from '../pages/Terms'

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [
    { title: 'Terms of Service — NIXORA STUDIOS' },
    { name: 'description', content: 'NIXORA STUDIOS terms covering platform use, subscriptions, and creative output.' },
    { property: 'og:title', content: 'Terms of Service — NIXORA STUDIOS' },
    { property: 'og:description', content: 'NIXORA STUDIOS terms covering platform use, subscriptions, and creative output.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Terms,
})
