# Rebuild the Extension Dashboard

## Build
- Add a reusable full-screen `ExtensionDashboard` React component with four work tabs, uploads, previews, output, close control, and job saving.
- Replace the iframe-only tool entry with a React tools grid whose ten START buttons open the selected tool dashboard immediately.
- Preserve the existing NIXORA studio below the new tool launcher so its current channel and avatar features remain available.

## Behavior
- Save generated jobs under `nixora_code_engine_jobs` in browser storage, including the selected tool and text/file metadata.
- Preview images and videos locally, parse CSV into a table, and show a clear Excel attachment preview when workbook parsing is unavailable.
- Render code from the prompt tab in a sandboxed live preview for Code Engine; show structured output for other tools.

## Verification
- Test CODE ENGINE and another tool from START through close.
- Confirm tab inputs, job saving, live output, and mobile/desktop layout.
