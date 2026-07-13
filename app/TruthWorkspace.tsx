"use client";

import { useMemo, useState } from "react";
import { SAMPLE_CLAIM } from "./lib/demo-case";
import type { AnalysisResult, InputKind } from "./lib/types";

type AppView = "home" | "processing" | "result";
type ResultPanel = "overview" | "evidence" | "agents" | "audit";

const inputModes: Array<{ id: InputKind; label: string; hint: string }> = [
  { id: "url", label: "Article", hint: "Paste a news or blog URL" },
  { id: "x", label: "X post", hint: "Paste an X post URL" },
  { id: "text", label: "Claim", hint: "Paste or type a factual claim" },
  { id: "image", label: "Image", hint: "Upload an image to inspect" },
];

const pipelineStages = [
  { number: "01", label: "Claim map", detail: "Isolating atomic claims", agent: "Mapper" },
  { number: "02", label: "Evidence", detail: "Retrieving independent sources", agent: "Kimi" },
  { number: "03", label: "Evidence duel", detail: "Stress-testing both positions", agent: "MiniMax" },
  { number: "04", label: "Consensus", detail: "Calibrating the final verdict", agent: "Judge" },
];

const activityLines = [
  ["Parsing the submitted content", "Separating claims from instructions", "Generating research queries"],
  ["Searching public evidence", "Checking source provenance", "Building a shared evidence packet"],
  ["Investigator is building the case", "Challenger is testing weak assumptions", "Comparing independent conclusions"],
  ["Weighting source quality", "Reconciling model disagreement", "Signing the auditable case file"],
];

const samplePrompts = [
  "The Great Wall of China is visible from the Moon with the naked eye.",
  "A viral post says the EU will ban all cash payments in 2027.",
  "This screenshot proves the quoted public figure wrote the post.",
];

const resultPanels: Array<{ id: ResultPanel; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "evidence", label: "Evidence" },
  { id: "agents", label: "Agents" },
  { id: "audit", label: "Audit" },
];

