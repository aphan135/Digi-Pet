# Digi-Pet function-by-function guide

This guide explains the authored functions in Digi-Pet's web app, API, Chrome
extension, and separate desktop-cat prototype. It focuses on what each function
does, what it receives, what it returns or changes, and where it fits in the
application.

## Start here: how a user action travels through the app

For the learning website, `web/src/main.tsx` mounts `web/src/App.tsx`. `App`
chooses a page and connects navigation callbacks. A learner picks an exercise,
submits work through `web/src/pages/Challenge.tsx`, and the page calls services
such as `answerService.ts` or `codeRunnerService.ts`. A graded answer is recorded
by `progressService.ts`; dashboard calculations in `dashboardStats.ts` turn
attempt history into charts and totals.

The cat is `web/src/components/pet/PetWidget.tsx`. It gets its rotating tips
from `usePetTip.ts`, receives celebration events from `petCelebration.ts`, and
sends AI requests to the Express server. The server keeps the Gemini key private
and exposes `/api` endpoints.

The Chrome extension has a separate entry point:
`web/extension/content.tsx` mounts the same cat widget into a Shadow DOM on
ordinary web pages. The independent Electron prototype in `app/src` is a
different cat implementation with its own motion simulation.

## `web/src`

### `web/src/main.tsx`

This file has no declared functions. At module startup, it calls `syncProgress()`
and mounts `App` into the HTML element with ID `root`, inside React `StrictMode`.
This is the website entry point.

### `web/src/App.tsx`

- **`topicToProblemType(topic)`** accepts a `Topic` and returns its challenge
  subject type. It maps Systems, Math, and Science categories to their matching
  problem types; other topics become LeetCode problems.
- **`exerciseToProblem(exercise, topic)`** converts a lesson `LearningExercise`
  plus its `Topic` into the `Problem` shape expected by the challenge page. It
  maps the prompt, hint, code template, expected output, topic, and concepts.
- **`App()`** owns the active page, selected topic, and selected problem. It
  renders the navbar, current page, and website cat.
  - **`navigate(page)`** changes pages, clears the selected topic, usually
    clears the selected problem, and scrolls to the top. The problem is retained
    when navigating to the challenge page.
  - **`selectTopic(topicId)`** selects a topic or clears topic selection, then
    scrolls to the top.
  - **`startExercise(exercise, topic)`** converts the exercise to a `Problem`,
    selects it, switches to the challenge page, and clears topic selection.
  - **`renderPage()`** chooses what to display based on the active page and
    selected topic. A selected topic opens `TopicDetail`; otherwise it chooses
    Learn, LearningMap, Dashboard, or Challenge.
  - The `topics.find(...)` callback resolves the currently selected topic.
    Inline callbacks passed to `TopicDetail` go back to the topic list; the
    Dashboard callbacks navigate to a topic or the Challenge page.

### Pages

#### `web/src/pages/Learn.tsx`

- **`Learn({onSelectTopic})`** stores the selected category and search text,
  filters the topic catalog, and renders the topic cards.
- Its filter callback matches the selected category and searches the topic name
  and description without case sensitivity.
- Input and category-button callbacks update React state. Topic-card click and
  keyboard callbacks call `onSelectTopic(topic.id)`; Enter and Space activate
  the card, and Space's normal page-scroll behavior is prevented.

#### `web/src/pages/TopicDetail.tsx`

- **`getTopicCopy(topic)`** picks category-specific explanatory text for coding,
  math, science, or systems topics.
- **`TopicDetail({topic, onBack, onStartExercise})`** renders topic overview,
  analogy, lesson levels, and the current randomly selected practice set. It
  also renders completion status.
  - The practice-set state initializer calls `getRandomPracticeSet(topic.id)`.
    An effect chooses another set when the topic ID changes.
  - A status-refresh effect reads statuses from `getProblemStatuses()` and
    subscribes to changes through `subscribeToProgressUpdates()`.
  - The exercise sort callback orders Easy, Medium, then Hard.
  - Map callbacks render lesson levels, examples, and exercises. A challenge
    button callback passes its exercise and the current topic to
    `onStartExercise`.

#### `web/src/pages/LearningMap.tsx`

