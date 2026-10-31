import { Link } from "@tanstack/react-router";

export default function Terms() {
  return (
    <div className="launch-theme min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-8 text-sm leading-7">
        <h1 className="mb-2 text-4xl font-bold">Terms of Service</h1>
        <p className="mb-8 text-muted-foreground">
          Last Updated: October 31, 2026 | NIXORASTUDIOS LTD (RC 9950450) |{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>
        </p>

        <h2 className="mt-8 text-lg font-bold">1. About NIXORA STUDIOS</h2>
        <p>
          NIXORA STUDIOS is a global AI video studio serving creators, filmmakers, marketers, and businesses
          worldwide — ten AI engines in one platform. Wherever you are in the world, the same service, the same
          engines, and the same terms apply to you. These Terms of Service ("Terms") form a binding agreement
          between you and NIXORASTUDIOS LTD ("NIXORA STUDIOS", "we", "us", "our"). By visiting nixorastudios.com,
          joining our waitlist, purchasing credits, or using any of our AI generation engines, you agree to these
          Terms. If you do not agree, please do not use the service. These Terms apply from the moment you access
          the site, including during our Coming Soon period before the full launch on November 23, 2026.
        </p>

        <h2 className="mt-8 text-lg font-bold">2. Services</h2>
        <p>
          The studio offers ten generative engines in one platform: Text to Image, Text to Video, Image to Video,
          Animation, Sound Effects, Voice Over, Music Studio, Lipsync, Video Editor, and Code Engine. During the
          Coming Soon period, the engines are shown as locked previews. Draft prompts stay on your device, except ideas you explicitly send for AI prompt polishing. Waitlist emails you submit are stored securely with NIXORA STUDIOS for early-access administration; joining sends no automatic email and does not guarantee a completed generation or priority production of your idea. After launch, each engine lets you generate creative content by
          spending credits. We may add, change, or retire engines over time, and we will do our best to announce
          material changes in advance.
        </p>

        <h2 className="mt-8 text-lg font-bold">3. Eligibility</h2>
        <p>
          You must be at least 18 years old to use NIXORA STUDIOS, join the waitlist, or purchase credits. By using
          the service you confirm that you are 18 or older and legally able to enter into this agreement in your
          country. If we learn that someone under 18 has created an account or made a purchase, we will close that
          account and refund any unused credits in line with our Refund Policy.
        </p>

        <h2 className="mt-8 text-lg font-bold">4. Accounts</h2>
        <p>
          When accounts open at launch, you will sign in with your email address. You are responsible for keeping
          your sign-in details private and for everything that happens under your account. Tell us immediately at
          support@nixorastudios.com if you believe someone else has accessed your account. We may suspend or close
          accounts that are shared, sold, or used fraudulently. One person may hold one account; creating multiple
          accounts to abuse promotions, free credits, or refunds is not allowed.
        </p>

        <h2 className="mt-8 text-lg font-bold">5. Credits &amp; Payments</h2>
        <p>
          Generations are paid for with credits: one credit equals one generation, and the credit is deducted when
          the generation starts. Payments are processed securely by Paystack, and your bank statement may show the
          payment under the name NIXORASTUDIOS LTD. We do not store your card details on our own servers. During the
          Coming Soon period there is no automatic subscription and no recurring billing of any kind — you only ever
          pay for the credits you choose to buy. Prices are shown before you pay, and credits do not expire while
          your account remains active.
        </p>

        <h2 className="mt-8 text-lg font-bold">6. Acceptable Use</h2>
        <p>
          You must not use NIXORA STUDIOS to create, request, or distribute pornography, nudity, or sexual content;
          hate speech or content that attacks people based on who they are; illegal content of any kind; content
          that infringes copyright, trademarks, or other people's rights; or content intended to deceive, defraud,
          or harm others. You must not attempt to break, probe, or overload the service, scrape it at scale, or
          resell access without our written permission. Breaking these rules can lead to immediate suspension or a
          permanent ban, and used credits will not be refunded in that case.
        </p>

        <h2 className="mt-8 text-lg font-bold">7. Intellectual Property &amp; Ownership</h2>
        <p>
          You own the videos, images, audio, and other content you generate with our engines, and you may use them
          commercially — in client work, advertising, social media, films, and products you sell, anywhere in the
          world. You keep all rights to the prompts and materials you provide. We keep all rights to the NIXORA
          STUDIOS name, logo, website, and the engines themselves. You may not claim our platform, models, or
          branding as your own, and you may not use our name or logo to imply endorsement without permission.
        </p>

        <h2 className="mt-8 text-lg font-bold">8. Refunds</h2>
        <p>
          Unused credits can be refunded within 7 days of purchase; used credits cannot be refunded because the
          computing cost is already spent; and failed generations are automatically refunded within 24 hours. The
          full rules, including how to request a refund and how long processing takes, are in our{" "}
          <Link to="/refund" className="underline text-link hover:text-link/80">
            Refund Policy
          </Link>
          , which forms part of these Terms.
        </p>

        <h2 className="mt-8 text-lg font-bold">9. Termination</h2>
        <p>
          You may stop using the service at any time and ask us to delete your account. We may suspend or terminate
          access if you break these Terms, if we are required to by law, or if continuing would put other users or
          the platform at risk. When an account is terminated for a breach, used credits are forfeited; unused
          credits are handled under the Refund Policy. Sections that by their nature should survive — such as
          ownership, liability, and governing law — continue to apply after termination.
        </p>

        <h2 className="mt-8 text-lg font-bold">10. Disclaimer</h2>
        <p>
          The service is provided "as is" and "as available". AI-generated content can be unpredictable: results
          may contain errors, artefacts, or content that does not match your prompt, and it is your responsibility
          to review anything you generate before publishing or using it commercially. We do not promise that the
          service will always be available, uninterrupted, or error-free, especially during the Coming Soon period
          and early launch phase.
        </p>

        <h2 className="mt-8 text-lg font-bold">11. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, NIXORASTUDIOS LTD will not be liable for indirect, incidental, or
          consequential losses — such as lost profits, lost data, or lost business — arising from your use of the
          service. Our total liability to you for any claim is limited to the amount you paid us in the three months
          before the claim arose. Nothing in these Terms removes rights you have under applicable consumer
          protection law that cannot lawfully be removed.
        </p>

        <h2 className="mt-8 text-lg font-bold">12. Contact &amp; Legal Entity</h2>
        <p>
          NIXORA STUDIOS is operated by NIXORASTUDIOS LTD, RC 9950450. Registered address: 81 Friday Momomi
          Egwuogwu Street, Amachai 2, Okpanam, Asaba, Delta State, Nigeria. Questions about these Terms:{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>
          .
        </p>

        <h2 className="mt-8 text-lg font-bold">13. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the Federal Republic of Nigeria. Any dispute that we cannot
          resolve together will be handled by the courts of Nigeria, and you agree to their jurisdiction. If any
          part of these Terms is found unenforceable, the rest remains in force.
        </p>

        <p className="mt-8">
          <Link to="/privacy" className="underline text-link hover:text-link/80">
            Read Privacy Policy
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
