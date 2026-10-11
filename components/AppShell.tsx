"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { RestTimerBar } from "@/components/RestTimerBar";

// Fixed-height app shell: the content area is the only scroller and the bottom
// nav sits in normal flow beneath it. Nothing is `position: fixed` against the
// scrolling page, so iOS Safari's toolbar resizing, rubber-band overscroll and
// momentum scrolling can't make the nav drift or "float" mid-page.
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scroller = useRef<HTMLElement>(null);

  // The router resets window scroll on navigation, but our scroller is an
  // element — reset it ourselves so each tab opens at the top.
  useEffect(() => {
    scroller.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <main
          ref={scroller}
          className="h-full overflow-y-auto overscroll-y-contain"
        >
          <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6">
            {children}
          </div>
        </main>
        <RestTimerBar />
      </div>
      <BottomNav />
    </div>
  );
}
