import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "PolarSphere 360 — Polar Knowledge Hub",
  description:
    "Semantic search, grounded AI answers with citations, and an outreach workflow for NCPOR polar expedition data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6">{children}</main>
        <footer className="border-t border-white/10 py-8 text-center text-xs text-ice-300/60">
          PolarSphere 360 · SIH 2026 · PS 26063 · Backend: FastAPI + pgvector + Qwen2.5-1.5B (local)
        </footer>
      </body>
    </html>
  );
}
