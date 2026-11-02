import { Link } from "@tanstack/react-router";

export default function Refund() {
  return (
    <div className="launch-theme min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-8 text-sm leading-7">
        <h1 className="mb-2 text-4xl font-bold">Refund Policy</h1>
        <p className="mb-8 text-muted-foreground">
          Last Updated: November 2, 2026 | NIXORASTUDIOS LTD (RC 9950450) |{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>
        </p>

        <h2 className="mt-8 text-lg font-bold">1. About NIXORA STUDIOS</h2>
        <p>
          NIXORA STUDIOS is a global AI video studio serving creators worldwide — ten AI engines in one platform.
          This Refund Policy explains credit refunds and mandatory cash-refund exceptions, wherever you are. It applies to credit
          purchases made on nixorastudios.com and forms part of our Terms of Service. During the Coming Soon period
          no payments are taken, and there are no subscriptions or recurring charges. This policy sets out the rules
          for future one-off credit purchases. If we introduce subscriptions later, we
          will update this page before they go on sale. Our goal is simple: you should never pay for something you
          did not receive, and you should always know exactly where your money went. Every rule below is written to
          be fair to you while covering the real computing costs behind each generation.
        </p>

        <h2 className="mt-8 text-lg font-bold">2. How the Credit System Works</h2>
        <p>
          Generations on NIXORA STUDIOS are paid for with credits. One credit equals one generation, and the credit
          is deducted from your balance at the moment the generation starts — not when it finishes. This matters for
          refunds because a credit that has been spent on a running or completed generation has already consumed
          real computing power. You can always see your remaining balance in your account, and every deduction is
          recorded once customer credit billing is activated so we can trace what happened if something goes wrong.
          Customer checkout and credit billing are not yet active; the current video preview does not deduct a customer wallet.
          Credits will be sold in bundles at the prices shown before you pay, and credits do
          not expire while your account remains active. If we ever change how credits work, we will announce the
          change before it affects a balance you have already paid for.
        </p>

        <h2 className="mt-8 text-lg font-bold">3. Unused Credits — Refundable</h2>
        <p>
          Credits you have bought but not spent can be refunded within 7 days of purchase. To request a refund,
          email{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>{" "}
          from the email address on your account and include your payment reference. We will confirm the request,
          check that the credits are unused, and resolve an eligible request in credits. Unused credits are refundable
          within 7 days in credits, not cash. Cash refunds apply only where required by law or a payment-provider
          dispute decision. This policy does not restrict mandatory consumer rights, including applicable rights
          to cancel or receive a cash remedy. After 7 days,
          unused credits are no longer refundable but remain valid in your account while it is active.
        </p>

        <h2 className="mt-8 text-lg font-bold">4. Used Credits — Non-Refundable</h2>
        <p>
          Credits that have been spent on a generation cannot be refunded. Each generation runs on GPU computing
          power that is paid for and consumed the moment your generation starts, whether or not you like the final
          result. AI output is naturally unpredictable, so we encourage you to test ideas with small generations
          first. A result you simply do not like is not grounds for a refund — but a generation that technically
          failed is covered by the next section.
        </p>

        <h2 className="mt-8 text-lg font-bold">5. Failed Generations — Automatic Refund</h2>
        <p>
          If a generation fails on our side — for example the engine errors out, times out, or returns no usable
          output — a deducted customer credit will be returned in credits within 24 hours through reconciliation
          when customer billing is activated. Only credits actually deducted for that failed job are restored,
          once per job; a free preview or uncertain submission does not create extra credits. If 24 hours
          pass and your credit has not come back, email us with the generation details and we will fix it manually.
        </p>

        <h2 className="mt-8 text-lg font-bold">6. Mistaken or Double Charges</h2>
        <p>
          If you were charged twice for the same purchase, charged the wrong amount, or charged for something you
          never bought, contact us within 7 days of the charge at{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>{" "}
          with your payment reference and a screenshot if you have one. Verified mistaken or duplicate charges are
          refunded in full to the original payment method. Please contact us first before going to your bank — we
          resolve these quickly, and it is almost always faster than a formal dispute. If a payment you made does
          not appear in your account at all, that is also covered here: send us the receipt and we will either
          credit your account or refund you in full.
        </p>

        <h2 className="mt-8 text-lg font-bold">7. How to Request a Refund &amp; Chargebacks</h2>
        <p>
          Every refund request goes through{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>
          . Include the email on your account, the payment reference, the date of purchase, and a short description
          of the issue. Approved cash refunds required by law or a payment-provider dispute decision are processed
          within 5–7 business days to the original payment method, subject to the provider's processing time.
          Ordinary eligible unused-credit requests are resolved in credits. If you file a chargeback with your bank, we will share the
          relevant transaction and generation records with the bank as evidence. A good-faith dispute does not
          itself constitute abuse. Accounts that fraudulently abuse chargebacks — for
          example disputing charges for credits that were genuinely used — may be suspended, and repeated abuse
          leads to a permanent ban. We would always rather solve the problem with you directly, so please reach out
          first.
        </p>

        <h2 className="mt-8 text-lg font-bold">8. Contact &amp; Legal Entity</h2>
        <p>
          NIXORA STUDIOS is operated by NIXORASTUDIOS LTD, RC 9950450. Registered address: 81 Friday Momomi
          Egwuogwu Street, Amachai 2, Okpanam, Asaba, Delta State, Nigeria. Refund requests and questions:{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>
          . This policy is governed by the laws of the Federal Republic of Nigeria.
        </p>

        <p className="mt-8">
          <Link to="/terms" className="underline text-link hover:text-link/80">
            Read Terms of Service
          </Link>
          <span className="mx-2 text-muted-foreground">|</span>
          <Link to="/privacy" className="underline text-link hover:text-link/80">
            Read Privacy Policy
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
