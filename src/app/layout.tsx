import type { Metadata } from "next";
import "./globals.css";

import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import SmoothScroll from "@/components/SmoothScroll";
import ClientProviders from "@/components/ClientProviders";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
});

const generalSans = localFont({
  src: [
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
      path: "./fonts/GeneralSans-Medium.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Medium.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Medium.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/GeneralSans-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/GeneralSans-MediumItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "./fonts/GeneralSans-MediumItalic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-sans",
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
