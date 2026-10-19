// NIXORA STUDIOS - PRIVACY POLICY - GOD MODE - NX-OWNER-2026-PREMIUM
export default function Privacy() {
  return (
    <div className="p-8 max-w-5xl mx-auto text-sm leading-6">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy - NIXORA STUDIOS</h1>
      <p className="mb-6 text-gray-500">Effective: Oct 19, 2026 | Hash: NX-OWNER-2026-PREMIUM | Asaba, Delta, Nigeria | Data Controller: NIXORA STUDIOS | Supabase: users, waitlist, subscriptions, profiles</p>

      <h2 className="text-xl font-bold mt-6">1. DATA WE COLLECT</h2>
      <p>Account: email, hash, subscription tier, credits balance. Usage: prompts, generations metadata (not raw private video unless you opt-in), IP, device, export timestamps, watermark injection logs via watermark.ts. Payment: Stripe/Paystack token (we don't store card). Owner Channels: NX_KIDS_001 etc usage for analytics. We collect owner verification email anago.vincent.nnalue@gmail.com for God Mode.</p>

      <h2 className="text-xl font-bold mt-6">2. HOW WE USE & GDPR/NDPA</h2>
      <p>To provide AI SaaS, deduct credits, inject God Mode signature, prevent free abuse, detect null hash e3b0c44, comply with NDPA Nigeria + GDPR for EU users. Legal basis: contract, legitimate interest (anti-fraud), consent for waitlist marketing. Retention: Active account + 2 years, waitlist until unsubscribe, logs 90 days. You have rights: access, delete, export (request via contact).</p>

      <h2 className="text-xl font-bold mt-6">3. SHARING & SECURITY</h2>
      <p>Shared with: Supabase (DB), Vercel (hosting), Stripe/Paystack (payment), no sale of data. We hash owner data with NX-OWNER-2026-PREMIUM. Security: bcrypt passwords, RLS on Supabase, signature.ts immutable. Breach notification within 72h.</p>

      <p className="mt-6">Contact: nixorastudios.com | Asaba 2026 | All rights Commercial Premium - Not Free Content</p>
    </div>
  )
}