- **`getTopicProblems(topicId)`** finds a topic's practice exercises, orders
  them by difficulty, and supplies the map world with its challenge list.
- **`getProblemXp(difficulty)`** maps difficulty to the map's XP reward.
- **`getTopicById(topicId)`** returns the matching topic catalog entry.
- **`getCompletedCount(problems, completedIds)`** counts completed exercise IDs.
- **`getWorldCompletion(world, completedIds)`** computes a world's completion
  percentage, returning zero if it has no exercises.
- **`polarToCartesian(cx, cy, radius, angle)`** converts polar coordinates into
  an `{x, y}` point for drawing an SVG ring.
- **`segmentPath(index)`** creates one SVG path for a progress-wheel segment.
- **`difficultyColor(difficulty)`** chooses the completion color for a
  difficulty.
- **`ProgressWheel({problems, completedIds})`** draws the eight-segment wheel,
  coloring completed real exercises and leaving unfinished or placeholder
  segments unfilled.
- **`MapTopicGroup({world, completedIds, problems, isSelected, onSelectWorld})`**
  draws a world marker and its progress wheel. Its click callbacks prevent the
  map background click and select the world.
- **`LearningMap({onStartExercise})`** owns map selection, zoom, viewport
  dimensions, and completion state. It displays the map, HUD, world markers,
  and selected-world challenge panel.
  - A progress subscription refreshes completed IDs.
  - A resize observer records the map viewport and disconnects on cleanup.
  - A keyboard listener handles Escape to zoom out; cleanup removes the
    listener.
  - **`selectWorld(world)`** selects a world, selects its first exercise, and
    zooms in.
  - **`selectProblem(world, problem)`** updates the selected world and exercise.
  - **`startSelectedProblem()`** calls `onStartExercise` if both selected
    records exist.
  - **`zoomOutMap()`** clears the zoomed selection.
  - `cameraTransform` computes the map translate/scale needed to center a
    selected world. Inline callbacks calculate totals, filter/map challenge
    lists, render markers and indicators, and stop map-click propagation.

#### `web/src/pages/Challenge.tsx`

- **`getSubjectLabel(type)`** returns a human-readable subject label.
- **`isCodingProblem(problem)`** identifies LeetCode-style problems, which
  controls whether code-running controls are shown.
- **`latestVersion(language)`** returns the last configured runtime version for
  a language.
- **`Challenge({problem})`** owns the active problem, editor language and
  version, code drafts, code-run state, answer text, feedback, and progress
  status. It connects UI actions to the answer and code-runner services.
  - A status effect reads `getProblemStatuses()` and subscribes to progress
    updates.
  - A problem-change effect resets problem-specific code, answer, feedback,
    errors, and run state.
  - **`handleLanguageChange(nextLanguage)`** selects a language and its latest
    runtime, creates a draft if needed, and clears stale results.
  - **`handleRunCode()`** sends the current code and runtime to `runCode()`,
    stores the result or error, and clears the loading state when finished.
  - **`handleSubmit()`** calls `checkAnswer()`, displays feedback, records the
    attempt, and marks correct answers complete. Correct answers also call
    `celebratePet()`. It reports errors and always clears the submitting state.
  - JSX callbacks update language, version, code, and answer; reset restores
    starter code and clears old run feedback.

#### `web/src/pages/Dashboard.tsx`

- **`snapshot()`** collects the current time, attempts, demo-mode flag, and
  completed IDs into one dashboard data snapshot.
- **`Dashboard({onOpenTopic, onStartChallenge})`** derives dashboard totals and
  composes the charts and progress widgets.
  - A refresh callback reloads `snapshot()`.
  - A scheduling callback sets a timer for just after local midnight, refreshes
    the data, and schedules the next refresh.
  - An effect refreshes on focus and cleans up timers, listeners, and
    subscriptions.
  - Reducers total solved items and calculate average scores. Filtering and
    `some(...)` callbacks reconcile completion IDs with correct attempts.
  - The demo-mode click callback toggles demo data. Child widgets receive
    derived statistics and navigation callbacks.

### Components

#### `web/src/components/pet/PetWidget.tsx`

- **`getCornerPosition(corner)`** computes a position inset from the requested
  screen corner and clamps it for small viewports.
