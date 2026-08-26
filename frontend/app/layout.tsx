import type { Metadata } from "next";
import { Black_Ops_One, Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthSync } from "./auth-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const blackOpsOne = Black_Ops_One({
  variable: "--font-black-ops-one",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resumio",
  description: "get your dream job",
};

import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${playfair.variable} ${blackOpsOne.variable}`}><AuthSync />{children}</body>
      </html>
    </ClerkProvider>
  )
}