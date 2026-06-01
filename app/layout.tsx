import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://s-tags.yeeboodigital.com";

export const metadata: Metadata = {
  title: "S-Tag Builder — Yeeboo Digital",
  description:
    "Free tool for Blackbaud Luminate Online users. Generate S-tag personalization and conditional logic code for email in plain English.",
  openGraph: {
    title: "S-Tag Builder — Yeeboo Digital",
    description: "Generate Luminate Online S-tag code in plain English.",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