- **`Cat({className, onAnimationEnd})`** returns the walking or idle cat SVG
  based on its class name and forwards animation completion.
- **`PeekHead({shown})`** draws the smaller cat head shown while the pet peeks.
- **`PetWidget()`** coordinates visibility, dragging, position, idle animation,
  celebration, tips, chat, and summary requests.
  - **`hide()`** closes the pet, unpins it, stops idle animation, and hides chat.
  - The celebration subscription opens the pet, selects a congratulation,
    advances the tip, increments the animation key, and generates confetti.
  - The confetti timer clears confetti; cleanup cancels that timer.
  - The outside-pointer handler hides the pet when the click path is outside
    the widget. The resize handler recalculates its corner position.
  - The idle-animation timer chooses walking, purring, or yawning while open
    and not dragging or chatting.
  - The chat-history effect scrolls to the newest message after updates.
  - **`beginDrag(event)`** captures the primary pointer and stores the pointer's
    starting point and pet origin.
  - **`movePet(event)`** ignores unrelated pointers and tiny movements, then
    updates a viewport-clamped position.
  - **`finishDrag(event)`** finishes pointer capture; after a real drag it snaps
    the pet to a corner and suppresses the click that follows pointer-up.
  - **`openNow()`** opens the pet and advances its tip when opening.
  - **`handleCatClick()`** advances the fun fact or quote without closing the
    pet.
  - **`sendChatMessage(event)`** prevents normal form submission, ignores blank
    or duplicate sends, appends the user's message, posts recent conversation
    context to `/api/pet-chat`, validates the reply, and appends it. Errors are
    displayed in the chat.
  - **`summarizeChatMessage(index)`** requests a summary for one assistant reply
    from `/api/pet-chat/summarize` and updates only that reply. It tracks loading
    and error state independently.
  - JSX event callbacks implement hover/focus peeking, closing/back buttons,
    draft updates, chat submission, summarize actions, confetti rendering, and
    completion of stroll/purr/yawn animations.

#### `web/src/components/layout/Navbar.tsx`

- **`ProfileCatIcon()`** renders the decorative cat icon for the profile area.
- **`Navbar({activePage, onNavigate})`** renders navigation controls. Its item
  map callback creates buttons; clicking one calls `onNavigate` with that
  item's page. Dashboard and profile controls both open the dashboard.

#### `web/src/components/problems/ProblemCard.tsx`

- **`ProblemCard({problem, isSelected, onSelect})`** renders a selectable
  problem's title, difficulty, topic, and prompt.
- **`handleKeyDown(event)`** selects on Enter or Space and prevents Space from
  scrolling the page. The click callback supports mouse selection.

#### `web/src/components/problems/ProblemList.tsx`

- **`ProblemList({selectedType, selectedTopic, selectedProblem, onSelectProblem})`**
  filters the problem bank by type and topic, then renders a `ProblemCard` for
  each matching problem.
- Its filter callback keeps all topics when the selected topic is `"all"`; its
  map callback passes selection state and the selection handler to each card.

#### Dashboard widgets

- **`web/src/components/dashboard/EmptyState.tsx` — `EmptyState({message, onStartChallenge})`:**
  renders an explanatory empty state and a button that starts a challenge.
- **`web/src/components/dashboard/ActivityHeatmap.tsx` — `ActivityHeatmap({days, hasAttempts, current, longest, onStartChallenge})`:**
  totals attempt activity and draws the last 12 weeks as an SVG heatmap, or
  renders `EmptyState`. Inline callbacks split days into week columns and draw
  labels, cells, tooltips, and the legend.
- **`web/src/components/dashboard/Milestones.tsx` — `Milestones({items, hasAttempts, onStartChallenge})`:**
  counts earned milestones and renders earned/locked cards, or `EmptyState`.
  Filter and map callbacks calculate the count and render each milestone.
- **`web/src/components/dashboard/PetStatus.tsx` — `PetStatus({state, hasAttempts, onStartChallenge})`:**
  renders the pet's mood, energy, and daily goal. A map callback draws the
  three goal segments; the empty-state button starts a challenge.
