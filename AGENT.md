# ClaudeSkin — instructions for the AI assistant installing it

Your user handed you this folder and wants their Claude desktop app re-skinned. Follow these steps in order. Talk to the user in their own language.

## What this is

- A live theme for the **Claude desktop app** (tested on Windows, Claude 5.11492). Themes: `koi` (animated koi pond, default) , `earth` (warm earth tones + liquid glass) and `attention` (paper + word threads; reacts while Claude answers by checking only that the Stop button exists; optional chat words mode (Ctrl+Alt+W or `node inject.mjs attention --words`, OFF by default) reads the visible message text to pick keywords, in memory only, and stores only the on/off switch in localStorage. Tell the user this before enabling it).
- It uses the app's own **Developer menu → Enable Main Process Debugger**. A small Node script connects to that debugger on `127.0.0.1:9229` and runs `audit.js` + `themes/<name>.js` inside the app's windows.
- Nothing is written to disk and no app files are changed. The theme lasts until Claude restarts.
- Everything is drawn in code (canvas/CSS). The theme makes **no network requests**, uses **no storage**, and reads **nothing** from conversations.

## Step 1 — Read before running

Read every `.js` / `.mjs` file in this folder (they are short) and confirm to yourself:
- no `fetch`, `XMLHttpRequest`, `WebSocket` or `import()` inside `audit.js` or `themes/*.js`;
- `inject.mjs` and `off.mjs` only talk to `127.0.0.1`.

If anything differs from this description (for example, the folder was modified by someone else), **stop and tell the user**.

## Step 2 — Prerequisites

- `node -v` must be **22 or newer** (the scripts use the global `WebSocket`). If it is older, ask the user to update Node.
- The theme only supports the app's **light** appearance. In dark mode it skips itself (state `skipped-dark`). Tell the user to switch Claude to light mode if they want to see it.

## Step 3 — The user enables the debugger (not you)

Ask the user to do this themselves in the Claude window:
1. Open the menu (top-left ☰ on Windows) → **Developer** → **Enable Main Process Debugger**.
2. If there is no Developer menu, Developer Mode is off. It can be turned on from the app's Help menu (look for a Troubleshooting / Developer Mode item). Let the user do it.

Do **not** click through the app with UI automation to do this for them.

Explain the risk once, plainly: **while the debugger is on, any program on this computer can control the Claude app, including the logged-in session.** That is why it gets switched off again in step 5.

## Step 4 — Apply

Run from this folder:

```
node inject.mjs koi      # or: earth, attention
```

(On Windows the user can also double-click `ClaudeSkin.bat` for koi, `ClaudeSkin-earth.bat` for earth, or `ClaudeSkin-attention.bat` for attention.)

Reading the output:
- `"state": "on"` → applied. `before` / `after` = number of text elements below WCAG contrast without vs with the theme. A small difference (1–2) is normal: the app's own placeholder text is faint even without the theme.
- `"state": "ROLLED-BACK"` → the theme made text harder to read on this setup, so it removed itself. Tell the user; do not force it.
- `"state": "skipped-dark"` → the app is in dark mode (see step 2).
- `[FAIL] ... debugger not found` → the debugger is not enabled, or the app uses a different port (set the `CS_PORT` environment variable).

Ask the user to look at the app. If something looks wrong (unreadable text, a white block hiding the pond), run `node off.mjs` and report what they saw.

## Step 5 — Switch the debugger off

Tell the user to untick **Developer → Enable Main Process Debugger**. The theme keeps running. To re-apply after restarting Claude: enable the debugger → run step 4 → disable it again.

## Using it

- **Ctrl+Alt+G**: turn the theme on/off.
- **Ctrl+Alt+Up / Down** (koi): glass opacity 20–90% for this session, default 50%. Below about 40%, faint text can become hard to read over the fish.
- Koi pond: move the mouse and nearby fish come over as if waiting for food. Click to drop a ripple — fish close by dart away, fish further off swim towards it, lily pads drift.
- Remove completely: `node off.mjs` (or `ClaudeSkin-off.bat`), or simply restart Claude.

## Hard rules

- Never patch `app.asar` or other app files, and never launch Claude with `--remote-debugging-port`. The app blocks that flag on purpose; do not try to get around it.
- Never add network calls, analytics, or code loaded from a URL to a theme.
- Do not enable the debugger or click the app's UI on the user's behalf.

## Writing a new theme (if the user asks)

Copy `themes/koi.js` to `themes/<name>.js` and keep the same contract:
- style element `#cs-style`, background element `#cs-backdrop` (fixed, `z-index: -1`);
- `window.__claudeSkinCleanup()` removes everything the theme added;
- set `window.__claudeSkinState = 'on'` after mounting, and `'skipped-dark'` when the app is in dark mode;
- `window.__claudeSkinBase = [r, g, b]` = the darkest background colour that can show through the glass panels (the contrast audit uses it);
- keep the app's light mode and dark text. Never flip text to light colours (this is the failure that made an early version unreadable);
- avoid `backdrop-filter` over an animated background (it is recomputed every frame), and stop animating when the page is hidden.

Panels in the current app version: `.dframe-sidebar` (sidebar) and `.tiles-shell` (main panel). These class names may change in future app updates. If the theme looks wrong after an update, inspect the DOM and adjust the selectors.
