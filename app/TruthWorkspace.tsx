"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_CLAIM } from "./lib/demo-case";
import type { AnalysisResult, InputKind } from "./lib/types";

const inputModes: Array<{ id: InputKind; label: string; hint: string }> = [
  { id: "url", label: "Article", hint: "Paste a news or blog URL" },
  { id: "x", label: "X post", hint: "Paste an X post URL" },
  { id: "text", label: "Claim", hint: "Paste or type a factual claim" },
  { id: "image", label: "Image", hint: "Upload an image to inspect" },
];

const pipelineStages = [
  ["01", "Mapping atomic claims"],
  ["02", "Collecting live evidence"],
  ["03", "Running the evidence duel"],
  ["04", "Calibrating consensus"],
];

const samplePrompts = [
  "The Great Wall of China is visible from the Moon with the naked eye.",
  "A viral post says the EU will ban all cash payments in 2027.",
  "This screenshot proves the quoted public figure wrote the post.",
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
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[. ]+$/, "")}…`;
  }
  return lines;
}

export function TruthWorkspace() {
  const [kind, setKind] = useState<InputKind>("text");
  const [content, setContent] = useState(SAMPLE_CLAIM);
  const [imageData, setImageData] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(
      () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      180,
    );
    return () => window.clearTimeout(timer);
  }, [result]);

  async function analyze() {
    if (!canAnalyze || isAnalyzing) return;
    setError(undefined);
    setResult(null);
    setIsAnalyzing(true);
    setStage(0);

    const stageTimer = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, pipelineStages.length - 1));
    }, 900);

    try {
      const [response] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, content, imageData }),
        }),
        new Promise((resolve) => window.setTimeout(resolve, 3600)),
      ]);
      const payload = (await response.json()) as AnalysisResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "The analysis could not be completed.");
      setStage(pipelineStages.length - 1);
      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The analysis could not be completed.");
    } finally {
      window.clearInterval(stageTimer);
      setIsAnalyzing(false);
    }
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
    const text = `ProofMesh case ${result.caseId}\n${result.claim}\nVerdict: ${result.verdict} · Truth Score ${result.score}/100\n${result.summary}\nAudit: ${result.agents
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
    const claimLines = wrapText(context, result.claim, 1020, 4);
    claimLines.forEach((line, index) => context.fillText(line, 76, 310 + index * 66));

    context.beginPath();
    context.arc(1320, 304, 150, 0, Math.PI * 2);
    context.fillStyle = result.score >= 40 ? "#ffb45e" : "#ff6c62";
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
    const summaryLines = wrapText(context, result.summary, 1320, 3);
    summaryLines.forEach((line, index) => context.fillText(line, 112, 690 + index * 36));

    context.font = "500 19px Arial";
    context.fillStyle = "#7f877f";
    context.fillText(
      `${result.caseId}  ·  ${result.evidence.length} sources  ·  ${result.network.provider}  ·  ${formatTime(result.network.completedAt)}`,
      76,
      838,
    );

    const link = document.createElement("a");
    link.download = `proofmesh-${result.caseId.toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ProofMesh home">
          <span className="brand-mark" aria-hidden="true" />
          <span>PROOFMESH</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">Method</a>
          <a href="#audit">Audit layer</a>
          <span className="network-pill"><i /> Gonka network</span>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span>LIVE CASEWORK</span> / MULTI-MODEL VERIFICATION</div>
        <h1>Don&apos;t trust the answer.<br /><em>Inspect the case.</em></h1>
        <p className="hero-copy">
          Turn any viral claim into an evidence-backed case file. Two decentralized AI models
          investigate opposing sides, then publish a verdict you can audit and share.
        </p>

        <div className="case-composer">
          <div className="composer-head">
            <div>
              <span className="micro-label">NEW VERIFICATION</span>
              <h2>What should we investigate?</h2>
            </div>
            <span className="private-note">No claim is treated as an instruction</span>
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
                  setResult(null);
                  setError(undefined);
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="composer-field">
            {kind === "image" ? (
              <label className={`image-drop ${imageData ? "has-image" : ""}`}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
                <span className="upload-glyph" aria-hidden="true">＋</span>
                <strong>{imageName ?? "Drop a screenshot or image"}</strong>
                <small>{imageData ? "Ready for visual verification" : "PNG, JPG or WebP · max 4 MB"}</small>
              </label>
            ) : (
              <textarea
                aria-label={inputModes.find((mode) => mode.id === kind)?.hint}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={inputModes.find((mode) => mode.id === kind)?.hint}
                rows={4}
              />
            )}

            <div className="composer-actions">
              <div className="analysis-spec">
                <span>2 models</span><span>Live evidence</span><span>Audit IDs</span>
              </div>
              <button
                type="button"
                className="analyze-button"
                disabled={!canAnalyze || isAnalyzing}
                onClick={analyze}
              >
                {isAnalyzing ? "Building case…" : "Investigate claim"}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>

          {error && <div className="error-banner" role="alert">{error}</div>}

          <div className="sample-row">
            <span>TRY A CASE</span>
            {samplePrompts.map((sample, index) => (
              <button key={sample} type="button" onClick={() => loadSample(sample)}>
                0{index + 1} {sample.length > 48 ? `${sample.slice(0, 48)}…` : sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isAnalyzing && (
        <section className="analysis-loader" aria-live="polite">
          <div className="scan-line" />
          <div className="loader-title">
            <span>CASE ENGINE ACTIVE</span>
            <strong>{pipelineStages[stage][1]}</strong>
          </div>
          <div className="stage-grid">
            {pipelineStages.map(([number, label], index) => (
              <div className={index <= stage ? "stage active" : "stage"} key={number}>
                <span>{number}</span>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {result && (
        <div className="case-report" ref={resultRef} id="audit">
          <section className="verdict-panel">
            <div className="report-kicker">
              <span>{result.live ? "LIVE GONKA ANALYSIS" : "CURATED DEMO SIMULATION"}</span>
              <span>{result.caseId}</span>
            </div>
            <div className="verdict-layout">
              <div className="verdict-copy">
                <span className="micro-label">CENTRAL CLAIM</span>
                <h2>{result.claim}</h2>
                <div className="verdict-label">
                  <i className={scoreTone(result.score)} /> {result.verdict}
                  <span>{result.confidence}% confidence</span>
                </div>
                <p>{result.summary}</p>
                <div className="report-actions">
                  <button type="button" className="primary-action" onClick={downloadProofCard}>
                    Download Proof Card <span>↓</span>
                  </button>
                  <button type="button" className="secondary-action" onClick={copyAudit}>
                    {copied ? "Copied" : "Copy audit summary"}
                  </button>
                </div>
              </div>
              <div className={`score-orbit ${scoreTone(result.score)}`} style={{ "--score": result.score } as React.CSSProperties}>
                <div>
                  <strong>{result.score}</strong>
                  <span>TRUTH SCORE</span>
                </div>
                <small>0 false · 100 supported</small>
              </div>
            </div>
          </section>

          <section className="report-section" id="how-it-works">
            <div className="section-heading">
              <div><span className="section-number">01</span><h3>Claim map</h3></div>
              <p>One post, separated into testable statements.</p>
            </div>
            <div className="atomic-grid">
              {result.atomicClaims.map((item, index) => (
                <article key={`${item.claim}-${index}`}>
                  <span>0{index + 1}</span>
                  <p>{item.claim}</p>
                  <strong>{item.status}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="report-section dark-section">
            <div className="section-heading">
              <div><span className="section-number">02</span><h3>Evidence duel</h3></div>
              <p>Independent models challenge the same evidence packet.</p>
            </div>
            <div className="agent-grid">
              {result.agents.map((agent, index) => (
                <article className="agent-card" key={agent.requestId}>
                  <div className="agent-head">
                    <span className={`agent-index agent-${index}`}>A{index + 1}</span>
                    <div><strong>{agent.role}</strong><small>{agent.model}</small></div>
                    <b>{agent.confidence}%</b>
                  </div>
                  <p>{agent.conclusion}</p>
                  <ul>
                    {agent.keyPoints.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                  <div className="request-id"><span>REQUEST ID</span><code>{agent.requestId}</code></div>
                </article>
              ))}
            </div>
          </section>

          <section className="report-section">
            <div className="section-heading">
              <div><span className="section-number">03</span><h3>Evidence trail</h3></div>
              <p>{result.evidence.length} sources, with provenance kept visible.</p>
            </div>
            <div className="evidence-layout">
              <div className="evidence-list">
                {result.evidence.map((evidence, index) => (
                  <a
                    className="evidence-item"
                    href={evidence.url || undefined}
                    target="_blank"
                    rel="noreferrer"
                    key={evidence.id}
                  >
                    <span className={`stance ${evidence.stance}`}>{evidence.stance}</span>
                    <div>
                      <small>{evidence.publisher} {evidence.publishedAt ? `· ${evidence.publishedAt}` : ""}</small>
                      <strong>{evidence.title}</strong>
                      <p>{evidence.snippet}</p>
                    </div>
                    <b>0{index + 1}</b>
                  </a>
                ))}
              </div>
              <aside className="source-radar">
                <span className="micro-label">SOURCE DIVERSITY</span>
                <strong>{Math.min(100, 58 + sourceMix.length * 8)}<small>/100</small></strong>
                <div className="radar-bars">
                  {sourceMix.slice(0, 5).map(([publisher, count], index) => (
                    <div key={publisher}>
                      <span>{publisher}</span>
                      <i style={{ width: `${Math.max(28, 92 - index * 13 - (count - 1) * 8)}%` }} />
                    </div>
                  ))}
                </div>
                <p>Higher scores indicate more independent publishers and primary-source coverage.</p>
              </aside>
            </div>
          </section>

          <section className="report-section timeline-section">
            <div className="section-heading">
              <div><span className="section-number">04</span><h3>Truth timeline</h3></div>
              <p>The verdict changes as stronger evidence enters the case.</p>
            </div>
            <div className="timeline">
              {result.timeline.map((event, index) => (
                <div className="timeline-event" key={event.label}>
                  <div className="timeline-dot"><span>{event.score}</span></div>
                  <small>STEP 0{index + 1}</small>
                  <strong>{event.label}</strong>
                  <p>{event.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="reversal-section">
            <div>
              <span className="micro-label">REVERSIBLE BY DESIGN</span>
              <h3>What would change this verdict?</h3>
              <p>ProofMesh states its burden of proof, so disagreement has somewhere productive to go.</p>
            </div>
            <ol>
              {result.reversalConditions.map((condition) => <li key={condition}>{condition}</li>)}
            </ol>
          </section>

          <section className="audit-strip">
            <div><span>NETWORK</span><strong>{result.network.provider}</strong></div>
            <div><span>INFERENCE REQUESTS</span><strong>{result.network.requestCount}</strong></div>
            <div><span>COMPLETED</span><strong>{formatTime(result.network.completedAt)}</strong></div>
            <div><span>CASE ID</span><strong>{result.caseId}</strong></div>
          </section>
        </div>
      )}

      <footer>
        <div className="brand"><span className="brand-mark" aria-hidden="true" /><span>PROOFMESH</span></div>
        <p>Truth is a process. Make the process visible.</p>
        <span>Built on GonkaRouter · AI³ Growth Hackathon 2026</span>
      </footer>
    </main>
  );
}
