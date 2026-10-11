import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/components/DataProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { RestTimerProvider } from "@/components/RestTimerProvider";
import { AppShell } from "@/components/AppShell";

// Ship font: Hanken Grotesk (weights 400–800), exposed as --font-sans.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

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
    statusBarStyle: "default",
    title: "Lift",
  },
};

export const viewport: Viewport = {
  themeColor: "#eef1ee",
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
    <html lang="en" className={hanken.variable}>
      <body className="overflow-hidden bg-bg font-sans text-text antialiased">
        <DataProvider>
          <RestTimerProvider>
            <AppShell>{children}</AppShell>
          </RestTimerProvider>
        </DataProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
