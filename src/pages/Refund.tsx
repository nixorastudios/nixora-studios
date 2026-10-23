import { Link } from "@tanstack/react-router";
export default function Refund() {
  return (
    <div className="p-8 max-w-5xl mx-auto text-sm leading-6">
      <h1 className="text-4xl font-bold mb-2">Nixora Studios Refund Policy</h1>
      <p className="mb-6 text-muted-foreground">
        Last Updated: Oct 23, 2026 | NIXORASTUDIOS LTD | support@nixorastudios.com
      </p>

      <h2 className="font-bold mt-6">1. Unused Credits</h2>
      <p>
        Unused credits are refundable within 7 days of purchase. Email{" "}
        <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
          support@nixorastudios.com
        </a>{" "}
        with your account email and the payment reference to request a refund.
      </p>

      <h2 className="font-bold mt-6">2. Used Credits</h2>
      <p>Used credits are non-refundable because GPU compute is already spent when a generation runs.</p>

      <h2 className="font-bold mt-6">3. Failed Generations</h2>
      <p>Failed generations are auto-refunded to your credit balance within 24 hours. No request is needed.</p>

      <h2 className="font-bold mt-6">4. Subscriptions</h2>
      <p>
        Subscriptions can be cancelled anytime. Cancelling stops the next billing cycle; the current month is not
        refunded.
      </p>

      <h2 className="font-bold mt-6">5. Processing</h2>
      <p>
        Approved refunds are processed in 5-7 days back to the original payment method via Paystack (NGN) or Stripe
        (USD).
      </p>

      <h2 className="font-bold mt-6">6. Contact</h2>
      <p>Questions? Contact:</p>
      <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
        support@nixorastudios.com
      </a>

      <p className="mt-6">
        <Link to="/terms" className="underline text-link hover:text-link/80">
          Read Terms of Service
        </Link>
        <span className="mx-2 text-muted-foreground">|</span>
        <Link to="/privacy" className="underline text-link hover:text-link/80">
          Read Privacy Policy
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
