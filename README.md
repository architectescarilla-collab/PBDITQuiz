# PBDIT Quiz

A Kahoot-style quiz app for PBDIT lessons. You can host a live game with a PIN and invite link, then players answer timed questions and see the ranking update after each one. You can also practice solo.

**Stack:** Next.js (App Router) + Tailwind, with a muted earth-tone palette defined once in `app/globals.css`, deployed on Vercel. Live games are stored in Upstash Redis.

## Features

- **Topic → Lesson → Difficulty → Item count** picker
  - Network Fundamentals → Lesson 1: Introduction to Networks ✅
  - Network Fundamentals → Lesson 2: OSI Layers ✅
  - Programming Fundamentals → Lessons 1–2: Introduction to Python ✅
  - Programming Fundamentals → Lessons 2b–3b: Loops, Lists & Tuples, Sets & Dictionaries ✅
  - PBDIT 504 Object-Oriented Analysis and Design → Lesson 1: OOAD for Beginners ✅ (situation-based questions)
  - Information Management — *coming soon*
- **Difficulties:** Easy (20s), Hard (25s), Tricky (30s), or **Full Challenge** (Easy → Hard → Tricky rounds)
- **Item count:** 10 / 20 / 30 / 40 / All
- **Fresh shuffle every round:** each game draws new questions from the bank, in a new order, with the choices shuffled too
- **Kahoot-style scoring:** an instant correct answer gets full points, dropping to half at the buzzer (Easy 1000, Hard 1500, Tricky 2000 max)
- **Live mode:** the host screen shows the PIN, invite link, player list, answer counts, answer breakdown, explanations, top 5 after each question, and a final podium
- **Flashcards (Quizlet-style):** switch between *Quiz game* and *Flashcards* on the home page. Flip cards (question → answer + explanation), sort them into *Know it* / *Still learning*, re-study only the ones you're still learning, shuffle, show or hide the choices, put the answer first, use keyboard shortcuts (Space / ← / →), and see the full card list. Known cards are remembered on the device.
- **Other Games tab:** a top tab bar switches between *PBDIT Quiz Games* (the default landing page) and *Other Games*, which are just-for-fun games. The first one is **Flappy Boji**: tap, click or press Space to fly BJ's caricature between skyscrapers. Difficulty ramps up as you score, flap and crash sounds are synthesized with Web Audio (🔊 button or M to mute, remembered per device), there are bronze/silver/gold/platinum medals at 10/20/30/40, and your best score is saved on the device. The second is **PBDIT Kart**, a 3D kart racer (Three.js) on a daytime cyber circuit. You race as Python 🐍, HTML 🕷️, C# 🦈 or Java ☕ against up to 3 computer racers over 3 laps, on one of three circuits: **Server Farm Speedway** (Easy), **Cyber Circuit** (Medium) and **Silicon Canyon** (Hard). Each circuit has its own scenery, and your best time on each one is saved on the device. To add a track, add a `TrackDef` (control points + theme) in `components/games/kart/track.ts`. There's drifting with mini-turbos, and ? boxes give power-ups: ⚡ Turbo Boost, ❄️ Freeze (the nearest racer, 0.5 s), 🛡️ Firewall (blocks the next Freeze/Swap) and 🔀 Swap (trade places with the racer just ahead). It works with the keyboard or touch controls. The race logic lives in `components/games/kart/engine.ts`, with no rendering, so it can be tested on its own. To add a game, add a card in `app/games/page.tsx` and a page under `app/games/`.
- **Solo practice:** same timer and scoring, a review of missed questions, and personal bests saved on the device

## Question banks

| Lesson | File | Questions |
|---|---|---|
| Network Fundamentals · Lesson 1: Introduction to Networks | `lib/questions/network-fundamentals/lesson-1-intro-to-networks.ts` | 120 (42 easy · 40 hard · 38 tricky) |
| Network Fundamentals · Lesson 2: OSI Layers | `lib/questions/network-fundamentals/lesson-2-osi-layers.ts` | 126 (44 easy · 42 hard · 40 tricky) |
| Programming Fundamentals · Lessons 1–2: Introduction to Python | `lib/questions/programming-fundamentals/lesson-1-2-intro-to-python.ts` | 106 (40 easy · 34 hard · 32 tricky) |
| Programming Fundamentals · Lessons 2b–3b: Loops, Lists & Tuples, Sets & Dictionaries | `lib/questions/programming-fundamentals/lesson-2b-3b-loops-and-collections.ts` | 123 (40 easy · 40 hard · 43 tricky) |
| PBDIT 504 OOAD · Lesson 1: OOAD for Beginners (module pages 1–37) | `lib/questions/ooad/lesson-1-ooad-for-beginners.ts` | 99 (36 easy · 34 hard · 29 tricky), all "Situation … best answer" |

The Network Fundamentals banks are drafted from the PBDIT 503 lesson PDFs (C. T. Agos Jr.). The Programming Fundamentals banks are drafted from the PBDIT 501 lessons (PUP Open University System).

Situation questions start with `Situation:` and use a blank line before the actual question; the app shows a SITUATION label and a smaller font for long text. Quiz timers add reading time for long questions (`readingBonus` in `lib/quiz.ts`). Code questions use `code("prompt", \`snippet\`)` and backticks for code-like choices. Every "What is the output?" answer was checked by running the snippet in Python 3.

To edit or add questions, list the **correct answer first**. Choices are shuffled at runtime. Then run:

```bash
npm run validate-bank
```

To add a new lesson, create a bank file and mark it `available` in `lib/catalog.ts`.

## Run locally

```bash
npm install
npm run dev
```

Without Redis env vars, live games use an in-memory store (fine for local testing in one process).

## Deploy (GitHub → Vercel)

1. In Vercel, choose **Add New → Project** and import this GitHub repo. The defaults work.
2. Go to **Project → Storage → Upstash for Redis (Marketplace)**, create a free database, and connect it to the project. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `_TOKEN`).
3. Redeploy. Every push to `main` deploys to production, and every PR gets a preview URL.

> Live games **need** Redis on Vercel. Serverless instances don't share memory, so without it players may get "Game not found".
