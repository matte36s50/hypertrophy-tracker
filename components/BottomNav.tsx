"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconToday,
  IconProgress,
  IconHistory,
  IconLibrary,
} from "@/components/icons";

// Phone-style bottom tab bar. Active tab = accent icon + label. Fixed to the
// bottom, frosted, and respects the iPhone home indicator via safe-area padding.
const TABS = [
  { href: "/", label: "Today", icon: IconToday },
  { href: "/progression", label: "Progress", icon: IconProgress },
  { href: "/history", label: "History", icon: IconHistory },
  { href: "/library", label: "Library", icon: IconLibrary },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-xl"
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
