# Digi-Pet Web

React + TypeScript learning website with coding, system design, math, science, and history challenges.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The answer checker and the cat's AI chat use Gemini. Replace the placeholder
`GEMINI_API_KEY` in `.env` with a valid Gemini API key. `GEMINI_MODEL` defaults
to `gemini-2.5-flash`.
OpenAI settings remain in the environment template for future use, but the current
answer checker does not call OpenAI.

Keep `.env` local and private; API keys are read by the server and must not be added
to frontend code or committed to source control. If a key has been shared publicly
or in a chat, revoke it and use a newly generated key.

After changing `.env`, restart the API server for the new settings to take effect.

## Understanding the code

See [DEVELOPER_FUNCTION_GUIDE.md](./DEVELOPER_FUNCTION_GUIDE.md) for a
file-by-file explanation of the app's functions, API, extension, and desktop
cat prototype.

## Chrome extension

Build the extension from the `web` directory:

```bash
npm run extension:build
```

In Chrome, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**,
and select `web/extension-dist`. Digi-Pet will appear on regular HTTP/HTTPS pages and
reload Digi-Pet after rebuilding. Chrome's standard New Tab page stays unchanged.
Chrome internal pages, the Chrome Web Store, and some protected pages do not allow
extensions to inject content.

When a user has not completed one challenge correctly today, the extension reminds
them on other pages for 5 seconds, then waits 10 seconds before repeating. A
correct answer on the Digi-Pet website is shared through Chrome extension storage
and stops that day's reminders. The reminder opens
<https://digi-pet-indol.vercel.app/> in a new tab.

## Structure

- `src/components/` - Reusable UI components.
- `src/pages/` - Page-level screens.
- `src/data/` - Mock data and learning content.
- `src/types/` - Shared TypeScript types.
- `src/services/` - API/backend communication layer.
