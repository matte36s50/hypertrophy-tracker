"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconToday,
  IconProgress,
  IconHistory,
  IconLibrary,
  IconSki,
} from "@/components/icons";

// Phone-style bottom tab bar. Active tab = accent icon + label. Sits in normal
// flow at the bottom of the AppShell (not position: fixed, which drifts on iOS
// while scrolling) and respects the home indicator via safe-area padding.
const TABS = [
  { href: "/", label: "Today", icon: IconToday },
  { href: "/progression", label: "Progress", icon: IconProgress },
  { href: "/ski", label: "Ski", icon: IconSki },
  { href: "/history", label: "History", icon: IconHistory },
  { href: "/library", label: "Library", icon: IconLibrary },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="z-40 shrink-0 border-t border-border bg-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-[3px] pb-1.5 pt-2.5 text-[11px] font-bold transition-colors ${
                  active ? "text-accent-text" : "text-text-3"
                }`}
              >
                <Icon s={24} active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
