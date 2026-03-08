import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UX Rival — Instant Competitive UX Analysis",
  description: "Structured teardowns of any product category in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}