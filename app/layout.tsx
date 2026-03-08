import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "UX Rival — Instant Competitive UX Analysis",
  description: "Structured teardowns of any product category in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
