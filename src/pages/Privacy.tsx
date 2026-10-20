import { Link } from '@tanstack/react-router'

export default function Privacy() {
  return (
    <div className="p-8 max-w-5xl mx-auto text-sm leading-6">
      <h1 className="text-4xl font-bold mb-2">Nixora Studios Privacy</h1>
      <p>No data collected except waitlist email stored locally. No tracking.</p>
      <p className="mt-4">
        Questions? Contact{' '}
        <a
          href="mailto:support@nixorastudios.com"
          className="underline text-link hover:text-link/80"
        >
          support@nixorastudios.com
        </a>
      </p>
      <p className="mt-6">
        <Link to="/terms" className="underline text-link hover:text-link/80">
          Read Terms of Service
        </Link>
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
