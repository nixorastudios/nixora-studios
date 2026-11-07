# Roadmap

- [ ] Verification redirect: signup/resend use the production callback, validate confirmation before My Studio and show welcome; publish and verify. Hosted Site URL change requires More → Users → Auth settings → Advanced; domain wildcard already allowed.

- [x] Email verification security fix: hosted signup returned no session, test3@nixora.com password sign-in blocked with email_not_confirmed and My Studio redirected to login; signup instructions/resend button added, sole verified owner confirmed, 19 tests/build pass; not published. Test account remains unverified; inbox delivery not tested.

- [x] Owner correction: preserve anago.vincent.nnalue@gmail.com as the single verified app owner; no second owner, email transfer or further owner questions.
- [x] Core account additions: About and account links, protected dashboard/admin/profile, real aggregate waitlist count, fail-closed legacy owner export, private uploads integrated with existing engine handlers, Option A catalog/checkout and terms clauses; preview only, no publication. Signed-out gates and owner dashboard/admin, upload read-back/delete and cross-user storage denial verified; studio/payment regressions pass.
- [x] Final pricing correction: approved Option A subscriptions/packs, Squad-first test-only providers and exact shared-wallet costs; seven-day notice, twelve-month protection snapshot and current-month subscription lock recorded; existing homepage early-access offers unchanged.
- [ ] Personal Drive/Gmail — blocked: per-user OAuth clients absent; Drive setup card declined. Shared workspace accounts never substituted; setup-needed states shown.
- [ ] GitHub push verification — blocked: disposable private repository creation declined; existing account connection GET verified, no files pushed.
- [ ] Customer billing activation — blocked: genuine provider test secrets, verified Squad event/recurring/*737# contracts, recurring provider entitlements. Paid engine deductions and twelve-month usage-value allocation await billing activation; preview behavior remains unchanged. No live charging or automatic email alerts.
- [x] Build NIXORA CODE ENGINE: black/gold profession workspace, approval-first AI plan/build/check workflow, local ten-second autosave, private Cloud projects/history, sandboxed preview and project export; real signed-in plan/build, saved calculator arithmetic, export and mobile 3D verified; not published.
- [ ] External Code Engine GitHub push, hosting, Drive/Dropbox/Firebase connections — blocked: user-authorized service connections and hosting setup; show truthful connection states rather than simulated success.

- [x] Terms enforcement layer: terms_acceptance records (365-day validity), checkout schema requires terms/privacy acceptance + verified email, credit delivery blocked without fresh acceptance and verified email, future TermsCheckoutGuard component; 64 tests pass, real-database block verified; payments still not connected
- [x] Audit-fix preparation: legal aliases, private payment/evidence records, atomic credit operations, verified-signature Paystack handler, fail-closed Squad endpoint, protected reconciliation and truthful legal wording; 59 tests pass, real transaction/deduplication/refund checks pass, video preview unchanged
- [ ] Activate payment webhooks and reconciliation — blocked: Paystack signing key and authenticated checkout, Squad current signature/payload contract plus merchant setup, and publication before managed hourly scheduling; staffed support-mailbox monitoring needs an operator. See docs/payment-launch-readiness.md.

- [x] Professional text-to-video workspace: shot direction, authenticated generation, private saved videos, progress and downloads, optional image-to-video start frame; 49 tests pass, real gateway MP4 verified, desktop/phone UI verified
- [ ] Text-to-video signed-in end-to-end verification — blocked: no app auth users exist; sign in with Google or Lovable in the studio, then verify generation and private library read-back

- [x] Real private waitlist: both signup forms save to Cloud; privacy wording updated; database read-back confirms both sources and deduplication

- [x] Footer: 4-column layout (brand, product, legal, contact) on homepage
- [x] Rewrite Terms, Privacy, Refund to 800+ words each (Oct 30, 2026, CR 9950450)
- [x] New /security and /contact pages, dark theme, Back to Home
- [x] Publish sitemap to nixorastudios.com (all 6 URLs live)
- [x] Restructure 5 legal pages global-first: global intro first, Nigeria address/governing law only at bottom; no street address in page headers
- [x] Hero: remove any city name, keep "Global AI Video Studio" (no city was present)
- [x] Early Access section: 3 credit bundles (Starter ₦5,000 / Creator ₦20,000 / Studio ₦60,000), waitlist buttons scroll to email form — published live
- [ ] Submit sitemap to Google Search Console — blocked: user declined the Google connection card; ask to retry

- [x] Final update: simple legal pages, footer links, JSON-array local waitlist/count, ten placeholder models, verification
- [x] Prompt board: local draft confirmation and validated device-only email saving
- [x] Homepage footer: Terms, Privacy and Refund Policy links
- [x] AI video-prompt polish: visitor describes a video idea, a model turns it into a polished prompt for the video engines (AI Gateway)

- [x] Coming-soon homepage, local early-access form, fixed launch countdown, locked ten-engine grid
- [x] Safe watermark/signature helpers and available engine/JSON settings
- [x] Verify launch signup, countdown rules, watermark metadata, and existing routing (9 tests and browser checks)
- [ ] Import additional local model/prompt/JSON files — blocked: only the instruction document was uploaded

- [x] Engine cards: exact 10 names, 4-4-2 centered layout
- [x] Replace "GOD MODE" labels with owner wording in launcher and dashboard
- [x] Check project files for Chukwumannalue3@gmail.com (none found)
- [x] Remove the hash header and every visible Gmail address; use support@nixorastudios.com
- [x] Engine cards open a local prompt popup (draft saved in browser only, no generation claim)
- [x] Terms and Privacy pages: clickable support email, cross-links, Back to Home button
- [ ] Project member roles (owner/admin, requested restored admin) — set by the user in Lovable project settings, not in code
- [x] Real owner sign-in inside the app — database owner role, /owner page, owner-gated Code Engine Connections
- [x] Code Engine Connections + Triple Save — owner-gated Connections page, GitHub connector push/commits, 10s local + 30s Cloud sync, save status bar, My Projects versions/ZIP/delete, Publish Live at /projects/[slug]
