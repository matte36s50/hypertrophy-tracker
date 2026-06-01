// Line icons (stroke = currentColor, ~2px). Ported from the design handoff's
// icons.jsx. Sized via the `s` prop; colour follows the surrounding text.
interface IconProps {
  s?: number;
  className?: string;
}

function Ic({
  s = 22,
  sw = 2,
  fill,
  d,
  children,
  className,
}: IconProps & {
  sw?: number;
  fill?: string;
  d?: string;
  children?: React.ReactNode;
}) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill={fill ?? "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}

export const IconToday = ({ s, active }: IconProps & { active?: boolean }) => (
  <Ic s={s}>
    <rect x="3" y="4.5" width="18" height="16.5" rx="3.5" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    {active && <circle cx="12" cy="15" r="2.4" fill="currentColor" stroke="none" />}
  </Ic>
);
export const IconProgress = ({ s }: IconProps) => (
  <Ic s={s} d="M4 14l5-5 4 4 7-7M16 6h4v4" />
);
export const IconHistory = ({ s }: IconProps) => (
  <Ic s={s} d="M4 20V11M10 20V4M16 20v-6M22 20H2" />
);
export const IconLibrary = ({ s }: IconProps) => (
  <Ic s={s} d="M6 4v16M6 6l4-1v15l-4 1M18 4v16M18 6l-4-1v15l4 1" />
);

export const IconChevron = ({ s }: IconProps) => <Ic s={s} d="M9 6l6 6-6 6" />;
export const IconChevDown = ({ s }: IconProps) => <Ic s={s} d="M6 9l6 6 6-6" />;
export const IconPlus = ({ s }: IconProps) => <Ic s={s} d="M12 5v14M5 12h14" />;
export const IconArrowUp = ({ s }: IconProps) => (
  <Ic s={s} d="M12 19V5M6 11l6-6 6 6" />
);
export const IconSwap = ({ s }: IconProps) => (
  <Ic s={s} d="M7 4l-3 3 3 3M4 7h13M17 20l3-3-3-3M20 17H7" />
);
export const IconEdit = ({ s }: IconProps) => (
  <Ic s={s} d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
);
export const IconCheck = ({ s }: IconProps) => <Ic s={s} d="M4 12l5 5L20 6" />;
export const IconTrash = ({ s }: IconProps) => (
  <Ic s={s} d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
);
export const IconFlame = ({ s }: IconProps) => (
  <Ic s={s} fill="currentColor">
    <path d="M12 2c1 3-1 4-1 6 0 1 .8 2 2 2 .5-1 .6-1.6.6-2.5C16 10 17 12.5 17 15a5 5 0 1 1-10 0c0-2.6 1.6-4.4 3-6 1-1.2 2-3.2 2-7z" />
  </Ic>
);
