import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/NavigationBar";
import Bootstrap from "@/components/Bootstrap";
import ImpersonationBanner from "@/components/ImpersonationBanner";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#4B2C20",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Shishapp | Your personal shisha companion",
    template: "%s | Shishapp"
  },
  description: "Shishapp is your personal shisha journal and session companion. Track your sensory experiences, manage equipment, and master session methods.",
  keywords: ["shisha", "session", "journal", "hookah", "shisha tracking", "sensory journal"],
  manifest: "/manifest.json",
  authors: [{ name: "Shishapp Team" }],
  creator: "Shishapp",
  publisher: "Shishapp",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shishapp.com",
    siteName: "Shishapp",
    title: "Shishapp | Your personal shisha companion",
    description: "Track your sensory shisha experiences and master your shisha gear with Shishapp.",
    images: [
      {
        url: "/static/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shishapp - Shisha Journaling & Sessions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shishapp | Your personal shisha companion",
    description: "Track your sensory shisha experiences and master your shisha gear with Shishapp.",
    images: ["/static/images/og-image.png"],
    creator: "@shishapp",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shishapp",
  },
  other: {
    "google-site-verification": "TODO-if-needed",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100`}>
        <Bootstrap />
        <ImpersonationBanner />
        <main className="min-h-screen">
          {children}
        </main>
        <NavigationBar />
      </body>
    </html>
  );
}