- **`web/src/components/dashboard/ScoreTrend.tsx` — `ScoreTrend({points, onStartChallenge})`:**
  draws scores and rolling averages as an SVG chart, or `EmptyState`.
  - `x(i)` and `y(score)` convert data values to chart coordinates.
  - `line(average)` builds an SVG path string from scores or rolling averages.
  - Map callbacks draw chart points and grid lines. Mouse/focus/keyboard
    callbacks manage the active tooltip point; Escape clears selection.
- **`web/src/components/dashboard/SubjectBreakdown.tsx` — `SubjectBreakdown({subjects, hasAttempts, onStartChallenge})`:**
  renders attempted and solved counts per subject as SVG bars, or `EmptyState`.
  Mapping callbacks compute a safe maximum and draw each subject's labels/bars.
- **`web/src/components/dashboard/WeakSpots.tsx` — `WeakSpots({spots, hasAttempts, onOpenTopic, onStartChallenge})`:**
  renders concepts missed in prior feedback, or an appropriate empty state.
  The item callback opens the related topic when it has a topic ID; otherwise it
  starts a challenge.

#### `web/src/components/learn/ExerciseLab.tsx`

- **`compileTypeScript(code, version)`** transpiles the draft using the selected
  TypeScript target. It throws a readable combined message for compiler errors.
- **`executeCode(sourceCode, expectedOutput, language, version)`** transpiles
  TypeScript when needed, then runs the code in a Web Worker with a time limit.
  It captures `console.log`, compares output to the expected output, and returns
  a passed, failed, or error result.
  - The Worker source contains a `format(value)` helper for printed values and
    a replacement console logger that collects outputs.
  - Worker message/error callbacks terminate the worker and resolve a result.
    A timeout callback terminates execution and resolves a timeout error.
- **`ExerciseLab({exercise, index})`** owns selected language/version, drafts,
  run result, running state, and hint visibility.
  - **`changeLanguage(nextLanguage)`** switches language/version and clears
    stale results.
  - **`handleRun()`** executes the current draft and stores its result.
  - Render callbacks populate language/version options. Change callbacks update
    the current language, version, or draft. Reset restores the starter code;
    the hint toggle shows or hides the hint.

### `web/src/types/index.ts`

Type declarations only; no functions. Important shared types:

- `PageName`, `ProblemDifficulty`, and `ProblemType` constrain navigation,
  difficulty, and subject values.
- `Problem` is the challenge input shape; `Topic` describes topic display and
  category metadata.
- `LearningLevel`, `LearningExercise`, and `TopicContent` define lesson and
  practice material.
- `AnswerFeedback` is the grading response shape.
- `Attempt` is a saved graded submission used in progress and dashboard
  calculations.

### `web/src/vite-env.d.ts`

No functions or runtime behavior. It imports Vite's client type declarations.

## `web/src/data`

Data files mostly hold authored learning material or static configuration.
Question code inside string values is displayed/run by the learning UI; it is
not executed when this module is imported.

### `web/src/data/topics.ts`

Contains the topic catalog used by topic selection, the map, and dashboards.
It has no declared functions.

### `web/src/data/problems.ts`

Contains authored challenge records (`Problem[]`). It has no declared
functions.

### `web/src/data/codeRuntimes.ts`

- **`commentLines(problem, marker)`** turns a problem title, prompt, and expected
  output into source-language comment lines.
- **`createStarterCode(problem, language)`** creates editor starter text. It
  uses authored JavaScript/TypeScript starter code when available and generates
  templates/comments for other language runtimes.

The language union, runtime map, and language list in this file are
configuration, not functions.

### `web/src/data/learningContent.ts`

- **`exercise(...)`** constructs a typed `LearningExercise` from its fields.
- **`levels(basics, mechanics, advanced, examples)`** creates the three
  beginner/intermediate/advanced learning levels and attaches their examples.
- **`mathLevels(title, explanations, examples)`** builds a three-level math
  lesson from authored text and examples.
- **`mathExercise(...)`** creates a math exercise, using the expected answer as
  expected output and no code starter.
- **`mathContent(...)`** assembles math lesson overview, analogy, levels, and
  exercises into a topic content record.
- **`scienceContent(...)`** assembles science-specific lesson levels and an
  explanation-check exercise.
