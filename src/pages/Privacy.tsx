import { Link } from "@tanstack/react-router";
export default function Privacy() {
  return (
    <div className="p-8 max-w-5xl mx-auto text-sm leading-6">
      <h1 className="text-4xl font-bold mb-2">Nixora Studios Privacy Policy</h1>
      <p className="mb-6 text-muted-foreground">
        Last Updated: Oct 23, 2026 | NIXORASTUDIOS LTD | support@nixorastudios.com
      </p>

      <h2 className="font-bold mt-6">1. Data Collected</h2>
      <p>Waitlist email, name, generated content, payment data via Paystack (NGN) and Stripe (USD). No card storage.</p>

      <h2 className="font-bold mt-6">2. Use</h2>
      <p>To provide 10 AI engines, process payments showing NIXORA STUDIOS, and send receipts.</p>

      <h2 className="font-bold mt-6">3. Storage</h2>
      <p>Stored on Supabase EU/US encrypted. Delete request: support@nixorastudios.com within 30 days.</p>

      <h2 className="font-bold mt-6">4. Cookies</h2>
      <p>Essential cookies only.</p>

      <h2 className="font-bold mt-6">5. Contact</h2>
      <p>Questions? Contact:</p>
      <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
        support@nixorastudios.com
      </a>

      <p className="mt-6">
        <Link to="/terms" className="underline text-link hover:text-link/80">
          Read Terms of Service
        </Link>
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
