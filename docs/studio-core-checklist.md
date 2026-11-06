# Core completion test checklist

This update is not published. Payment activation and personal Google connections remain blocked by setup; no shared Google account is exposed.

## Owner
1. Open `/login` and use your existing verified owner account.
2. Open `/dashboard`; confirm your own Cloud projects and wallet.
3. Open `/admin`; confirm owner totals and paginated account/payment records. Never share these records publicly.

## User
1. Sign out, then open `/dashboard`, `/profile`, `/checkout` and `/admin`; each requires sign-in.
2. Sign in with an ordinary verified account; confirm only its projects and private files appear. `/admin` must deny access.
3. Change your name and save. Upload a profile photo and save. Password updates use the account provider, not a local password store.
4. Upload an image in the private library; wait for the file row, reload, open the expiring link and delete it. Test another account cannot access its path.

## Payments
1. `/checkout` displays exact Option A subscriptions and packs and uses one wallet.
2. Continue is disabled until verified sign-in and recorded terms acceptance.
3. Squad main stays blocked until merchant contracts, genuine sandbox credentials, USSD *737# and recurring billing are verified.
4. Paystack backup requires a genuine `sk_test_` secret through secure project secret entry. No placeholder or live key can start checkout.
5. Once configured, buy a one-time pack in sandbox, return, verify the wallet, and replay verification to confirm no duplicate delivery. Subscription checkout is unavailable until verified recurring integration exists.
6. Paid engine deductions and purchase-value protection must be integrated and tested before customer billing activation. Preview generation remains unchanged and does not claim to debit customer credits.

## Google / GitHub
1. Personal Drive and Gmail require workspace App User Connector OAuth clients with offline access; the Drive setup card was declined. Neither connection currently reads files or inbox data.
2. Use the gateway callback `https://connector-gateway.lovable.dev/api/v1/app-users/oauth2/callback`; publish the Google OAuth app or use Internal audience when applicable.
3. After setup, complete consent separately for Drive and Gmail and verify actual files/inbox count. Do not substitute shared workspace credentials.
4. Existing GitHub connection account was verified as `nixorastudios`. Creation of a disposable private test repository was declined; no push was performed.