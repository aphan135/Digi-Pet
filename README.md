# 🐱 Digi-Pet
### A Gamified Coding Education Platform

Digi-Pet is an interactive educational platform designed to make coding practice more engaging, structured, and rewarding.

Inspired by Duolingo's progression system and LeetCode-style coding challenges, Digi-Pet combines guided learning paths, gamification, AI-powered feedback, and an interactive digital cat companion. The goal is to encourage consistent daily learning while making technical education feel more like an adventure than an obligation.

- **Live Demo:** https://digi-pet-indol.vercel.app/
- **GitHub:** https://github.com/aphan135/Digi-Pet

## Problem Statement

Many aspiring software engineers struggle to maintain consistent coding practice because traditional platforms can feel overwhelming, repetitive, and difficult to navigate.

Common challenges include:

- Lack of motivation to practice consistently
- Unclear progression between learning topics
- Difficulty identifying areas for improvement
- Limited engagement outside practice sessions

Digi-Pet addresses these challenges through structured learning, gamified progress, and a companion that keeps practice visible and encouraging.

## Our Solution

Digi-Pet combines education, motivation, and progression in one experience:

- Structured learning paths across coding, systems, math, and science topics
- An interactive adventure map with themed worlds and visual progression wheels
- Coding challenges with runnable starter code, expected outputs, and AI-assisted feedback
- XP, completion tracking, streaks, achievements, and learning statistics
- A digital cat companion that celebrates progress and offers motivational messages
- Chrome Extension support that brings the cat companion onto regular websites
- Dashboard insights that help learners understand activity, weak spots, and milestones

## Application Pages

| Page | Purpose | Current Features |
| --- | --- | --- |
| **Learn** | Users explore educational topics, review lessons, study examples, and complete practice exercises. | Topic cards, concept levels, examples, and practice exercises connected to the Challenge page. |
| **Map** | An interactive adventure map containing themed learning worlds. Each world represents a learning topic. | Select worlds, view eight-segment progression wheels, track completed challenges, zoom into selected worlds, browse grouped problem lists, and navigate directly to problems. Each map topic uses 8 problems organized as 3 Easy, 3 Medium, and 2 Hard. |
| **Challenge** | Users solve coding and educational challenges. | Code editor, generated LeetCode-style starter code, language/version selector, code execution, expected output checking, answer submission, AI-assisted evaluation, completion tracking, and pet celebrations. |
| **Dashboard** | Users monitor their learning progress. | Completed challenge analytics, daily streaks, XP, activity heatmap, score trends, subject breakdowns, achievements and milestones, weak spots, and digital pet status. |

The Challenge page currently supports code execution through Judge0-compatible runtimes for JavaScript, TypeScript, Python, C, C++, Java, Go, Rust, React/JSX, C#, Kotlin, PHP, and Ruby. Coding problems are checked against expected output, while written-answer problems are evaluated through the AI feedback endpoint.

## Digital Cat Companion

Digi-Pet features an animated virtual cat that acts as a learning companion and encourages users to practice consistently.

Implemented companion features include:

- Interactive cat animations, including peek, open, drag, idle, walk, purr, yawn, and celebration states
- Motivational messages, programming facts, and learning tips
- Celebrations after successful challenge completion
- AI-powered conversations through the cat chat panel
- AI summarization for assistant chat replies
- Companion interactions in both the website and Chrome Extension

The cat is available inside the Digi-Pet website and can also be injected into supported websites through the Chrome Extension.

## Chrome Extension

The Chrome Extension brings the Digi-Pet companion outside the website so learners can stay connected to their study habit while browsing the internet.

Implemented extension functionality includes:

- Bottom-corner cat companion on supported `http://` and `https://` websites
- Daily coding challenge reminders using Manifest V3 alarms and Chrome notifications
- Reminder settings stored with `chrome.storage.local`
- A content-script version of the cat with reminder controls
- A background service worker that schedules the next daily reminder

Chrome does not allow content scripts on every page. The extension cannot inject the cat into Chrome internal pages, the Chrome Web Store, or other protected browser pages.

### Build and Test the Extension

From the `web/` directory:

```bash
npm install
npm run extension:build
```

Then:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the `web/extension-dist` folder.
5. Open a regular website such as `https://example.com` to verify the cat appears.

## Technology Stack

