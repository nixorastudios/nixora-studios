import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/my-studio')({
  beforeLoad: () => { throw redirect({ to: '/dashboard', replace: true }); },
  staticData: { sitemap: false },
});