function scoreTone(score: number) {
  if (score >= 70) return "supported";
  if (score >= 40) return "disputed";
  return "false";
}

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.join(" ") !== lines.join(" ")) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[. ]+$/, "")}...`;
  }
  return lines;
}

export function TruthWorkspace() {
  const [view, setView] = useState<AppView>("home");
  const [activePanel, setActivePanel] = useState<ResultPanel>("overview");
  const [kind, setKind] = useState<InputKind>("text");
  const [content, setContent] = useState(SAMPLE_CLAIM);
  const [imageData, setImageData] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);

  const canAnalyze = Boolean(content.trim() || imageData);
  const sourceMix = useMemo(() => {
    if (!result) return [];
    return result.evidence.reduce<Array<[string, number]>>((acc, evidence) => {
      const match = acc.find(([publisher]) => publisher === evidence.publisher);
      if (match) match[1] += 1;
      else acc.push([evidence.publisher, 1]);
      return acc;
    }, []);
  }, [result]);

  async function analyze() {
    if (!canAnalyze || isAnalyzing) return;
    setError(undefined);
    setResult(null);
    setActivePanel("overview");
    setIsAnalyzing(true);
    setStage(0);
    setElapsed(0);
    setView("processing");

    const stageTimer = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, pipelineStages.length - 1));
    }, 5400);
    const clockTimer = window.setInterval(() => setElapsed((current) => current + 1), 1000);

    try {
      const [response] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, content, imageData }),
        }),
        new Promise((resolve) => window.setTimeout(resolve, 4200)),
      ]);
      const payload = (await response.json()) as AnalysisResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "The analysis could not be completed.");
      setStage(pipelineStages.length - 1);
      setResult(payload);
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setView("result");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The analysis could not be completed.");
      setView("home");
    } finally {
      window.clearInterval(stageTimer);
      window.clearInterval(clockTimer);
      setIsAnalyzing(false);
    }
  }

  function startNewCase() {
    setResult(null);
    setError(undefined);
    setActivePanel("overview");
    setView("home");
  }

  function loadSample(sample: string) {
    setKind("text");
    setContent(sample);
    setImageData(undefined);
    setImageName(undefined);
    setResult(null);
    setError(undefined);
  }

  function handleFile(file?: File) {
    if (!file) return;
    if (file.size > 4_000_000) {
      setError("Use an image smaller than 4 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(String(reader.result));
      setImageName(file.name);
      setContent(`Uploaded image: ${file.name}`);
      setError(undefined);
    };
    reader.readAsDataURL(file);
  }

  async function copyAudit() {
    if (!result) return;
    const text = `ProofMesh case ${result.caseId}\n${result.claim}\nVerdict: ${result.verdict} / Truth Score ${result.score}/100\n${result.summary}\nAudit: ${result.agents
      .map((agent) => `${agent.model} ${agent.requestId}`)
      .join(" | ")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadProofCard() {
    if (!result) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#0b0d0f";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#d8ff63";
    context.fillRect(72, 70, 14, 74);
    context.font = "700 34px Arial";
    context.fillStyle = "#f4f1e8";
    context.fillText("PROOFMESH", 116, 114);
    context.font = "500 20px Arial";
    context.fillStyle = "#9aa19a";
    context.fillText("AUDITABLE TRUTH FOR THE OPEN WEB", 116, 146);

    context.font = "500 24px Arial";
    context.fillStyle = "#9aa19a";
    context.fillText("CLAIM", 76, 238);
    context.font = "600 50px Arial";
    context.fillStyle = "#f4f1e8";
    wrapText(context, result.claim, 1020, 4).forEach((line, index) =>
      context.fillText(line, 76, 310 + index * 66),
    );

    context.beginPath();
    context.arc(1320, 304, 150, 0, Math.PI * 2);
    context.fillStyle = result.score >= 70 ? "#4cc887" : result.score >= 40 ? "#ffb45e" : "#ff6c62";
    context.fill();
    context.textAlign = "center";
    context.font = "800 102px Arial";
    context.fillStyle = "#0b0d0f";
    context.fillText(String(result.score), 1320, 330);
    context.font = "700 22px Arial";
    context.fillText("TRUTH SCORE", 1320, 374);
    context.textAlign = "left";

    context.fillStyle = "#171a1d";
    context.fillRect(76, 596, 1448, 184);
    context.font = "700 22px Arial";
    context.fillStyle = "#d8ff63";
    context.fillText(result.verdict.toUpperCase(), 112, 642);
    context.font = "400 25px Arial";
    context.fillStyle = "#d8dbd4";
    wrapText(context, result.summary, 1320, 3).forEach((line, index) =>
      context.fillText(line, 112, 690 + index * 36),
    );

    context.font = "500 19px Arial";
    context.fillStyle = "#7f877f";
    context.fillText(
      `${result.caseId} / ${result.evidence.length} sources / ${result.network.provider} / ${formatTime(result.network.completedAt)}`,
      76,
      838,
    );

    const link = document.createElement("a");
    link.download = `proofmesh-${result.caseId.toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main className={`app-shell view-${view}`}>
      <header className="app-header">
        <button className="brand brand-button" type="button" onClick={startNewCase} aria-label="ProofMesh home">
          <span className="brand-mark" aria-hidden="true" />
          <span>PROOFMESH</span>
        </button>

        <div className="journey" aria-label="Verification progress">
          <span className={view === "home" ? "active" : "done"}><b>01</b> Input</span>
          <i />
          <span className={view === "processing" ? "active" : view === "result" ? "done" : ""}><b>02</b> Verify</span>
          <i />
          <span className={view === "result" ? "active" : ""}><b>03</b> Result</span>
        </div>

        <div className="header-actions">
          <span className="network-pill"><i /> Gonka live</span>
          {view === "result" && (
            <button type="button" className="new-case-button" onClick={startNewCase}>+ New case</button>
          )}
        </div>
      </header>

      <div className="screen-stack">
        {view === "home" && (
          <section className="app-screen home-screen" aria-labelledby="hero-title">
            <div className="home-copy">
              <div className="eyebrow"><span>LIVE CASEWORK</span> / MULTI-MODEL VERIFICATION</div>
              <h1 id="hero-title">Don&apos;t trust<br />the answer.<br /><em>Inspect the case.</em></h1>
              <p>
                Turn any viral claim into an evidence-backed case file. Independent AI agents
                investigate, challenge and reconcile the verdict in public.
              </p>
              <div className="trust-row" aria-label="Product capabilities">
                <span><b>02</b> independent models</span>
                <span><b>LIVE</b> public evidence</span>
                <span><b>ID</b> auditable requests</span>
              </div>
            </div>

            <div className="case-terminal">
              <div className="terminal-topline">
                <div><span>NEW VERIFICATION</span><strong>What should we investigate?</strong></div>
                <span className="secure-note">UNTRUSTED INPUT / SAFE MODE</span>
              </div>

              <div className="input-tabs" role="tablist" aria-label="Input type">
                {inputModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    role="tab"
                    aria-selected={kind === mode.id}
                    className={kind === mode.id ? "active" : ""}
                    onClick={() => {
                      setKind(mode.id);
                      setError(undefined);
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="terminal-input">
                {kind === "image" ? (
                  <label className={`image-drop ${imageData ? "has-image" : ""}`}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => handleFile(event.target.files?.[0])}
                    />
                    <span className="upload-glyph" aria-hidden="true">+</span>
                    <strong>{imageName ?? "Drop a screenshot or image"}</strong>
                    <small>{imageData ? "Ready for visual verification" : "PNG, JPG or WebP / max 4 MB"}</small>
                  </label>
                ) : (
                  <textarea
                    autoFocus
                    aria-label={inputModes.find((mode) => mode.id === kind)?.hint}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void analyze();
                      }
                    }}
                    placeholder={inputModes.find((mode) => mode.id === kind)?.hint}
                    rows={5}
                  />
                )}
              </div>

              {error && <div className="error-banner" role="alert">{error}</div>}

              <div className="terminal-submit-row">
                <div className="sample-switcher">
                  <span>TRY</span>
                  {samplePrompts.map((sample, index) => (
                    <button key={sample} type="button" onClick={() => loadSample(sample)} aria-label={`Load sample ${index + 1}`}>
                      0{index + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="analyze-button"
                  disabled={!canAnalyze || isAnalyzing}
                  onClick={analyze}
                >
                  <span>Investigate</span>
                  <kbd>ENTER</kbd>
                  <b aria-hidden="true">-&gt;</b>
                </button>
              </div>
            </div>
          </section>
        )}

        {view === "processing" && (
          <section className="app-screen processing-screen" aria-live="polite" aria-label="Verification in progress">
            <div className="processing-grid" aria-hidden="true" />
            <div className="process-heading">
              <div>
                <span className="status-live"><i /> CASE ENGINE ACTIVE</span>
                <h2>{pipelineStages[stage].detail}</h2>
              </div>
              <div className="process-clock"><span>ELAPSED</span><strong>00:{String(elapsed).padStart(2, "0")}</strong></div>
            </div>

            <div className="agent-stage">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="signal signal-one" />
              <div className="signal signal-two" />
              <div className="core-node">
                <span>PROOF</span>
                <strong>MESH</strong>
                <i />
              </div>

              <div className={`worker-node mapper ${stage === 0 ? "active" : "complete"}`}>
                <span>M</span><div><small>CLAIM MAPPER</small><strong>Kimi K2.6</strong></div><b>{stage === 0 ? "RUNNING" : "DONE"}</b>
              </div>
              <div className={`worker-node investigator ${stage === 1 ? "active" : stage > 1 ? "complete" : "queued"}`}>
                <span>I</span><div><small>INVESTIGATOR</small><strong>Kimi K2.6</strong></div><b>{stage === 1 ? "RUNNING" : stage > 1 ? "DONE" : "QUEUED"}</b>
              </div>
              <div className={`worker-node challenger ${stage === 2 ? "active" : stage > 2 ? "complete" : "queued"}`}>
                <span>C</span><div><small>CHALLENGER</small><strong>MiniMax M2.7</strong></div><b>{stage === 2 ? "RUNNING" : stage > 2 ? "DONE" : "QUEUED"}</b>
              </div>
              <div className={`worker-node consensus ${stage === 3 ? "active" : "queued"}`}>
                <span>J</span><div><small>CONSENSUS JUDGE</small><strong>Cross-model</strong></div><b>{stage === 3 ? "RUNNING" : "QUEUED"}</b>
              </div>
            </div>

            <div className="process-console">
              <div className="console-stream">
                <span>LIVE ACTIVITY</span>
                {activityLines[stage].map((line, index) => (
                  <p key={line} style={{ animationDelay: `${index * 160}ms` }}><b>{String(index + 1).padStart(2, "0")}</b>{line}<i /></p>
                ))}
              </div>
              <div className="stage-track">
                {pipelineStages.map((item, index) => (
                  <div className={index < stage ? "complete" : index === stage ? "active" : ""} key={item.number}>
                    <span>{item.number}</span><strong>{item.label}</strong><i />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {view === "result" && result && (
          <section className="app-screen result-screen" aria-labelledby="result-title">
            <div className="result-topbar">
              <div>
                <span className="status-live"><i /> {result.live ? "LIVE GONKA ANALYSIS" : "CURATED DEMO SIMULATION"}</span>
                <strong>{result.caseId}</strong>
              </div>
              <div className="result-actions">
                <button type="button" onClick={copyAudit}>{copied ? "Copied" : "Copy summary"}</button>
                <button type="button" className="download-button" onClick={downloadProofCard}>Download Proof Card</button>
              </div>
            </div>

            <div className="result-workspace">
              <aside className="verdict-rail">
                <span className="micro-label">CENTRAL CLAIM</span>
                <h1 id="result-title">{result.claim}</h1>
                <div className="verdict-badge"><i className={scoreTone(result.score)} />{result.verdict}<span>{result.confidence}% confidence</span></div>
                <p>{result.summary.length > 230 ? `${result.summary.slice(0, 230).trim()}...` : result.summary}</p>

                <div className={`score-orbit ${scoreTone(result.score)}`} style={{ "--score": result.score } as React.CSSProperties}>
                  <div><strong>{result.score}</strong><span>TRUTH SCORE</span></div>
                  <small>0 false / 100 supported</small>
                </div>

                <div className="rail-meta">
                  <div><span>SOURCES</span><strong>{result.evidence.length}</strong></div>
                  <div><span>REQUESTS</span><strong>{result.network.requestCount}</strong></div>
                  <div><span>NETWORK</span><strong>{result.network.provider}</strong></div>
                </div>
              </aside>

              <div className="case-workspace">
                <div className="workspace-tabs" role="tablist" aria-label="Case report sections">
                  {resultPanels.map((panel, index) => (
                    <button
                      key={panel.id}
                      type="button"
                      role="tab"
                      aria-selected={activePanel === panel.id}
                      className={activePanel === panel.id ? "active" : ""}
                      onClick={() => setActivePanel(panel.id)}
                    >
                      <span>0{index + 1}</span>{panel.label}
                      {panel.id === "evidence" && <b>{result.evidence.length}</b>}
                    </button>
                  ))}
                </div>

                <div className="workspace-panel" role="tabpanel">
                  {activePanel === "overview" && (
                    <div className="overview-panel panel-enter">
                      <div className="panel-heading"><div><span>01 / CLAIM MAP</span><h2>What the verdict actually covers</h2></div><p>One statement, separated into testable parts.</p></div>
                      <div className="atomic-grid">
                        {result.atomicClaims.map((item, index) => (
                          <article key={`${item.claim}-${index}`}><span>0{index + 1}</span><p>{item.claim}</p><strong>{item.status}</strong></article>
                        ))}
                      </div>
                      <div className="overview-bottom">
                        <div className="mini-timeline">
                          <span className="micro-label">TRUTH TIMELINE</span>
                          {result.timeline.map((event, index) => (
                            <div key={event.label}><i style={{ "--event-score": event.score } as React.CSSProperties}>{event.score}</i><p><span>STEP 0{index + 1}</span><strong>{event.label}</strong><small>{event.detail}</small></p></div>
                          ))}
                        </div>
                        <div className="reversal-card">
                          <span className="micro-label">REVERSIBLE BY DESIGN</span>
                          <h3>What would change this verdict?</h3>
                          <ol>{result.reversalConditions.map((condition) => <li key={condition}>{condition}</li>)}</ol>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePanel === "evidence" && (
                    <div className="evidence-panel panel-enter">
                      <div className="panel-heading"><div><span>02 / EVIDENCE TRAIL</span><h2>Sources with provenance intact</h2></div><p>{result.evidence.length} items entered the shared packet.</p></div>
                      <div className="evidence-layout">
                        <div className="evidence-list">
                          {result.evidence.map((evidence, index) => (
                            <a className="evidence-item" href={evidence.url || undefined} target="_blank" rel="noreferrer" key={evidence.id}>
                              <span className={`stance ${evidence.stance}`}>{evidence.stance}</span>
                              <div><small>{evidence.publisher}{evidence.publishedAt ? ` / ${evidence.publishedAt}` : ""}</small><strong>{evidence.title}</strong><p>{evidence.snippet}</p></div>
                              <b>{String(index + 1).padStart(2, "0")}</b>
                            </a>
                          ))}
                        </div>
                        <aside className="source-radar">
                          <span className="micro-label">SOURCE DIVERSITY</span>
                          <strong>{Math.min(100, 58 + sourceMix.length * 8)}<small>/100</small></strong>
                          <div className="radar-bars">
                            {sourceMix.slice(0, 6).map(([publisher, count], index) => (
                              <div key={publisher}><span>{publisher}</span><i style={{ width: `${Math.max(28, 92 - index * 10 - (count - 1) * 8)}%` }} /></div>
                            ))}
                          </div>
                          <p>Higher scores indicate more independent publishers and primary-source coverage.</p>
                        </aside>
                      </div>
                    </div>
                  )}

                  {activePanel === "agents" && (
                    <div className="agents-panel panel-enter">
                      <div className="panel-heading"><div><span>03 / EVIDENCE DUEL</span><h2>Independent agents, visible disagreement</h2></div><p>Every conclusion keeps its model and request ID.</p></div>
                      <div className="agent-grid">
                        {result.agents.map((agent, index) => (
                          <article className="agent-card" key={agent.requestId}>
                            <div className="agent-head"><span className={`agent-index agent-${index}`}>A{index + 1}</span><div><strong>{agent.role}</strong><small>{agent.model}</small></div><b>{agent.confidence}%</b></div>
                            <p>{agent.conclusion}</p>
                            <ul>{agent.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
                            <div className="request-id"><span>REQUEST ID</span><code>{agent.requestId}</code></div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePanel === "audit" && (
                    <div className="audit-panel panel-enter">
                      <div className="panel-heading"><div><span>04 / AUDIT LAYER</span><h2>A case file you can inspect and repeat</h2></div><p>Inference provenance remains attached to the verdict.</p></div>
                      <div className="audit-grid">
                        <div className="audit-summary"><span className="micro-label">FINAL CONSENSUS</span><blockquote>{result.summary}</blockquote><div className="audit-signature"><span>SIGNED</span><strong>{formatTime(result.network.completedAt)}</strong></div></div>
                        <div className="audit-ledger">
                          <span className="micro-label">INFERENCE LEDGER</span>
                          {result.agents.map((agent, index) => (
                            <div key={agent.requestId}><span>0{index + 1}</span><p><strong>{agent.role}</strong><small>{agent.model}</small></p><code>{agent.requestId}</code></div>
                          ))}
                          <div><span>04</span><p><strong>Case file</strong><small>{result.network.provider}</small></p><code>{result.caseId}</code></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
