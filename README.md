# ProofMesh

ProofMesh turns a disputed online claim into a living, auditable case file. Two different models investigate the same evidence from opposing positions, then a consensus step publishes a 0-100 Truth Score, uncertainty, evidence trail, reversal conditions, and visible Gonka request IDs.

Built for the **Gonka: AI for Society** track of the AI3 Growth Hackathon 2026.

## Product experience

ProofMesh uses a three-stage web app flow:

1. **Input workspace** - submit an article, X post, text claim, or image and press Enter.
2. **Agent workspace** - watch Claim Mapper, Investigator, Challenger, and Consensus work through the live pipeline.
3. **Result workspace** - inspect Overview, Evidence, Agents, and Audit panels without scrolling through a long report.

## Product highlights

- URL, X post, text, and image inputs
- atomic claim decomposition
- Kimi K2.6 Investigator vs. MiniMax M2.7 Challenger
- public-web and reference evidence collection
- auditable request IDs and model provenance
- Truth Timeline and explicit reversal conditions
- downloadable social Proof Card
- curated offline demo case for reliable presentations

The complete product plan lives in [`docs/PRODUCT_PLAN.md`](docs/PRODUCT_PLAN.md), and the one-take narration script lives in [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md).

## Demo deliverables

- Private live app: <https://proofmesh-audit.ym2752columbia.chatgpt.site>
- Recorded real-model walkthrough: [`output/playwright/ProofMesh-Demo.mp4`](output/playwright/ProofMesh-Demo.mp4)
- Submission-ready walkthrough with English guide captions: [`output/playwright/ProofMesh-Demo-EN.mp4`](output/playwright/ProofMesh-Demo-EN.mp4)

The recorded walkthrough uses a real GonkaRouter run and shows the complete input, Agent, result, evidence, model, audit, and Proof Card flow.

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

- `app/TruthWorkspace.tsx` - three-stage interactive verification workspace
- `app/api/analyze/route.ts` - GonkaRouter orchestration and evidence acquisition
- `app/lib/demo-case.ts` - curated presentation-safe sample
- `public/og.png` - branded social preview card
- `.openai/hosting.json` - Sites deployment binding

All live AI inference goes through GonkaRouter. The API key remains server-side.
