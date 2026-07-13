import type { AnalysisResult } from "./types";

export const SAMPLE_CLAIM =
  "The Great Wall of China is visible from the Moon with the naked eye.";

export const demoCase: AnalysisResult = {
  caseId: "PM-7F3A-2026",
  claim: SAMPLE_CLAIM,
  verdict: "False",
  score: 6,
  confidence: 96,
  summary:
    "Astronaut observations and optical-scale comparisons consistently show that the Great Wall is not visible from the Moon with the naked eye. Under favorable conditions, small sections may be photographed from low Earth orbit, which is the likely source of the myth.",
  atomicClaims: [
    { claim: "The observation point is the Moon, not low Earth orbit.", status: "Resolved" },
    { claim: "The Wall can be distinguished without optical aid.", status: "Contradicted" },
    { claim: "Human observers have verified the sighting.", status: "No supporting record" },
  ],
  evidence: [
    {
      id: "ev-1",
      title: "China's Wall Less Great in View from Space",
      publisher: "NASA Earth Observatory",
      url: "https://earthobservatory.nasa.gov/images/5370/chinas-wall-less-great-in-view-from-space",
      snippet:
        "NASA explains that the wall is generally difficult or impossible to see from orbit without magnification and is not visible from the Moon.",
      stance: "challenges",
      credibility: 98,
      publishedAt: "2005",
    },
    {
      id: "ev-2",
      title: "Can you see the Great Wall from space?",
      publisher: "Encyclopaedia Britannica",
      url: "https://www.britannica.com/question/Can-you-see-the-Great-Wall-of-China-from-space",
      snippet:
        "The structure's narrow width and earth-toned materials make it hard to distinguish even from low orbit.",
      stance: "context",
      credibility: 94,
      publishedAt: "Reference",
    },
    {
      id: "ev-3",
      title: "The Great Wall from low Earth orbit",
      publisher: "European Space Agency",
      url: "https://www.esa.int/ESA_Multimedia/Images/2003/06/The_Great_Wall_of_China",
      snippet:
        "Orbital photography can capture parts of the structure under specific conditions, but this does not support naked-eye visibility from the Moon.",
      stance: "context",
      credibility: 97,
      publishedAt: "2003",
    },
    {
      id: "ev-4",
      title: "Why the Moon claim persists",
      publisher: "Scientific American",
      url: "https://www.scientificamerican.com/article/is-chinas-great-wall-visible-from-space/",
      snippet:
        "The apparent size of the wall at lunar distance is far below normal human visual resolution.",
      stance: "challenges",
      credibility: 92,
      publishedAt: "2008",
    },
  ],
  agents: [
    {
      role: "Investigator",
      model: "Kimi-K2.6",
      requestId: "demo_msg_kimi_7f3a",
      conclusion:
        "The strongest charitable interpretation confuses photographs taken from low Earth orbit with naked-eye observation from the Moon.",
      confidence: 94,
      keyPoints: [
        "Located the low-orbit versus lunar-distance ambiguity",
        "Found no astronaut testimony supporting lunar visibility",
        "Matched the claim against official space-agency explanations",
      ],
      latencyMs: 1280,
    },
    {
      role: "Challenger",
      model: "MiniMax-M2.7",
      requestId: "demo_msg_minimax_91c2",
      conclusion:
        "Even under ideal contrast assumptions, the wall's angular width at lunar distance is below naked-eye resolution.",
      confidence: 98,
      keyPoints: [
        "Tested the claim against human visual acuity",
        "Separated assisted photography from unaided vision",
        "Identified repetition of the myth without primary evidence",
      ],
      latencyMs: 1436,
    },
    {
      role: "Consensus",
      model: "Gonka cross-model consensus",
      requestId: "demo_consensus_c41d",
      conclusion:
        "Both model paths converge: the literal claim is false, while a weaker low-orbit photography claim can be true in limited conditions.",
      confidence: 96,
      keyPoints: [
        "Independent conclusions agree",
        "Primary sources outweigh repeated secondary claims",
        "Residual uncertainty does not affect the verdict",
      ],
      latencyMs: 786,
    },
  ],
  timeline: [
    { label: "Claim mapped", detail: "Three atomic claims isolated", score: 42 },
    { label: "Primary evidence", detail: "NASA account contradicts lunar visibility", score: 18 },
    { label: "Cross-model review", detail: "Independent visual-scale analysis agrees", score: 6 },
  ],
  reversalConditions: [
    "A verifiable primary record of unaided human observation from the lunar surface",
    "A reproducible optical analysis showing the wall exceeds naked-eye angular resolution at lunar distance",
    "New space-agency evidence that clearly distinguishes the Wall from surrounding terrain without magnification",
  ],
  network: {
    provider: "GonkaRouter",
    requestCount: 3,
    completedAt: "2026-07-13T15:00:00.000Z",
  },
  live: false,
};
