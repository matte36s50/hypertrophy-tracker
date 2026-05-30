"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Phone-style bottom tab bar. Big tap targets, fixed to the bottom, and it
// respects the iPhone home indicator via safe-area padding.
const TABS = [
  { href: "/", label: "Today", icon: TodayIcon },
  { href: "/progression", label: "Progress", icon: ProgressIcon },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/library", label: "Library", icon: LibraryIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur"
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
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TodayIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" />
      {active && <circle cx="12" cy="15" r="2.5" fill="currentColor" />}
    </svg>
  );
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14l5-5 4 4 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 6h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {active && <circle cx="20" cy="6" r="2" fill="currentColor" />}
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4v16M6 6l4-1v15l-4 1M18 4v16M18 6l-4-1v15l4 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
