import { Link } from "@tanstack/react-router";

export default function Security() {
  return (
    <div className="launch-theme min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-8 text-sm leading-7">
        <h1 className="mb-2 text-4xl font-bold">Security</h1>
        <p className="mb-8 text-muted-foreground">
          Last Updated: October 30, 2026 | NIXORASTUDIOS LTD (RC 9950450) |{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>
        </p>

        <h2 className="mt-8 text-lg font-bold">1. About NIXORA STUDIOS</h2>
        <p>
          NIXORA STUDIOS is a global AI video studio serving creators worldwide — ten AI engines in one platform.
          This page explains how we protect your account, your content, and your payments, wherever you use the
          service from. Security is built into every layer: the connection between your browser and our servers,
          the payment processing, and the storage of your data.
        </p>

        <h2 className="mt-8 text-lg font-bold">2. Encrypted Connections (SSL)</h2>
        <p>
          Every connection to nixorastudios.com is protected with HTTPS/SSL encryption, provided automatically
          through our hosting on Lovable. This means the data between your browser and our servers — including your
          sign-in details and prompts — cannot be read in transit by third parties. You can confirm this any time
          by checking for the padlock icon in your browser's address bar.
        </p>

        <h2 className="mt-8 text-lg font-bold">3. No Card Storage</h2>
        <p>
          We never see, store, or process your full card details on our own servers. All payments are handled by
          Paystack, which is PCI-DSS compliant — the same security standard used by banks and major payment
          companies worldwide. Your card information goes directly to Paystack over their secure connection and
          never touches our database.
        </p>

        <h2 className="mt-8 text-lg font-bold">4. Encrypted Data Storage</h2>
        <p>
          Account data and your generated content are stored on Supabase infrastructure with encryption in transit
          and at rest. Access to production data is restricted to the systems and people that need it to operate
          the service, and we use row-level security rules so that each account can only reach its own data.
        </p>

        <h2 className="mt-8 text-lg font-bold">5. Abuse Monitoring</h2>
        <p>
          We monitor the platform for abuse, fraud, and attacks — including unusual generation patterns, repeated
          failed payments, and attempts to probe or overload the service. Accounts involved in abuse may be
          suspended to protect other users, in line with our Terms of Service.
        </p>

        <h2 className="mt-8 text-lg font-bold">6. Report a Security Issue</h2>
        <p>
          If you believe you have found a security vulnerability in NIXORA STUDIOS, please tell us privately before
          sharing it publicly. Email{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>{" "}
          with the details and we will investigate and respond as quickly as we can. We appreciate responsible
          disclosure and will not take action against good-faith security research reported this way.
        </p>

        <h2 className="mt-8 text-lg font-bold">7. Contact &amp; Legal Entity</h2>
        <p>
          NIXORA STUDIOS is operated by NIXORASTUDIOS LTD, RC 9950450. Registered address: 81 Friday Momomi
          Egwuogwu Street, Amachai 2, Okpanam, Asaba, Delta State, Nigeria.
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
