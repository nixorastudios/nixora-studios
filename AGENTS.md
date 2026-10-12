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
