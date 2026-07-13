# ProofMesh

ProofMesh turns a disputed online claim into a living, auditable case file. Two different models investigate the same evidence from opposing positions, then a consensus step publishes a 0–100 Truth Score, uncertainty, evidence trail, reversal conditions, and visible Gonka request IDs.

Built for the **Gonka: AI for Society** track of the AI³ Growth Hackathon 2026.

## Product highlights

- URL, X post, text, and image inputs
- atomic claim decomposition
- Kimi K2.6 Investigator vs. MiniMax M2.7 Challenger
- public-web evidence collection
- auditable request IDs and model provenance
- Truth Timeline and explicit reversal conditions
- downloadable social Proof Card
- curated offline demo case for reliable presentations

The complete product plan and Demo Day narrative live in [`docs/PRODUCT_PLAN.md`](docs/PRODUCT_PLAN.md).

## Run locally

Prerequisite: Node.js 22.13 or later.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Enable live Gonka analysis

Copy `.env.example` to `.env.local`, then set `GONKA_API_KEY` locally. Never commit the real key.

```env
GONKA_API_KEY=sk-...
GONKA_API_BASE_URL=https://api.gonkarouter.io/v1
GONKA_INVESTIGATOR_MODEL=moonshotai/Kimi-K2.6
GONKA_CHALLENGER_MODEL=MiniMaxAI/MiniMax-M2.7
```

Without a key, the app deliberately returns the clearly labeled curated sample case so the product remains demoable.

## Verification

```bash
npm test
npx tsc --noEmit
npm run lint
```

## Architecture

- `app/TruthWorkspace.tsx` — interactive investigation and report experience
- `app/api/analyze/route.ts` — GonkaRouter orchestration and evidence acquisition
- `app/lib/demo-case.ts` — curated, presentation-safe sample
- `public/og.png` — branded social preview card
- `.openai/hosting.json` — Sites deployment binding

All live AI inference goes through GonkaRouter. The API key remains server-side.
