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

## 5. Option A FINAL — subscriptions and one-time packs
Add protected `/checkout` with both systems and exactly these server-selected prices and credit amounts. Reject all superseded checkout bundles; never double the credit amounts below.

### A. Subscription — monthly
| Plan | Monthly price | Credits | Seats |
| --- | ---: | ---: | ---: |
| PRO | **₦30,000** | **150** | — |
| ULTRA — **MOST POPULAR** | **₦60,000** | **500** | — |
| BUSINESS/GROUP | **₦120,000** | **1,500** | **3** |

### B. Packs — one-time, no subscription
| Pack | One-time price | Credits |
| --- | ---: | ---: |
| Small | **₦7,500** | **60** |
| Medium | **₦15,000** | **150** |
| Large | **₦35,000** | **500** |

### One wallet for all engines
| Engine action | Credit cost |
| --- | ---: |
| Image | **2** |
| Voice — per minute | **4** |
| Song | **10** |
| Video — per 5 seconds | **20** |
| Code App | **25** |

- Customers can switch engines using the same wallet, without purchasing another subscription. Reuse the existing credit ledger and atomic/idempotent deductions and refunds, rather than introducing separate engine wallets. Connect these costs only to implemented paid actions; do not build missing engines.
- Reuse verified-email checks, the single terms-acceptance record and payment-attempt logging. Register the authenticated buyer and server-priced order before provider checkout; browser redirects never deliver credits.
- Record subscription status and verified billing events, grant credits once per paid billing period, and enforce the BUSINESS/GROUP three-seat entitlement server-side. Support cancellation and accurate next-billing information; do not assume unrequested rollover or pack expiry rules.
- Add owner-visible payment alerts from fulfilled payment records. Automatic email alerts require a configured delivery service; never claim emails were sent without one.
- Keep homepage early-access offers unchanged, as requested; these checkout products are separate. Keep all payment work in test mode, with live charging disabled.

### T&C addition
- Prices and credit amounts may change with **7 days notice on the website**.
- Credits bought before a change **keep their old value for 12 months**; retain purchase-time pricing and usage-value information so later changes cannot silently devalue them during that period.
- The **subscription price is locked for the current billing month**.
- Add these clauses to the existing terms, with no second acceptance store and no unrelated legal rewrite.

## 6. Payment gateways and private uploaded-file library
### MAIN — Squad by HabariPay / GTBank (GTCO)
- **Test keys only.** Required payment methods: **Card, Bank Transfer, USSD *737#**, and **recurring billing for subscriptions**.
- Verify Squad's current official test API, raw-body webhook signature/event contract, supported payment channels and recurring-billing capabilities before activation. Implement the required flows using the verified contract; unsupported or unverified capabilities remain visibly unavailable rather than simulated.
- Replace the existing fail-closed Squad stub only after that verification. Squad is required as the main provider; do not route subscriptions through an invented recurring-payment contract.

### BACKUP — Paystack
- **Test keys only.** Preserve and reuse the existing verified-signature webhook and registered-order credit fulfillment as the backup payment path.
- Use deliberate provider selection/fallback before a payment starts; never automatically submit to a second provider after an uncertain payment result. Prevent duplicate delivery across both providers.
- Provide owner-only configuration/status controls. Collect genuine test keys through secure secret entry, never ordinary dashboard textboxes, browser storage, source code or plaintext database settings. Placeholder keys cannot complete payments or create credits.
- Test Squad checkout, supported channels and recurring renewal/cancellation; test Paystack backup checkout and replay successful events to confirm no duplicate credits. Keep live charging disabled and report any credential/provider-contract blockers honestly.

### Private uploaded-file library — preserved
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