| Technology | Purpose |
| --- | --- |
| React | Website UI and Chrome Extension content UI |
| TypeScript | Type-safe website and extension development |
| Vite | Website, extension, and desktop prototype build tooling |
| Node.js | Backend runtime for local API development |
| Express | API routes for code execution, answer checking, and pet chat |
| Google Gemini | AI-assisted answer evaluation, pet chat, and answer summarization |
| Judge0-compatible API | Multi-language code execution and expected-output checking |
| Supabase | Optional user progress storage and synchronization |
| Chrome Extension / Manifest V3 | Browser-based digital companion and reminders |
| Electron | Separate desktop cat prototype in `app/` |
| Vercel | Website deployment and serverless API routing |

Electron is a separate desktop prototype, not the primary website framework.

## Project Structure

```text
Digi-Pet/
|-- app/
|   |-- electron/
|   |-- src/
|   |-- index.html
|   |-- package.json
|   `-- vite.config.mjs
|-- web/
|   |-- api/
|   |-- extension/
|   |-- extension-dist/
|   |-- public/
|   |-- scripts/
|   |-- server/
|   |-- src/
|   |-- supabase/
|   |-- index.html
|   |-- package.json
|   |-- tsconfig.json
|   |-- vercel.json
|   `-- vite.config.ts
`-- README.md
```

### Major Directories

- `web/` - React + TypeScript website, learning pages, challenge services, backend API, Chrome Extension source, Supabase integration, and deployment config.
- `web/src/pages/` - Main application screens: Learn, Map, Challenge, Dashboard, and Topic Detail.
- `web/src/components/` - Reusable UI components for layout, dashboard panels, learning tools, problem cards, and the digital pet.
- `web/src/data/` - Topic data, learning content, code runtime definitions, and generated coding challenge specs.
- `web/src/services/` - API clients, progress tracking, dashboard statistics, Supabase integration, reminders, and pet celebration events.
- `web/server/` and `web/api/` - Express API implementation and Vercel serverless entrypoint.
- `web/extension/` - Chrome Extension source, manifest, background worker, and Vite extension build config.
- `web/extension-dist/` - Built unpacked Chrome Extension output.
- `app/` - Electron desktop cat prototype.
- `README.md` - Main project documentation.

## How Digi-Pet Works

Digi-Pet creates a continuous learning loop:

1. **Discover** - Users choose a topic from Learn or the adventure Map.
2. **Learn** - Users review explanations, examples, and topic context.
3. **Practice** - Users solve coding or educational challenges in the Challenge page.
4. **Earn Rewards** - Successful challenges contribute to completion state, XP, and pet celebrations.
5. **Track Progress** - The Dashboard visualizes attempts, streaks, scores, subjects, weak spots, and milestones.
6. **Repeat** - The digital cat and reminders encourage users to return and keep practicing.

Together, these pieces make coding practice feel more structured, visible, and rewarding.

## Getting Started

### Prerequisites

- Node.js
- npm
- Google Chrome for extension testing
- Optional: Supabase project credentials for synced progress
- Optional: Gemini API key for AI answer checking and pet chat

### Website Setup

Clone the repository:

```bash
git clone https://github.com/aphan135/Digi-Pet.git
cd Digi-Pet/web
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Configure `.env` with your own values:

```text
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
API_PORT=3001
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_AUTH_TOKEN=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not commit real API keys or secrets.

Start the local website and API server:

```bash
npm run dev
```

Other available website commands:

```bash
npm run dev:web
npm run dev:api
npm run build
npm run preview
npm run extension:build
```

### Desktop Prototype Setup

The separate Electron desktop prototype lives in `app/`:

```bash
cd ../app
npm install
npm run dev
```

Available desktop prototype commands:

```bash
npm run dev
npm run build
npm run start
```

## Future Enhancements

Potential improvements include:

- Adaptive learning recommendations
- Additional educational subjects
- Expanded AI tutoring capabilities
- More customizable digital pets
- Additional progression worlds
- Personalized challenge recommendations
- Enhanced achievements and rewards
- More configurable reminder schedules
- Expanded browser extension functionality

These items are planned improvements and should be distinguished from the implemented features listed above.

## Project Goals

Digi-Pet aims to:

1. Encourage consistent daily practice.
2. Provide structured educational pathways.
3. Improve problem-solving confidence.
4. Make coding interview preparation engaging.
5. Reward learning milestones.
6. Create a motivating learning environment.

Our vision is to make coding practice feel less like homework and more like an adventure.
