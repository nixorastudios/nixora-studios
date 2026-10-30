import { Link } from "@tanstack/react-router";

export default function Privacy() {
  return (
    <div className="launch-theme min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-8 text-sm leading-7">
        <h1 className="mb-2 text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-muted-foreground">
          Last Updated: October 30, 2026 | NIXORASTUDIOS LTD (RC 9950450) |{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>
        </p>

        <h2 className="mt-8 text-lg font-bold">1. Data Controller</h2>
        <p>
          The data controller for your personal information is NIXORASTUDIOS LTD, registered in the Federal Republic
          of Nigeria with registration number RC 9950450, at 81 Friday Momomi Egwuogwu Street, Amachai 2, Okpanam,
          Asaba, Delta State, Nigeria. As data controller, we decide why and how your personal data is processed and
          we are responsible for keeping it safe. You can reach us about anything in this policy at
          support@nixorastudios.com.
        </p>

        <h2 className="mt-8 text-lg font-bold">2. Data We Collect</h2>
        <p>
          We collect only what we need to run the studio. During the Coming Soon period, the waitlist email address
          and any draft prompts you enter are stored on your own device, in your browser's local storage — they are
          not sent to us. After launch, we collect your account email address, the prompts you submit, the content
          you generate, and payment information. Payments are processed by Paystack; we never see or store your full
          card number, and no card details are kept on our servers. We also keep basic technical logs (such as error
          reports) that help us keep the service running and secure.
        </p>

        <h2 className="mt-8 text-lg font-bold">3. How We Use Your Data</h2>
        <p>
          We use your data to provide the ten AI engines and deliver your generations; to process your payments,
          which appear on your statement as NIXORA STUDIOS; to send you receipts and important service messages; to
          prevent fraud, abuse, and misuse of the platform; and to fix problems and improve the service. We do not
          sell your personal data to anyone, and we do not use your prompts or generated content to advertise to you
          or to third parties.
        </p>

        <h2 className="mt-8 text-lg font-bold">4. Legal Basis</h2>
        <p>
          We process your data on two main legal bases under the Nigeria Data Protection Act (NDPA): your consent —
          for example when you join the waitlist or contact us — and contract — when processing is necessary to
          provide the service you signed up for, such as running your generations and processing your payments. In
          limited cases we also rely on our legitimate interest in keeping the platform secure and preventing abuse.
          Where we rely on consent, you can withdraw it at any time.
        </p>

        <h2 className="mt-8 text-lg font-bold">5. Storage &amp; Security</h2>
        <p>
          Account and generation data is stored on Supabase infrastructure with encryption in transit and at rest.
          Connections to nixorastudios.com are protected with SSL/HTTPS. We limit access to personal data to the
          people and systems that need it to operate the service. No method of storage is perfectly secure, but we
          work to protect your information and will tell you promptly if a breach affects your data, as the law
          requires.
        </p>

        <h2 className="mt-8 text-lg font-bold">6. Cookies</h2>
        <p>
          We use essential cookies and browser storage only — the ones needed to keep you signed in, remember your
          preferences, and keep the site working. We do not use advertising or cross-site tracking cookies. During
          the Coming Soon period, your waitlist email and drafts live in your browser's local storage, which you can
          clear at any time through your browser settings.
        </p>

        <h2 className="mt-8 text-lg font-bold">7. Third Parties</h2>
        <p>
          We share data with a small number of providers that help us run the service: Paystack, which processes
          payments under its own PCI-DSS compliant security program; Supabase, which hosts our database; and
          Cloudflare, which helps deliver and protect the website. Stripe is not used yet. Each provider processes
          data only as needed to deliver its service to us and under its own privacy terms. We may also disclose data
          if the law requires it.
        </p>

        <h2 className="mt-8 text-lg font-bold">8. Your Rights</h2>
        <p>
          Under the NDPA you have the right to access the personal data we hold about you, to correct it, and to ask
          us to delete it. You can also object to certain processing or withdraw consent. To use any of these rights,
          email{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>{" "}
          and we will respond within 30 days. Because Coming Soon data is stored only on your device, you can delete
          it yourself at any time by clearing your browser storage — no request needed.
        </p>

        <h2 className="mt-8 text-lg font-bold">9. Children</h2>
        <p>
          NIXORA STUDIOS is not intended for anyone under 18, and we do not knowingly collect personal data from
          children. If you believe a child has given us personal data, contact us and we will delete it.
        </p>

        <h2 className="mt-8 text-lg font-bold">10. Changes to This Policy</h2>
        <p>
          If we change this policy, we will update the "Last Updated" date above and, for significant changes,
          announce them on the site or by email where we have your address. Continuing to use the service after a
          change means you accept the updated policy.
        </p>

        <h2 className="mt-8 text-lg font-bold">11. Contact</h2>
        <p>
          Privacy questions or requests:{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>
          , or write to NIXORASTUDIOS LTD, 81 Friday Momomi Egwuogwu Street, Amachai 2, Okpanam, Asaba, Delta State,
          Nigeria.
        </p>

        <p className="mt-8">
          <Link to="/terms" className="underline text-link hover:text-link/80">
            Read Terms of Service
          </Link>
          <span className="mx-2 text-muted-foreground">|</span>
          <Link to="/refund" className="underline text-link hover:text-link/80">
            Read Refund Policy
          </Link>
        </p>
        <div className="mt-8 pb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
