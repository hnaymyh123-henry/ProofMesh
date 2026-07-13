import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const ctx = { waitUntil() {}, passThroughOnException() {} };

test("server-renders the finished ProofMesh product", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>ProofMesh — Auditable truth for the open web<\/title>/i);
  assert.match(html, /Don&#x27;t trust the answer/);
  assert.match(html, /What should we investigate\?/);
  assert.match(html, /Gonka live/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("provides a complete curated demo analysis without a secret", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: "text",
        content: "The Great Wall of China is visible from the Moon with the naked eye.",
      }),
    }),
    env,
    ctx,
  );

  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.live, false);
  assert.equal(result.verdict, "False");
  assert.equal(result.score, 6);
  assert.equal(result.agents.length, 3);
  assert.ok(result.agents.every((agent) => agent.requestId));
  assert.ok(result.evidence.length >= 4);
  assert.ok(result.reversalConditions.length >= 3);
});

test("keeps the live Gonka integration and social asset in the deliverable", async () => {
  const [route, workspace, layout] = await Promise.all([
    readFile(new URL("../app/api/analyze/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/TruthWorkspace.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(route, /moonshotai\/Kimi-K2\.6/);
  assert.match(route, /MiniMaxAI\/MiniMax-M2\.7/);
  assert.match(route, /GONKA_API_KEY/);
  assert.match(route, /Google News/);
  assert.match(route, /Wikipedia/);
  assert.match(route, /Number\.isFinite\(numeric\)/);
  assert.doesNotMatch(route, /Number\([^)]*\)\s*\|\|\s*50/);
  assert.match(workspace, /Download Proof Card/);
  assert.match(workspace, /What would change this verdict\?/);
  assert.match(workspace, /type AppView = "home" \| "processing" \| "result"/);
  assert.match(workspace, /processing-screen/);
  assert.match(workspace, /Case report sections/);
  assert.match(layout, /og\.png/);
});