- Initialization loops append authored supplemental and randomized exercise
  tuples to the corresponding topic. They throw if a tuple references a topic
  without base lesson content.
- **`getRandomPracticeSet(topicId)`** takes a topic ID and returns 3 Easy, 3
  Medium, and 2 Hard exercises, shuffled within their difficulty groups. It
  throws for an unknown topic or an undersized pool.

The large topic object, supplemental tuples, and randomized-variant tuples are
authored content rather than functions.

## `web/src/hooks`

### `web/src/hooks/usePetTip.ts`

- **`usePetTip()`** is a React hook that picks an initial random fun fact or
  quote and returns the selected message plus a `nextTip` function.
- **`nextTip()`** chooses a different message index, avoiding an immediate
  repeat, and updates hook state.

The hook's message list is authored display data.

## `web/src/services`

### `web/src/services/answerService.ts`

- **`checkAnswer(problem, userAnswer)`** POSTs a problem and learner response to
  `/api/check-answer`, parses the response as `AnswerFeedback`, and returns it.
  It throws for invalid JSON or an unsuccessful HTTP response.

### `web/src/services/codeRunnerService.ts`

- **`runCode(input)`** POSTs source code, language ID, language, and optional
  expected output to `/api/run-code`. It parses and returns a
  `CodeRunResult`, or throws a readable error for invalid JSON/HTTP failures.

### `web/src/services/problemService.ts`

- **`getProblems()`** returns the authored problem bank.
- **`getFeaturedProblem()`** returns its first item.
- **`getProblemsByType(type)`** returns all problems for `"all"` or filters to
  the requested problem type.

### `web/src/services/petCelebration.ts`

- **`celebratePet()`** dispatches the in-page pet-celebration event.
- **`onPetCelebration(callback)`** registers a listener and returns a cleanup
  function that removes it.

### `web/src/services/dashboardStats.ts`

These functions turn attempt records into dashboard values. Date-aware
functions accept `now` so calculations can be consistently tested.

- **`localDateKey(date)`** formats a local date as `YYYY-MM-DD`.
- **`dayNumber(date)`** converts a local calendar date to a UTC-based integer
  day number, avoiding daylight-saving day-length errors.
- **`recordedAttempts(attempts, now)`** filters malformed/future timestamps and
  sorts the remaining attempts chronologically.
- **`dailyActivity(attempts, days, now)`** returns daily attempt counts over the
  requested window (84 days by default).
- **`activeDays(attempts, now)`** returns the set of day numbers with activity.
- **`currentStreak(attempts, now)`** counts consecutive active days ending
  today, or yesterday if today is not active.
- **`longestStreak(attempts, now)`** finds the longest run of consecutive
  active calendar days.
- **`firstSolves(attempts)`** keeps the earliest correct attempt for each
  problem.
- **`subjectBreakdown(attempts)`** calculates distinct attempted and solved
  problem counts for each subject.
- **`scoreTrend(attempts, n)`** returns the latest attempts with a moving
  average based on each attempt and up to four preceding attempts.
- **`weakSpots(attempts, topics)`** groups missed concepts by normalized topic
  and concept, counts each concept once per attempt, links matching topic IDs,
  and returns the five most frequent groups.
- **`xp(attempts)`** awards XP for first correct solves: Easy 10, Medium 20,
  Hard 40.
- **`milestones(attempts, now)`** returns six milestone records and whether
  each condition has been earned.
- **`petState(attempts, now)`** summarizes recent activity into cat mood,
  energy, today's attempt count, and a daily goal of three.

### `web/src/services/progressService.ts`

- **`read(key)`** reads parsed JSON from local storage or the in-memory fallback;
  returns `null` when unavailable or invalid.
- **`write(key, value)`** serializes and stores a value, falls back to memory if
  storage fails, and dispatches a progress-update event.
- **`getCompletedProblemIds()`** returns valid IDs from the stored legacy
  completion list.
- **`isProblemCompleted(problemId)`** checks whether that ID is completed.
- **`markProblemCompleted(problemId)`** adds a completion ID once, persists it,
  and returns the updated list.
- **`isAttempt(value)`** is a runtime type guard validating the fields and
  allowed values of an attempt.
