import type { Metadata } from "next";
import "./globals.css";

import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import SmoothScroll from "@/components/SmoothScroll";
import ClientProviders from "@/components/ClientProviders";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const generalSans = localFont({
  src: [
    {
      path: "./fonts/GeneralSans-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-SemiboldItalic.otf",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Tonal Zone | Audiophile Gear Marketplace",
  description: "Marketplace for Audiophile Gear",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${generalSans.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ClientProviders>
          <SmoothScroll>{children}</SmoothScroll>
        </ClientProviders>
      </body>
    </html>
  );
}
