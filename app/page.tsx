import type { Metadata } from "next";
import { TruthWorkspace } from "./TruthWorkspace";

export const metadata: Metadata = {
  title: "ProofMesh — Auditable truth for the open web",
  description:
    "Turn a viral claim into an evidence-backed, multi-model case file powered by GonkaRouter.",
};

export default function Home() {
  return <TruthWorkspace />;
}
