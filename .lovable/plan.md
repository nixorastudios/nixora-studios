# NIXORA studio core completion

## Preserve what works
Keep the existing homepage appearance, camera photo, legal content, footer layout, waitlist saving, Code Engine workspace and approval/version workflow, authentication, domain configuration, and image/video generation. Add only the requested links, truthful counts, account protections and integration hooks. Do not build or rebuild other engines. Do not publish this update.

## 1. About and navigation
- Add `/about` for **NIXORA STUDIOS LTD - CR 9950450**, identifying Vincent as founder and describing the ten-engine vision and mission without inventing personal history or awards.
- Add About and account links to the existing homepage header/footer without changing their layout or existing links. Check mobile widths.

## 2. User dashboard, owner administration and profile
- Reuse existing sign-in, session validation and database roles rather than creating a second account system. Provide `/login` as the requested public sign-in entry.
- Add protected `/dashboard`: the signed-in user's Cloud projects, credit balance, recorded engine activity, private uploaded files and a start-project action opening the existing engines.
- Add protected `/admin`: server-authorized owner access to user, waitlist, project and payment totals, with paginated lists of all users, projects and payments. Ordinary users cannot fetch these records directly.
- Add protected `/profile`: editable name and photo, plus secure password update/recovery through the existing account service. Photo changes use private storage; never use editable profile fields to assign roles.
- Remove the legacy Extension Dashboard's unconditional `isOwner={true}`. Keep its opening, tabs, local saving and close behavior unchanged. Owner controls require the existing verified server-side role check; no browser email checks.
- **Single owner, unchanged:** preserve `anago.vincent.nnalue@gmail.com` as the only verified owner using the existing server-side role. Ignore the nonexistent business-email account. Do not add a second owner, transfer access or ask about ownership again. Do not display the personal owner email on public pages.

## 3. Genuine public numbers
- Replace the illustrative waitlist total with an aggregate database count that never exposes signup emails.
- Remove the illustrative visitor total: no historical visitor tracking exists, so a genuine lifetime visitor total cannot be recovered. Do not add analytics, fingerprinting or a misleading counter just to fill that space.
- If a count cannot be loaded, show an unavailable state rather than a fabricated zero or sample total.

## 4. Personal Google connections and GitHub verification
- Use separate Google Drive and Gmail App User Connectors, each tied to the signed-in user's account—not the builder's shared Google connections.
- Drive displays the user's files; Gmail displays the user's inbox count. Include connect, reconnect, disconnect, loading and error states.
- Preserve GitHub's existing owner-only connection and push workflow. Test with a clearly named disposable private repository, then read the uploaded file/commit back and report the actual result.
- **Google setup required:** no per-user OAuth clients are configured yet. A workspace owner/admin must configure and link them. Register only `https://connector-gateway.lovable.dev/api/v1/app-users/oauth2/callback` as Google's redirect URI, enable offline access, and publish the Google OAuth app or use Internal audience where applicable. Do not substitute the shared Gmail/Drive credentials.

## 5. Paystack-only credit checkout
- Add protected `/checkout` using exactly these server-priced bundles:
  - 100 credits: **₦15,000**
  - 500 credits: **₦60,000**
  - 1000 credits: **₦100,000**
- Reuse the existing verified-email checks, single terms-acceptance record, payment-attempt logging, signature-verified Paystack webhook and atomic/idempotent credit fulfillment. No duplicate terms store or new wallet system.
- Register the buyer and server-selected order before starting Paystack checkout. Verify the provider result before displaying success; browser redirects never deliver credits on their own.
- Add owner-visible payment alerts from fulfilled payment records. Automatic email alerts require a separately configured delivery service; do not claim emails were sent without one.
- Keep homepage early-access offers unchanged, as requested; these checkout bundles are separate. Keep live charging disabled until genuine credentials and launch authorization exist.
- Provide an owner-only payment setup/status section, but **do not store secret keys in browser storage, ordinary settings rows or source code**. Use secure project secret entry rather than an ordinary dashboard textbox. Genuine Paystack test keys are required to complete a test transaction; placeholders cannot take payments or create credits.
- Do not add Stripe, Flutterwave or activate Squad.

## 6. Private uploaded-file library
- Create private `nixora-uploads` storage and user-owned file records, integrated with existing engine upload handlers without redesigning them.
- Signed-in image/video uploads are saved under the authenticated user's identity and listed on their dashboard. Signed-out uploads must not silently persist or share ownership.
- Keep base64 image data out of local drafts and database settings; save file bytes privately and record only metadata/storage paths. This deliberately replaces the previous transient-only upload policy for user-uploaded files; generated-video storage and the existing image handoff remain compatible.
- Validate file type/size, show upload progress/errors, support deletion, and use expiring access links. Do not make the bucket public or expose another user's files.

## Technical details
- Use the project's TanStack routes and authenticated server functions; every private read/write verifies the caller independently of page access.
- Reuse `user_roles`, `credit_balances`, `payments`, `terms_acceptance`, existing Code Engine/video tables and generated Cloud clients. Add a profile table only for the requested user-facing profile fields, file metadata and encrypted per-user connector storage as needed.
- Persist encrypted Google connection keys only server-side, keyed by authenticated user ID and connector ID. Validate popup origin, source, connector and OAuth completion before showing Connected.
- Public waitlist totals use a narrow aggregate-only read path; no public signup-list access. Owner administration checks `has_role` before privileged reads.
- Use the project's design tokens and existing controls. Add route-specific metadata; keep private account/checkout pages out of the public sitemap and add About to it.

## Verification and delivery checklist
- Run existing regressions plus focused tests for exact credit prices, verified-email/terms enforcement, owner/user isolation, upload ownership and duplicate payment fulfillment.
- Test signed-out dashboard/admin/profile/checkout access, a genuine user dashboard read-back, owner administration, and denial of a non-owner request.
- Check About links and unchanged homepage/legal/studio flows on desktop and mobile.
- Upload a real file, read it back through the dashboard and confirm another user cannot access it.
- Complete Paystack test checkout and verify credits once; replay the successful result and confirm no duplicate credits, only after test credentials are configured.
- Complete Drive/Gmail consent and read back actual files/inbox count after OAuth clients are configured.
- Verify a real GitHub push and resulting commit only with authorized owner access and a disposable target.
- Deliver the requested owner/user login, Paystack test and Drive test instructions, clearly distinguishing verified flows from anything blocked by credentials or account setup.
