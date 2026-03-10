import type { Metadata } from "next";
import { Suspense } from "react";
import { structuredData } from "./structured-data";

export const metadata: Metadata = {
  title: "UX Rival — Instant AI Competitive UX Analysis",
  description: "Get instant AI-powered UX teardowns, competitor scoring, heatmaps and weekly monitoring for any product category. Free. No signup required.",
  keywords: ["UX analysis", "competitive UX", "UX Rival", "competitor analysis", "UX scoring", "product design", "UX heatmap", "UX monitoring"],
  authors: [{ name: "UX Rival" }],
  creator: "UX Rival",
  publisher: "UX Rival",
  metadataBase: new URL("https://uxrival.xyz"),
  alternates: { canonical: "https://uxrival.xyz" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" }
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "UX Rival — Instant AI Competitive UX Analysis",
    description: "Instant structured teardowns, UX scoring, heatmaps and weekly monitoring for any product category. Built for designers and agencies who move fast.",
    url: "https://uxrival.xyz",
    siteName: "UX Rival",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "UX Rival — AI Competitive UX Analysis" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "UX Rival — Instant AI Competitive UX Analysis",
    description: "Get instant AI-powered UX teardowns and competitor scoring for any product category. Free.",
    images: ["/og-image.svg"],
    creator: "@uxrival"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
