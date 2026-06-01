"use client";

import { useEffect } from "react";

// Shared bottom-sheet shell. Scrim tap closes; the panel slides up. Used by the
// set-log, swap and add-exercise sheets.
export function Sheet({
  title,
  children,
  onClose,
}: {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  // Close on Escape (handy for desktop testing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(20,30,25,0.35)" }}
      onClick={onClose}
    >
      <div
        className="max-h-[86%] w-full max-w-md animate-sheetUp overflow-y-auto rounded-t-[26px] border-t border-border bg-surface px-[18px] pt-2.5 shadow-sheet"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab handle */}
        <div className="mx-auto mb-3.5 mt-0.5 h-[5px] w-[38px] rounded-full bg-border-strong" />
        {title && (
          <h3 className="mb-3.5 text-[19px] font-extrabold text-text">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}

// Primary / ghost / danger button used inside sheets.
export function SheetButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
}) {
  const variants = {
    primary: "bg-accent text-accent-contrast border-accent",
    ghost: "bg-surface-2 text-text border-border",
    danger: "bg-bad/10 text-bad-text border-transparent",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[50px] w-full items-center justify-center gap-2 rounded-btn border text-base font-bold transition-transform active:scale-[0.99] ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
