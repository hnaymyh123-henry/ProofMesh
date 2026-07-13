# ProofMesh Product Plan

## Product thesis

ProofMesh turns a disputed online claim into a living, auditable case file. Two independent Gonka models investigate the same evidence from opposing positions, then a consensus pass publishes a traceable verdict with visible request IDs.

The core product insight is that trust comes from seeing the verification process, not from receiving a more confident answer.

## Primary audience

1. People who encounter viral claims and need a fast, understandable answer.
2. Community moderators and DAO operators who must explain decisions.
3. Journalists and researchers who need a reproducible verification starting point.

## Core promise

Paste a URL, X post, text claim, or image. Receive:

- atomic claims extracted from the input;
- an adversarial case for and against;
- a 0-100 Truth Score with calibrated uncertainty;
- a source-diversity view and evidence trail;
- model and request IDs for every inference;
- explicit conditions that would reverse the verdict;
- a downloadable Proof Card.

## Product experience: three acts

### Act 1 - Input workspace

The opening screen acts like a verification terminal, not a landing page. The user chooses an input type, submits a claim, and presses Enter. The value proposition, safety promise, and primary action all fit in one viewport.

### Act 2 - Agent workspace

The application changes state completely. A live orchestration view shows Claim Mapper, Investigator, Challenger, and Consensus Judge moving through four visible stages. Activity lines, status changes, signals, and elapsed time make the work legible while the real pipeline runs.

### Act 3 - Result workspace

The result opens automatically as a single-screen app. The verdict, score, and claim remain anchored on the left. Overview, Evidence, Agents, and Audit panels switch locally on the right, so the user explores the case without scrolling through a long report.

## Differentiation and sell points

### Evidence Duel

Two models receive the same evidence but opposing mandates. The Investigator builds the strongest supported interpretation; the Challenger searches for contradictions, missing context, and unsupported leaps.

### Visible Agent orchestration

The process page makes multi-agent work understandable. It is both a product explanation and a meaningful live status surface, replacing a generic loading spinner.

### Reversible verdicts

Every case states what new evidence would change the result. This communicates falsifiability instead of artificial certainty.

### Auditable inference ledger

Participating models, confidence values, request IDs, the network, timestamps, and the case ID remain visible inside one audit panel.

### Source provenance and diversity

Evidence items keep publisher, date, excerpt, stance, and destination URL. A source-diversity meter warns when apparent agreement comes from repeated or dependent sources.

### Proof Card

Each result exports as a branded image containing the claim, score, verdict, timestamp, source count, and audit identifier.

## Analysis pipeline

1. Normalize the input and isolate potentially untrusted instructions.
2. Kimi K2.6 decomposes the content into atomic claims and search queries.
3. The server collects the submitted page plus public web and reference evidence.
4. Kimi K2.6 acts as Investigator.
5. MiniMax M2.7 acts as Challenger.
6. A final consensus pass produces the score, verdict, uncertainty, and reversal conditions.
7. The result workspace displays all inference request IDs.

## Demo-safe behavior

The application contains one curated case so the complete interaction remains available during a temporary external outage. Live results and the simulation are labeled differently.

## Success criteria

- A first-time user understands the value within 10 seconds.
- Enter starts the verification without another setup step.
- The multi-agent process is visually understandable while the pipeline runs.
- A live Gonka key enables real dual-model inference.
- The result exposes score, evidence, disagreement, reversal conditions, and audit IDs.
- The main desktop flow uses three application states instead of a long document.
- The experience remains usable on mobile with local panel scrolling.
- The project builds and deploys as a working private demo.

## Post-hackathon path

- persistent public case URLs;
- automatic re-verification and score-change alerts;
- X, Discord, and Telegram bot integrations;
- team workspaces and moderation queues;
- source-quality policies by organization;
- API access for publishers and communities;
- cryptographic report anchoring and signed Proof Cards.
