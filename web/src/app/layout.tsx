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
    default: "Vidita Cafe | Augmenting your coffee journey",
    template: "%s | Vidita Cafe"
  },
  description: "Vidita Cafe is your personal coffee journal and brewing companion. Track your sensory experiences, manage equipment, and master brewing methods like V60, Chemex, and Espresso.",
  keywords: ["coffee", "brewing", "journal", "v60", "espresso", "chemex", "coffee tracking", "sensory journal"],
  manifest: "/manifest.json",
  authors: [{ name: "Vidita Cafe Team" }],
  creator: "Vidita Cafe",
  publisher: "Vidita Cafe",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://viditacafe.com",
    siteName: "Vidita Cafe",
    title: "Vidita Cafe | Augmenting your coffee journey",
    description: "Track your sensory coffee experiences and master your brewing gear with Vidita Cafe.",
    images: [
      {
        url: "/static/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vidita Cafe - Coffee Journaling & Brewing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidita Cafe | Augmenting your coffee journey",
    description: "Track your sensory coffee experiences and master your brewing gear with Vidita Cafe.",
    images: ["/static/images/og-image.png"],
    creator: "@viditacafe",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vidita Cafe",
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
