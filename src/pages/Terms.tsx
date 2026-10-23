import { Link } from "@tanstack/react-router";
export default function Terms() {
  return (
    <div className="p-8 max-w-5xl mx-auto text-sm leading-6">
      <h1 className="text-4xl font-bold mb-2">Nixora Studios Terms of Service</h1>
      <p className="mb-6">Last Updated: Oct 23, 2026 | NIXORASTUDIOS LTD</p>

      <h2 className="font-bold mt-6">1. Services</h2>
      <p>
        10 AI generative modules - Text to Image, Photo to Video, Text to Video, Animation Characters, Voice Over, Sound
        Effects, Lipsync, Music DAW, Video Editor, CODE Engine.
      </p>

      <h2 className="font-bold mt-6">2. Age & Use</h2>
      <p>
        Must be 18+. No porn, nudity, sexual content, hate speech, illegal or copyright infringement. Violation = ban.
      </p>

      <h2 className="font-bold mt-6">3. Credits</h2>
      <p>1 credit = 1 generation. Deducted at start. Failed generations auto-refunded in 24h.</p>

      <h2 className="font-bold mt-6">4. Ownership</h2>
      <p>You own all videos you create. Commercial use allowed.</p>

      <h2 className="font-bold mt-6">5. Refunds</h2>
      <p>Unused credits refundable within 7 days. Used credits non-refundable due to GPU costs. See Refund page.</p>

      <h2 className="font-bold mt-6">6. Contact</h2>
      <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
        support@nixorastudios.com
      </a>

      <p className="mt-6">
        <Link to="/privacy" className="underline text-link hover:text-link/80">
          Read Privacy Policy
        </Link>
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
