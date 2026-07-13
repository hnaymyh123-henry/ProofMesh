# ProofMesh Product Plan

## Product thesis

ProofMesh turns a disputed online claim into a living, auditable case file. It does not hide uncertainty behind a single AI answer: two independent Gonka models investigate the same claim from opposing positions, compare live evidence, and publish a traceable verdict with request IDs.

## Primary audience

1. People who encounter viral claims and need a fast, understandable answer.
2. Community moderators and DAO operators who need to explain moderation decisions.
3. Journalists and researchers who need a reproducible starting point for verification.

## Core promise

Paste a URL, X post, text claim, or image. In under two minutes, receive:

- atomic claims extracted from the input;
- a structured case for and against;
- a 0-100 Truth Score with calibrated uncertainty;
- a source-diversity view and evidence trail;
- Gonka model and request IDs for every inference;
- a downloadable Proof Card for sharing.

## Differentiation

### Evidence Duel

Two different models receive the same evidence but different mandates. The Investigator builds the strongest supported case; the Challenger searches for contradictions, missing context, and alternative explanations.

### Reversible verdicts

Every report includes “What would change this verdict?” so the product communicates falsifiability instead of artificial certainty.

### Truth Timeline

Case files are designed to be rechecked as evidence changes. The MVP renders the evidence milestones and score history; persistent scheduled rechecks are a post-hackathon extension.

### Proof Card

Each result can be exported as a branded image containing the claim, score, verdict, timestamp, source count, and audit identifier.

### Gonka-native auditability

All AI inference flows through GonkaRouter. The UI exposes the participating model names and request IDs rather than hiding them in logs.

## MVP scope

### Inputs

- URL
- X post URL
- Free-form text claim
- Image upload

### Analysis pipeline

1. Normalize input and isolate potentially untrusted instructions.
2. Kimi K2.6 decomposes the content into atomic claims and search queries.
3. The server collects the submitted page plus relevant public web evidence.
4. Kimi K2.6 acts as Investigator.
5. MiniMax M2.7 acts as Challenger.
6. A final consensus pass produces the score, verdict, uncertainty, and reversal conditions.
7. The report displays all inference request IDs.

### Demo-safe behavior

The application contains one curated sample case so the full interaction can be recorded even when an external service is temporarily unavailable. Live results are visually distinguished from the sample simulation.

## Hero demo story

1. Open ProofMesh and load the sample claim.
2. Start the verification and watch the pipeline advance through claim mapping, evidence retrieval, model debate, and consensus.
3. Reveal the Truth Score and the model disagreement.
4. Open the evidence trail and show the Gonka request IDs.
5. Highlight “What would change this verdict?”
6. Download the Proof Card.

## Success criteria

- A first-time user understands the value within 10 seconds.
- The full sample flow completes without setup.
- A live Gonka key enables real two-model inference.
- The result includes a score, verdict, evidence, model disagreement, and audit IDs.
- The experience is usable on desktop and mobile.
- The project builds and deploys as a public website.

## Post-hackathon path

- persistent public case URLs;
- automatic re-verification and score-change alerts;
- X/Discord/Telegram bot integrations;
- team workspaces and moderation queues;
- API access for publishers and community platforms;
- cryptographic report anchoring and signed Proof Cards.