- **`getRealAttempts()`** reads stored attempts and filters invalid entries
  through `isAttempt`.
- **`getProblemStatuses()`** combines saved statuses, attempt-derived results,
  and legacy completed IDs. Once a problem is completed, a later failed attempt
  does not undo it.
- **`toAttemptRow(attempt)`** maps app field names and timestamps to the
  Supabase database row shape.
- **`syncProgress()`** does nothing if Supabase is unconfigured; otherwise it
  shares a single in-flight sync, obtains anonymous auth, uploads local
  attempts/completions, downloads remote data, merges it, and persists it.
  Sync errors are logged.
- **`insertAttempt(attempt)`** best-effort inserts one attempt remotely after
  checking for an authenticated session.
- **`recordAttempt(problem, feedback)`** combines a problem and AI feedback into
  a timestamped `Attempt`, saves it locally, and starts its remote insert.
- **`isDemoMode()`** reads the demo-mode flag.
- **`setDemoMode(on)`** stores the flag and notifies progress subscribers.
- **`generateDemoAttempts(now)`** generates deterministic sample attempts for
  the 84 days before `now`; it does not persist them.
- **`getAttempts(now)`** returns generated demo data in demo mode, otherwise
  validated real attempts.
- **`subscribeToProgressUpdates(callback)`** listens for same-page and
  cross-tab changes and returns a function to unsubscribe.

### `web/src/services/supabase.ts`

No functions are declared. It reads the configured Supabase URL and anonymous
key, exports a client when both are present, and otherwise exports `null`.

## `web/server`

### `web/server/index.js`

This Express server loads `web/.env`. Its API key stays on the server and is
never bundled into the frontend. Request-handler functions validate inputs,
call providers, and return JSON.

- **`extractJson(text)`** trims model output, extracts a fenced JSON block when
  present, and parses it. Empty or invalid output throws.
- **`GET /api/health` handler** returns `{ok: true}` for availability checks.
- **`compileReactJsx(sourceCode)`** transpiles JSX using TypeScript, throws a
  combined diagnostic message on compiler errors, and prefixes a small
  `React.createElement` shim.
- **`POST /api/run-code` handler** validates source and supported Judge0
  language IDs, compiles React JSX when requested, submits it to Judge0 with
  runtime limits, and normalizes the response to status/output/detail. It logs
  network failures and returns explicit client errors.
- **`POST /api/pet-chat` handler** validates up to 12 recent user/assistant
  messages and message lengths, translates assistant messages to Gemini's
  `"model"` role, requests a short tutor reply, and returns `{reply}`.
- **`POST /api/pet-chat/summarize` handler** validates non-empty text up to
  6,000 characters, asks Gemini for a one-sentence summary, and returns
  `{summary}`.
- **`POST /api/check-answer` handler** validates problem and answer data, asks
  Gemini to grade against a response schema, parses its JSON using
  `extractJson`, and maps provider failures into explicit errors.
- **`app.listen` callback** reports the URL and port when the API server starts.

## `web/extension`

### `web/extension/content.tsx`

- **`mountPet()`** skips pages that are already the Digi-Pet app and skips
  duplicate extension hosts. Otherwise it creates a fixed host, attaches a
  Shadow DOM, inserts the bundled styles, and mounts `PetWidget` using React
  `StrictMode`. The module calls it immediately.

### `web/extension/vite.config.ts`

No functions are declared. This build configuration sets the extension's
project root, loads React, and bundles `content.tsx` as a self-contained IIFE
into `web/extension-dist/content.js`.

### `web/extension/public/manifest.json`

Configuration only. It declares a Manifest V3 content script that runs on
ordinary HTTP and HTTPS pages.

## Separate desktop-cat prototype: `app/src`

This is an Electron/React prototype and is separate from the current website
cat. Its animation uses mutable simulation state and direct SVG transforms.

### `app/src/App.jsx`

- **`clamp(value, low, high)`** returns a value limited to the provided range.
- **`spring(state, target, stiffness, damping, dt)`** mutates a spring's
  position and velocity toward a target; it is the primitive for smooth
  movement.
- **`home(corner)`** calculates a screen position for a corner.
- **`nearestCorner(x, y)`** compares a point with all corner positions and
  returns the nearest corner name.
