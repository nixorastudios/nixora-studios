import { createFileRoute } from '@tanstack/react-router'
import Contact from '../pages/Contact'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [
    { title: 'Contact — NIXORA STUDIOS' },
    { name: 'description', content: 'Contact NIXORASTUDIOS LTD: support@nixorastudios.com, hello@nixorastudios.com, or write to our office in Asaba, Delta State, Nigeria.' },
    { property: 'og:title', content: 'Contact — NIXORA STUDIOS' },
    { property: 'og:description', content: 'Contact NIXORASTUDIOS LTD: support@nixorastudios.com, hello@nixorastudios.com, or write to our office in Asaba, Delta State, Nigeria.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  staticData: { sitemap: true },
  component: Contact,
})
