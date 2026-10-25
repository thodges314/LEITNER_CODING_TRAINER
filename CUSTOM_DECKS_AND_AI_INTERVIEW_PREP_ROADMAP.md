# Custom Decks, AI-Assisted Interview Prep & Downloadable Study Guide — Feature Roadmap

> **Status:** Proposal & Architectural Roadmap  
> **Target Version:** Post-React preview polish  
> **Architecture:** Zero-backend, 100% client-side, powered by existing Multi-Key Vault (`localStorage`)

---

## 1. Feasibility Assessment & Executive Summary

### Is this feasible?
**Yes, 100% feasible.** In fact, this fits the architecture of the Leitner Coding Trainer better than almost any other AI feature:
1. **Self-Contained Content**: The application already possesses an audited, verified catalog of **277 cards** across 9 domains with strict contracts and dual JS/TS solutions. Unlike unverified AI card generation, selecting from curated cards eliminates hallucinated tests or broken harnesses.
2. **Compact Catalog Index**: The metadata for all 277 cards (ID, title, topic/track, concept ladder, difficulty 1–5, tags, and brief description) compresses to under **15 KB** (~4,000 tokens). This easily fits in the system prompt of *any* modern model without exceeding context windows or incurring heavy costs.
3. **Company Interview Archetypes**: Frontier models (Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Pro, Llama 3.3) already have extensive pre-trained knowledge of company-specific interview archetypes (e.g. Stripe's stateful data pipelines, Airbnb's accessible UI widgets, Meta's speed DOM drills, Google's algorithmic rungs).
4. **Downloadable PDF Generation in Browser**: Client-side PDF generation is straightforward, fast, and requires zero servers. Using lightweight vector PDF generation (`jspdf` + styled vector template, or browser-native `@media print` with custom print layout), the app can generate a beautifully formatted, multi-page briefing dossier that downloads in under 1 second.
5. **Client-Side Storage**: Multiple decks, card subsets, and AI gap analyses live entirely within `localStorage` and serialized JSON backups, preserving the zero-backend privacy guarantee.

---

## 2. Core Vision & User Journey

### The Problem with Category Guessing
Anyone can guess generic advice like *"practice React and algorithms"*. That provides zero tactical advantage.
The power of this feature is **pinpoint card-level assembly**:
- For **Stripe**: Assembles exact cards like `lru-cache-implementation`, `a11y-form-field`, `tabs-accordion-compound`, `event-emitter`, `query-string-url`, `format-utilities`, and `safe-json-storage`.
- For **Datadog**: Assembles `raf-throttle`, `lazy-load-observer`, `virtual-list`, `progress-bar`, `call-recorder-spy`, and `data-table`.
- For **Airbnb**: Assembles `calendar-month-grid`, `star-rating-component`, `image-carousel`, `combobox-autocomplete-a11y`, and `modal-portal-focus`.

