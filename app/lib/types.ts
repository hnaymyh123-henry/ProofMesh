export type InputKind = "url" | "x" | "text" | "image";

export type EvidenceStance = "supports" | "challenges" | "context";

export interface EvidenceItem {
  id: string;
  title: string;
  publisher: string;
  url: string;
  snippet: string;
  stance: EvidenceStance;
  credibility: number;
  publishedAt?: string;
}

export interface AgentAnalysis {
  role: "Investigator" | "Challenger" | "Consensus";
  model: string;
  requestId: string;
  conclusion: string;
  confidence: number;
  keyPoints: string[];
  latencyMs: number;
}

export interface TimelineEvent {
  label: string;
  detail: string;
  score: number;
}

export interface AnalysisResult {
  caseId: string;
  claim: string;
  verdict: "Supported" | "Likely supported" | "Disputed" | "Misleading" | "Likely false" | "False";
  score: number;
  confidence: number;
  summary: string;
  atomicClaims: Array<{ claim: string; status: string }>;
  evidence: EvidenceItem[];
  agents: AgentAnalysis[];
  timeline: TimelineEvent[];
  reversalConditions: string[];
  network: {
    provider: string;
    requestCount: number;
    completedAt: string;
  };
  live: boolean;
}

export interface AnalysisRequest {
  kind: InputKind;
  content: string;
  imageData?: string;
}
