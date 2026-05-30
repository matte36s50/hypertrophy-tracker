import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DataProvider } from "@/components/DataProvider";
import { BottomNav } from "@/components/BottomNav";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "Hypertrophy Tracker",
  description:
    "Track your weekly volume, log sets, and know exactly when to add weight.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lift",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans antialiased">
        <DataProvider>
          {/* Main scroll area. Bottom padding leaves room for the nav bar. */}
          <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4">
            {children}
          </main>
          <BottomNav />
        </DataProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
