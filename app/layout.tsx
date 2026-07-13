import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "ProofMesh — Auditable truth for the open web",
    description:
      "Evidence-backed, multi-model verification powered by the Gonka decentralized inference network.",
    icons: { icon: `${origin}/og.png`, shortcut: `${origin}/og.png` },
    openGraph: {
      title: "ProofMesh — Inspect the case, not just the answer",
      description: "Turn any viral claim into an auditable, multi-model case file.",
      type: "website",
      images: [{ url: `${origin}/og.png`, alt: "ProofMesh — Don't trust the answer. Inspect the case." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "ProofMesh — Inspect the case, not just the answer",
      description: "Turn any viral claim into an auditable, multi-model case file.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
