import type { Metadata } from "next";
import { PageShell } from "@/components/layout/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "letxNepal — discover the hidden places of Nepal",
    template: "%s | letxNepal",
  },
  description:
    "A national tourism platform for Nepal. Find iconic destinations and hidden, remote places, check access and permits, and plan a trip that supports local communities.",
  keywords: [
    "Nepal tourism",
    "hidden destinations Nepal",
    "remote Nepal trek",
    "Nepal travel guide",
    "Nepal provinces",
  ],
  openGraph: {
    type: "website",
    siteName: "letxNepal",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-sm focus:top-sm focus:z-50 focus:rounded-md focus:bg-primary focus:px-md focus:py-sm focus:text-on-primary"
        >
          Skip to content
        </a>
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
