<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the embedded studio's avatar controller in its single HTML file; use AnalyserNode for uploaded audio and speech events for browser TTS because speech synthesis exposes no audio stream.
- Identify engine cards with stable data-tool keys, not grid positions; in-session drag reordering must not change audio targets.
- Scope the temporary launch theme to its page so existing studio surfaces retain their design tokens.
- Keep launch timing and local signup normalization in a pure shared module with behavioral tests; never treat illustrative counters as analytics.
- Browser config imports only explicitly selected public JSON; exclude certificates, credentials, private local files, and placeholder service URLs.
- Homepage cards select existing tool configs by stable slug from the public models.json registry; null model placeholders never imply a connected service.
- Local waitlist reads accept legacy email strings and JSON arrays; writes use normalized, deduplicated JSON arrays to preserve existing device-only signups.
- Watermark exports use PNG metadata plus canvas text, with attribution passed by the caller; metadata and public digests never authorize access.
- Owner checks fail closed until a verified server-side role service exists; browser email comparisons must never grant privileges.
- AI gateway calls live in a server-only `*.server.ts` module behind a `createServerFn` wrapper in a `*.functions.ts` file, because only handler bodies are stripped from client bundles and the key must never reach the browser.
- Launch waitlist uses a validated, public insert-only server function and a service-role-only table; no visitor or signed-in user can read emails, duplicates return identical success, and owners manage signups through Lovable Cloud rather than an unverified owner dashboard.
- Text-to-video lives on the existing tool route; authenticated server functions reserve one active project job before submission, verify ownership on reads, and persist completed MP4s privately before issuing short-lived signed URLs, preventing duplicate paid submissions and cross-user access.
- Image-to-video start frames are compressed in the browser and excluded from job settings/drafts; signed-in user-uploaded source files are saved separately in the private library with user-scoped paths and metadata, never base64 database payloads.
- Customer credit billing is isolated from the existing video preview; service-role-only database functions lock balances and enforce idempotent payment fulfillment, per-job deductions and failed-job refunds so new billing cannot change preview behavior or create credits from uncharged jobs.
- Payment fulfillment requires a pre-registered server-priced order and verified raw-body signature; Squad remains fail-closed until its current merchant signature and event contract are confirmed, preventing invented payloads from delivering credits.
- Failed-credit reconciliation uses generated managed cron authentication rather than a manually shared CRON_SECRET; only activate its hourly schedule after the target is published, to avoid callbacks into a missing deployment.
- Terms acceptance is enforced in one place only: `terms_acceptance` rows (365-day validity) checked inside `purchaseCredits` before any credit delivery, plus schema-level guards in `logPaymentAttempt`; never add a second acceptance store or a client-side bypass, and keep the video studio's AI-processing consent checkbox separate from checkout terms.
- Text-to-image streams through authenticated server routes (/api/generate-image, /api/edit-image) because server functions cannot carry SSE or uploads; prompt create/modify/scene-split is a separate authenticated server function, and 8K/16K are client-side export upscales, never claimed as native model output.
- Animation and Lipsync reuse the Text-to-Video studio via a variant prop (engine prompt layered by pure `variantPrompt`), and Video editor is a browser-only canvas clip editor, so all image handoffs share one paid pipeline and one sessionStorage key.
- Owner access is a database 'owner' role in user_roles, auto-granted only to the owner's verified email by an auth trigger and checked server-side via has_role; never check emails in the browser.
- Code Engine uses its existing tool slug with a scoped workspace, authenticated streamed AI requests, server-stored approval before building, owner-scoped Cloud projects and immutable build versions; generated code runs only in a network-blocked sandbox and failed checks block export. Connections and Cloud settings are owner-only (server-side has_role check); GitHub push/pull goes through the workspace GitHub connector gateway in src/lib/github.functions.ts, never exposing tokens to the browser; published projects are served read-only at /projects/$slug from publish_slug/published_at on code_engine_projects.
- Account pages share a client-gated authenticated layout and independently authenticated server functions; private file metadata and storage paths are user-scoped, and checkout prices come from a pure shared catalog to prevent client-priced orders.
