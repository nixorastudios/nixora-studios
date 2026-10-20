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
