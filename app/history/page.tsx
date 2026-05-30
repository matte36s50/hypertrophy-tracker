"use client";

import { Card, PageHeader } from "@/components/ui";

export default function HistoryPage() {
  return (
    <div>
      <PageHeader
        title="History & Progress"
        subtitle="Charts of weight and total volume per exercise over time."
      />

      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <ChartIcon />
        <h2 className="text-lg font-semibold">Charts coming in Phase 3</h2>
        <p className="max-w-xs text-sm text-muted">
          Once you log a few sessions, this screen will plot your weight and
          total volume per exercise so you can see progress at a glance.
        </p>
      </Card>
    </div>
  );
}

function ChartIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      className="text-accent"
      aria-hidden
    >
      <path
        d="M4 20V10M10 20V4M16 20v-7M22 20H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