```
+---------------------------------------------------------------------------------+
|                                USER INPUT                                       |
|  [1. Job & Company Anchors]                                                     |
|  - Company Name (e.g. "Stripe", "Airbnb", "Datadog", "Ramp")                    |
|  - Role & Target Level (e.g. "Senior Frontend Engineer - Design Systems")       |
|  - Target Interview Date & Daily Time Budget (e.g. "4 days out, 1.5 hrs/day")   |
|                                                                                 |
|  [2. Raw Intelligence Dump Box]                                                 |
|  - Job description, recruiter emails, interview round format breakdowns,        |
|    Glassdoor interview questions, team tech stack hints.                        |
|                                                                                 |
|  [3. Candidate Calibration: Strengths, Weaknesses & Past History]               |
|  - Interactive Confidence Sliders / Checkboxes:                                 |
|    "Strong in LeetCode algorithms, but rusty on building accessible React UI"   |
|  - Optional 1-Click Trainer Sync: Ingests user's actual Box 1 setbacks &        |
|    struggling cards from their local Leitner deck history.                      |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                       AI INTERVIEW PREP COPILOT                                 |
|  1. Ingests 277-card catalog metadata index (~12 KB).                           |
|  2. Cross-references JD signals, company archetypes, & user weak spots.         |
|  3. Synthesizes a curated 15–25 specific card practice curriculum.              |
|  4. Produces "External Gap Analysis" (topics outside flashcard coding scope).   |
|  5. Recommends targeted interactive learning tools (Flexbox Froggy, GraphQL,    |
|     CSS Battle, Web.dev, etc.).                                                 |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                               OUTPUTS & UI                                      |
|                                                                                 |
|  [A] Custom Deck in App: "Stripe - Staff Design Systems (22 Cards)"             |
|      - Practice mode operates strictly on this subset of cards.                 |
|      - Existing Topic Focus filters can still be applied on top.                |
|      - Every card displays: "Why this exact card was selected for Stripe".      |
|                                                                                 |
|  [B] Downloadable Executive Briefing PDF (One-Click Download):                  |
|      - Complete interview game plan formatted as an executive study dossier.   |
|      - High-priority flashcard drill list with company rationales.              |
|      - Conceptual study guide for external topics (System Design, GraphQL, etc.)|
|      - Curated interactive learning links & 24-hour countdown checklist.        |
+---------------------------------------------------------------------------------+
```

---

## 3. Recommended AI Models & Provider Tiers

The analysis prompt requires deep engineering context: identifying hidden signals in recruiter round descriptions (e.g. *"45m live-coding session focusing on component state composition"* vs *"algorithmic data structures"*), knowing what companies typically ask, and recommending high-quality external resources.

We will display model badges and guidance directly in the modal UI:

| Tier | Recommended Model | Best Use Cases & Nuance | Est. Cost / Run |
|---|---|---|---|
| **Tier 1: Recommended (Top Choice)** | **Anthropic Claude 3.5 Sonnet** (via OpenRouter) | **Gold standard.** Exceptional nuance in distinguishing engineering levels (Senior vs Staff), recognizing architectural patterns, and synthesizing concise, high-value study guides. Highly recommended for high-stakes interviews. | ~$0.015 – $0.03 |
| **Tier 1: Premium Alternative** | **OpenAI GPT-4o** (via OpenAI) | High accuracy on company interview pattern recognition (Glassdoor/Blind/LeetCode company tags), strong JSON schema adherence. | ~$0.015 – $0.025 |
| **Tier 2: Deep Strategic / Low Cost** | **Google Gemini 2.5 Pro** (via Google AI) | Enormous context window, strong reasoning on full recruiter conversation threads and long JDs, deep knowledge of FAANG rubrics. | ~$0.005 – $0.015 |
| **Tier 2: Ultra-Cheap Fast** | **Google Gemini 2.5 Flash** (via Google AI) | Very fast (~2s), ultra-cheap (~$0.002), great baseline curriculum synthesis. | ~$0.002 |
| **Tier 3: 100% Free / Instant** | **Groq Llama 3.3 70B Versatile** (via Groq) | Blazing fast (~1.5s), free tier. Great at keyword-to-tag mapping and quick drill setups, though slightly less nuanced on subtle recruiter subtext. | $0.00 (Free Tier) |

> **User Guidance in Modal**:
> *"For high-stakes rounds (onsites, staff-level loops), we recommend using your OpenRouter key with Claude 3.5 Sonnet or OpenAI key with GPT-4o. For rapid everyday practice decks, Groq or Gemini Flash provide fast, virtually free generation."*

---

## 4. Input Architecture: The Hybrid Smart Input Form

Users often don't want to parse their notes into dozens of tiny boxes, but AI models need clean anchors to produce accurate results. We use a **hybrid form**:

