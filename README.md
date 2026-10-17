# Scam Spotter

Scam Spotter is a browser-based prototype for checking suspicious SMS, email, chat, banking, and delivery messages. It uses explicit, explainable rules rather than an AI service or backend.

## Run locally

Install [Node.js](https://nodejs.org/) (which includes npm), then run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Checks

```bash
npm test
npm run build
```

## How it works

The detector in `src/lib/scamDetector.ts` matches phrases and simple context patterns, records their original message positions, and assigns a fixed point value to each rule. Repeated matches from one rule do not add extra points; the total score is capped at 100. Results show matched phrases, explanations, and suggested safe actions.

This score is a heuristic, not a probability. A low score does not prove that a message is safe. Message text cannot authenticate its sender, and URL indicators are caution signals—not a definitive verdict about a website.

The prototype analyzes text locally in the browser. It has no backend, external detection API, account, or message history.

## Project layout

- `src/lib/` — message detection, scoring, highlighting, and unit tests
- `src/components/` — shared UI components
- `src/data/` — sample messages, learning topics, and quiz questions
- `src/types/` — shared TypeScript types

This prototype is for awareness and education; it does not replace professional security advice.
