# Payment and dispute activation

The current studio preview is unchanged and does not spend customer credits. This change prepares private records and transactional helpers; it does not create checkout, take payments, issue cash refunds, answer a dispute, or monitor an inbox.

## Prepared
- `/refund-policy` and `/privacy-policy` reuse the existing legal pages; canonical links point to `/refund` and `/privacy`.
- Private payments include customer email, request-reported IP, user agent, provider, reference, expected amount/currency/credits, and credit delivery timestamp. Forwarded headers are contextual evidence, not verified identity.
- Atomic service-role-only fulfillment checks a registered order, credits it once, and records a balance snapshot. A repeated success cannot grant twice.
- `useCredit` checks payment/job ownership, a successful purchase, lot and wallet balances, and charges one credit once per job. It is deliberately not called by the preview engine.
- Charged jobs track prompt hash and outcome; a database trigger captures existing job status changes without editing the engine. Reconciliation restores only actually deducted credits for failed jobs, including older missed failures, once per job.
- Paystack raw-body HMAC-SHA512 verification precedes parsing and fulfillment. `charge.dispute.create` snapshots payment, delivery, credit ledger and generation evidence; stored 16-hour deadline is an internal target, not automatic provider submission.
- `/api/public/reconcile` requires generated managed cron authentication and a validated body; no browser account can invoke credit transactions.

## Required before payment launch
1. Add `PAYSTACK_SECRET_KEY` through the secure secret form, then register `https://nixorastudios.com/api/public/paystack-webhook` with Paystack. Complete merchant review. Run a signed sandbox transaction with a server-created order and verify balance, timestamp and duplicate delivery. Do not grant credits for metadata-provided user IDs or prices.
2. Build authenticated checkout to select definitive prices/bonus entitlements server-side, register an order before provider submission, and confirm amount/currency/reference/customer. Current early-value prices are not activated checkout prices. Stripe checkout is not implemented here.
3. Confirm Squad's current signature input, header, success payload, transaction verification API and dispute delivery contract using current merchant docs and an authentic sandbox fixture. Its old docs describe `x-squad-encrypted-body` and HMAC-SHA512 but are deprecated. The Squad endpoint returns 503 intentionally, even if a key is added. Do not assume a 16-hour Squad deadline.
4. Integrate wallet deductions with paid generation reservation in one controlled transaction, plus release/refund on definite failure; do not switch the current preview to billing implicitly. Add paid-flow browser tests before enabling.
5. Publish the reconciliation target, then create ONE managed hourly HTTP schedule targeting `/api/public/reconcile`, body `{"kind":"failed-credit-refunds"}`. This runs 24 times daily, normally restores within about one hour, and increases Cloud activity. Monitor failure/backlog; a schedule alone cannot guarantee 24 hours during outages. There is no schedule active from this change.
6. Assign support operators to check `support@nixorastudios.com` every 8 hours, maintain provider-dashboard access and escalation alerts, and submit evidence within actual provider deadlines. Email monitoring and evidence submission are not automated by a stored deadline. Paystack chargeback windows differ from pre-arbitration; confirm each case's deadline.
7. Define immutable evidence retention/access, NDPA lawful-basis and cross-border review, deletion procedure, incident response and consumer-law review. Current logs include sensitive data and must remain private. Technical implementation is not a compliance certification.

## Verification status
Local signature/rule/regression tests and database checks can verify safe preparation. Real checkout, authentic signed provider deliveries, staffed mailbox response and paid generation remain blocked by the above setup. Do not advertise these as live.