1. **Anchored Header Fields** (Top):
   - **Company Name**: e.g., *"Stripe"* or *"Datadog"* (triggers the model's knowledge of company interview style).
   - **Role & Target Level**: e.g., *"Staff Frontend Engineer"* vs *"Junior React Developer"* (scales problem difficulty from Level 1–2 to Level 4–5).
   - **Target Interview Date**: (optional date picker, powers countdown and daily review pacing).
2. **The "Raw Intelligence Dump" Textarea** (Main Body):
   - Single expansive textarea with smart placeholder:  
     `"Paste the job description, recruiter emails, round descriptions, prep guides, or any notes you have here. The AI will extract the signals automatically."`
   - Accepts unformatted text, copy-pasted recruiter bullet points, or multiple combined notes.
3. **Candidate Calibration & Weakness Diagnostics** (The "Follow-Up Questions" Step):
   - **Self-Reported Strengths & Weaknesses**:
     - Users can select or type where they feel least confident cold-coding under pressure:
       - `[ ]` Complex React Architecture (Compound components, Context, uncontrolled state, custom hooks)
       - `[ ]` Accessibility & DOM Contracts (ARIA roles, roving tabindex, focus management)
       - `[ ]` Asynchronous & Event Plumbing (Promises from scratch, polling backoff, event emitters)
       - `[ ]` Data Processing & System Polyfills (LRU caches, deep clone, query parsers)
       - `[ ]` Classic Algorithms (Sliding window, binary search, trees, intervals)
   - **Automatic Deck History Sync (1-Click Opt-in)**:
     - The wizard can inspect the user's actual `LeitnerDeckState`:
       - Automatically identifies cards currently in **Box 1** or with recent setbacks.
       - Feeds this weakness profile into the AI prompt so the generated deck doesn't just match the job description, but specifically reinforces the user's personal blind spots that are relevant to that company!
4. **Time & Capacity Budget**:
   - Days remaining and target daily review quota (e.g. *"I can do 3 cards per day for 5 days"*) -> automatically limits the curated deck to the 15 highest-yield cards so the candidate isn't overwhelmed.

---

## 5. Downloadable PDF Generation Engine

### How hard is it to generate a client-side PDF?
It is **very straightforward and lightweight**. In a zero-backend browser environment, there are two battle-tested approaches:

- **Approach A: Vector PDF Engine (`jspdf` + custom vector templates)**:
  - Generates a standalone `.pdf` binary in memory and triggers a direct browser download (`Stripe_Frontend_Interview_Guide.pdf`).
  - Completely independent of the user's printer or screen resolution.
  - Takes ~60 KB bundle footprint (loaded lazily on demand).
- **Approach B: Native Vector Print Dossier (`window.print()` with `@media print` CSS)**:
  - Renders a hidden or dedicated modal view styled like an executive report with crisp page breaks, headers, and footers.
  - Zero added bundle size. Clicking "Download PDF" opens the browser's native print preview with "Save as PDF" preselected.

*Recommendation:* Support **Approach A** with a dedicated lightweight `jspdf` generator for a true 1-click download, with **Approach B** as a beautiful preview screen.

---

### Specific Fields & Layout of the Generated PDF:

```
+-------------------------------------------------------------------------------------+
| LEITNER CODING TRAINER                         INTERVIEW PREPARATION DOSSIER        |
| Target: STRIPE — Senior Frontend Engineer (Design Systems)   Target Date: In 4 Days |
+-------------------------------------------------------------------------------------+
|                                                                                     |
| 1. EXECUTIVE CURRICULUM OVERVIEW                                                    |
|    "Stripe's frontend interview loops prioritize robust state management, compound  |
|    component accessibility, and zero-dependency JS data transformation pipelines.   |
|    The 22 cards selected below focus heavily on controlled/uncontrolled state,     |
|    accessible keyboard navigation, and defensive data normalization."               |
|                                                                                     |
| 2. TARGETED CODING CHALLENGES (22 CARDS IN CUSTOM DECK)                             |
|    [Priority: MUST-KNOW]                                                            |
|    - [ ] `a11y-form-field` (React Components, Diff: 3)                              |
|          Rationale: Stripe builds complex checkout forms; testing accessible IDs.   |
|    - [ ] `tabs-accordion-compound` (React Components, Diff: 4)                      |
|          Rationale: Evaluates compound Context API pattern & roving tabindex.       |
|    - [ ] `lru-cache-implementation` (JS Utilities, Diff: 3)                         |
|          Rationale: Standard Stripe phone-screen data structure benchmark.          |
|    [Priority: RECOMMENDED]                                                          |
|    - [ ] `virtual-list` (React Components, Diff: 4)                                 |
|    - [ ] `debounce-implementation` (JS Utilities, Diff: 2)                          |
|                                                                                     |
| 3. EXTERNAL GAPS & CRASH-COURSE STUDY GUIDE (Outside Flashcard Scope)               |
|    The following topics are highlighted in the job description or Stripe's stack:   |
|                                                                                     |
|    * GraphQL & Schema Stitching:                                                    |
|      - Focus: Query optimization, caching policies, fragments vs props.             |
|      - Recommended Crash Course: Apollo GraphQL Odyssey / Gemini 4-hr query drill.  |
|    * Micro-Frontend Architecture:                                                   |
|      - Focus: Module Federation, isolated styles, cross-application event buses.    |
|    * Web Performance & Core Web Vitals:                                             |
|      - Focus: LCP optimization, layout stability (CLS), dynamic bundle splitting.   |
|                                                                                     |
| 4. CURATED INTERACTIVE LEARNING TOOLS & PLAYGROUNDS                                 |
|    Hands-on drills recommended to complement your coding flashcards:                |
|    - CSS Layout: Flexbox Froggy (flexboxfroggy.com), Grid Garden (cssgridgarden.com)|
|    - Visual CSS Mastery: CSSBattle (cssbattle.dev) for speed selector drills.       |
|    - Accessibility Auditing: Web.dev Learn Accessibility interactive modules.       |
|    - SQL & Data Queries: SQLBolt (sqlbolt.com) for backend data querying rounds.    |
|                                                                                     |
| 5. 24-HOUR COUNTDOWN & INTERVIEW DAY CHECKLIST                                      |
|    [ ] 24 Hours Out: Re-run all Box 1 failed cards in Leitner Reinforcement Mode.    |
|    [ ] Environment: Check Node version, CodeSandbox/CoderPad microphone/screen.     |
|    [ ] In-Interview Blueprint:                                                      |
|        1. Spend first 5m asking clarifying questions (scale, edge cases, contracts).|
|        2. State brute force approach and complexity before typing.                  |
|        3. Write clean helper signatures before component body.                      |
+-------------------------------------------------------------------------------------+
```

---

## 6. Implementation Roadmap

### Phase 1: Custom Decks Core Architecture & Preset Starter Decks
- **Preset Built-in Starter Decks**:
  - **Full-Stack Core** (default balanced library: algorithms, React, DOM, async, utilities).
  - **Frontend Specialist** (focused strictly on React components, hooks, DOM/browser APIs, UI patterns, and async plumbing).
  - **Core Algorithms** (focused on standard data structures, sliding window, two-pointer, intervals, and binary search).
  - **MAANG Algorithms** (focused strictly on hardcore LeetCode Medium/Hard algorithmic rungs: dynamic programming, graphs, backtracking, tries, and min-heaps).
- **Deck Switcher Dropdown UX**:
  - Located prominently on the main navigation bar / catalog header:
    ```
    [ 🗂️ Deck: Frontend Specialist (125) ▾ ]
       ⭐ Built-in Starter Decks
       • Full-Stack Core (224 cards)
       • Frontend Specialist (125 cards)
       • Core Algorithms (47 cards)
       • MAANG Algorithms (53 cards)
       ───────────────────────────────────────
       📁 Custom Decks
       • Stripe Senior Screen (19 cards)
       • Weak Spots Sprint (8 cards)
       ───────────────────────────────────────
       ➕ Create Custom Deck...
       🎯 Tailor with AI Copilot...
    ```
- **Card-Level Data Representation**:
  - A deck is **never a category container**; it is an explicit array of **individual card IDs** (`cardIds: string[]`).
  - Example: A "Stripe Senior Screen" deck contains `cardIds: ['tabs-accordion-compound', 'lru-cache-implementation', 'a11y-form-field', ...]`.
- **Identical Catalog Table Experience (Scoped to Active Deck)**:
  - When viewing a deck, the Deck Catalog displays the **exact same table UI as today** (Title, Topic, Difficulty, Box/Tier, Streak, actions).
  - The rows are simply scoped to the cards in `activeDeck.cardIds`.
  - All existing table controls continue to work within the deck: learners can still use the **Topic Filter Bar** (to isolate e.g. only React cards within that deck), search by name, or filter by difficulty/mastery tier.
- **Practice Arena Scheduling**: Update `getNextCard` candidate selection so practice runs strictly within the active deck when one is selected.
- **"Remove From Deck" Paradigm (Replacing Card Deactivation)**:
  - Instead of an isolated "Deactivate Card" toggle, card pruning is handled through decks. The master/full library always retains all cards.
  - Both in the Practice Arena (positioned next to "Skip Card") and in the catalog table, provide a rapid **"Remove From Deck"** action.
  - **Forking Preset Decks into Personal Custom Decks**:
    - Built-in starter decks (Full-Stack Core, Frontend Specialist, Core Algorithms, MAANG Algorithms) serve as clean, immutable presets.
    - If a user clicks **"Remove From Deck"** while practicing on a built-in preset deck, a modal pops up prompting them to name their new personal deck (pre-filled with e.g. *"<Preset Name> (Personal)"*).
    - Upon confirming the name, the system clones the preset into a custom deck minus the removed card, switches the active deck to this new personal deck, and immediately advances to the next eligible card.
    - When already studying in a custom personal deck, clicking **"Remove From Deck"** immediately excludes the card from that custom deck's `cardIds` without asking for a new deck name, quickly moving on to the next card.
- **Catalog Management**: Add multi-select checkboxes in the Deck Catalog table allowing users to manually assemble or add cards to any custom deck.
- **Default Opening Screen & Two-Stage Split Guided Tour**:
  - **Decks Screen as Default Entrypoint**: The default initial view on first launch transitions from the practice arena to the Deck Catalog (`DeckDashboard`), giving learners an immediate high-level overview of their available curriculum and decks.
  - **Stage 1 Tour (Deck Catalog & Decks Concept)**: On first visit, the initial tour triggers directly on the Deck Catalog screen. It introduces the deck architecture (preset starter decks vs. personal/custom decks), filtering by topic/mastery, and clearly spotlights where to click to begin practicing (the primary `[ Start Practicing ]` button in the navigation header as well as 1-click card practice in the table).
  - **Stage 2 Tour (Practice Arena)**: When the learner clicks through to the Practice Arena for the very first time, the second phase of the tour opens seamlessly. It guides them through reading the problem & contract table, the cold-start editor buffer, Run Code / Test vs. Submit Final Answer, live component previews, and the Socratic AI hint assistant (`(?)`).
- **Establish First-Class `maang-algorithms` Topic Track**:
  - Replace the awkward `algorithms-advanced` hidden pack mechanism by promoting it to a first-class topic track: `maang-algorithms` (labeled **"MAANG Algorithms"**, styled in vibrant purple/magenta `#a855f7`).
  - Contains the 53 advanced cards (N-Queens, Word Ladder, Median in Data Stream, Word Break, LIS, Topological Sort, Min Path Sum, etc.).
  - Visible openly in the catalog under its own dedicated Topic Filter chip, but completely quarantined from beginners who practice with the "Frontend Specialist" or "Core Algorithms" decks!

### Phase 2: Catalog Indexing & Structured Prompt Pipeline
- **Catalog Index Script (`scripts/build-catalog-index.mjs`)**: Compiles 277 cards into a minified ~12 KB descriptor index (`id`, `track`, `title`, `concept`, `difficulty`, `tags`, `shortSummary`).
- **Prompt Engineering (`src/lib/interviewPrepPrompt.ts`)**: Structured prompts instructing the model to validate IDs, extract external topics, provide card rationales, and suggest interactive resources (Flexbox Froggy, GraphQL, etc.).
- **Structured Schema Validator**: Parses JSON response, drops any invalid/hallucinated IDs, and ensures strict type compliance.

### Phase 3: Interview Prep Wizard UI Modal
- **Hybrid Input Modal**:
  - Anchors: Company Name, Role, Target Date.
  - Textarea: Raw Intelligence Dump for JD and recruiter emails.
  - Model Selector with badges highlighting recommended frontier models (Claude 3.5 Sonnet / GPT-4o) vs free tier options (Groq / Gemini Flash).
- **Curriculum Assembly & Review Screen**: Allows toggling recommended cards before creating the deck.
- **Interactive External Guide Tab**: Renders the non-coding study guide and resource links inside the Deck Dashboard with checkable items.

### Phase 4: Downloadable PDF Generation Engine
- **PDF Generator Utility (`src/lib/pdfGenerator.ts`)**: Client-side vector generation of the formatted Interview Dossier using `jspdf`.
- **One-Click Download Action**: Download button on the custom deck header generating `[Company]_[Role]_Prep_Guide.pdf`.
- **Printable Dossier View**: Clean print-media stylesheet for high-resolution paper or PDF export.

### Phase 5: In-Arena AI Socratic Clarification & Hint Assistant ("Ask AI")
- **The Problem**: When practicing cold-start recall, learners occasionally experience total mental blocks on an algorithm's definition or mechanics (e.g. *"I forgot the conceptual premise of insertion sort"*) or need ambiguity clarified in a prompt contract. Revealing the solution ruins the practice trial, and leaving the app to Google it breaks immersion.
- **Visual Design & Placement**:
  - Located in the **top-right corner of the problem statement box** (`PracticeHeader.tsx`).
  - Rendered as a subtle, translucent question mark inside a circle `(?)`. Because prompt text rarely stretches completely across the top-right margin, it remains clean, unobtrusive, and uncrowded.
- **Interaction & Expand Animation**:
  - Clicking the `(?)` button smoothly expands an overlay panel downward and outward from that top-right corner, staying **strictly contained within the left prompt section**.
  - **Zero Editor Disruption**: The right-hand CodeMirror editor remains 100% visible, active, and typable so the learner can write code while glancing at the clarification.
- **Two-Way Chat & Quick Prompt Chips**:
  - Quick-action prompt chips for instant 1-click answers:
    - `[ ❓ Clarify problem requirements / rules ]`
    - `[ 🧠 Conceptual refresher (e.g. "How does insertion sort work?") ]`
    - `[ ⚠️ What edge cases should I watch for? ]`
    - `[ 🔍 Why might my current approach get stuck? ]`
  - An open text field supporting continuous two-way conversational follow-ups.
- **Strict Anti-Spoiler / Socratic Guardrails**:
  - System prompt passes the prompt, contract table, user code, and the canonical reference solution (`.ref.js` and `.ref.ts`), guaranteeing 100% accuracy while enforcing the strict Socratic rule:
    > *"CRITICAL RULE: You are a Socratic coding interview coach. You must NEVER output the code solution, executable snippets, or direct implementations that solve the problem. Instead, explain the algorithmic concept in plain English, ask guiding questions to steer the learner's thinking, clarify what a contract requirement means, or highlight an unhandled edge case. Keep answers concise (under 3 paragraphs)."*
- **Offline / No-API-Key State**:
  - If a user clicks the `(?)` without an AI key configured, it opens the **exact same panel style**, explaining the Socratic AI Coach feature and providing a friendly 1-click button (`[ Add Free AI Key in Settings ]`) that links directly to the Multi-Key Vault (pointing out Groq's free tier).

---

## 7. Security, Privacy & Integrity

- **Client-Side Privacy**: Raw recruiter notes, job descriptions, and custom deck curricula are sent directly to the user's selected API endpoint (Anthropic, OpenAI, Google, Groq) using their own stored API keys from the Multi-Key Vault. No intermediate server ever sees the data.
- **Untrusted Output Protection**: AI outputs are parsed with `parseEvaluationPayload` / `safeJsonParse`. Any card IDs not matching the active catalog are filtered out automatically.
