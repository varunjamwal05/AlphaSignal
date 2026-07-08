// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "HiddenEdge – AI Investment Research Agent",
  description: "Production-grade AI agent that researches publicly listed companies using LangGraph, real financial data, and Gemini to deliver transparent investment recommendations.",
  keywords: ["AI investing", "investment research", "LangGraph", "financial analysis", "stock analysis"],
  openGraph: {
    title: "HiddenEdge – AI Investment Research Agent",
    description: "AI-powered investment research for every stock. Real data. Transparent reasoning.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 80px)" }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