- **`newSim()`** constructs the mutable state used for position, rotation,
  pointer movement, velocity, and animation timing.
- **`Cat({c, className, parts})`** renders the SVG cat using palette `c`.
  Nested **`part(key)`** returns SVG ref callbacks that save DOM nodes in
  `parts` for animation.
- **`PeekHead({c, shown})`** renders the small decorative head used for peeking.
- **`App()`** owns desktop cat settings and animation state. It contains:
  - **`syncInteractive()`** tells the Electron bridge whether pointer
    interaction is active, avoiding duplicate updates.
  - **`write()`** writes current simulation transforms to SVG/DOM refs; it
    returns no application data.
  - **`place()`** resets the simulation at the selected corner and writes the
    initial transforms.
  - **`step(dt)`** advances the simulation, including pointer-follow behavior,
    spring motion, edge bounce, landing effects, and secondary movement.
  - **`settled()`** reports whether position and secondary springs have stopped
    moving.
  - **`tick(now)`** advances simulation in small time steps, writes transforms,
    and requests another animation frame until settled.
  - **`startLoop()`** starts the animation-frame loop only if one is not
    already running.
  - **`hide()`** cancels close timing, clears interaction state, and hides the
    cat.
  - **`startClose(ms)`** replaces the close timer and schedules `hide()` after
    the requested delay.
  - **`finishSettle()`** returns the simulation to idle, snaps to the corner,
    clears movement state, syncs the corner with the Electron bridge, and
    schedules hiding when the pointer is not over the cat.
  - The settings effect loads and subscribes to Electron settings, handles
    resize, and cleans up the listener and animation frame.
  - **`enter()`** records pointer hover and cancels pending close.
  - **`leave()`** clears hover and schedules closing when appropriate.
  - **`openNow()`** cancels closing, refreshes settings, and opens the cat.
  - **`petIt()`** handles a cat click, animates a jump, creates a temporary
    heart, and later removes that heart.
  - **`onPointerDown(event)`** begins a pointer drag, recording grab offsets,
    pointer samples, and velocity.
  - **`onPointerMove(event)`** smooths velocity, detects movement, clamps the
    target to the viewport, and starts the animation loop.
  - **`onPointerEnd()`** handles pointer-up/cancel/lost-capture. A drag release
    limits fling speed, chooses the closest corner, and starts settling.
  - JSX callbacks connect those handlers to mouse, focus, click, and pointer
    events. A map callback renders each temporary heart.

### `app/src/main.jsx`

No functions are declared. It imports the desktop `App` and mounts it to the
`root` element.

## Files that are configuration or styling (no functions)

- `web/src/styles/global.css` — CSS selectors, declarations, and keyframe
  animations. `@keyframes` describe animation frames; they are not JavaScript
  functions.
- `web/vite.config.ts` — Vite server and `/api` development proxy configuration.
- `web/package.json` and `app/package.json` — scripts and dependency lists.
- `web/tsconfig.json` — TypeScript compiler options.
- `web/index.html` — website HTML shell and React mount point.
- `web/extension/public/newtab.html` and `web/extension-dist/newtab.html` —
  extension HTML entry document.
- `web/README.md` and repository `README.md` — project/setup documentation.
- `web/extension-dist/content.js` — generated bundle; its minified functions
  are compiler output from the extension source, not functions to edit directly.
- `web/package-lock.json` and `app/package-lock.json` — generated dependency
  lockfiles, not application logic.

## Quick glossary

- **Parameter/input:** a value a function receives, for example `problem` in
  `checkAnswer(problem, userAnswer)`.
- **Return value:** the value a function gives back, for example an
  `AnswerFeedback` object.
- **Side effect:** an action beyond returning a value, such as saving to
  localStorage, calling an API, updating React state, or moving the cat.
- **Callback:** a function passed to another function or UI element to run
  later, usually after an event.
- **React state:** component-owned values; setting state asks React to render
  again with the new value.
- **Effect:** code registered with `useEffect` that runs after rendering and
  may install timers/listeners; cleanup removes them when dependencies change
  or the component unmounts.
- **Service:** a module that handles reusable work outside the UI, such as API
  calls, progress persistence, or statistics.
