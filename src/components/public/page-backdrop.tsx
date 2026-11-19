import { cn } from "@/lib/cn";

/**
 * Decorative page background.
 *
 * Pure CSS gradients and an SVG topographic motif — no image requests, no layout shift,
 * and it degrades to a flat colour if CSS is unavailable. Everything here is decorative
 * and hidden from assistive technology.
 *
 * The motif is a contour-line pattern evoking a relief map, which suits a destination
 * discovery product better than a stock photograph and never competes with the content.
 */
export function PageBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 40rem at 15% -10%, rgba(14,165,233,0.18), transparent 60%)," +
            "radial-gradient(50rem 34rem at 90% 0%, rgba(234,88,12,0.14), transparent 55%)," +
            "linear-gradient(180deg, var(--color-background) 0%, var(--color-card) 60%, var(--color-background) 100%)",
        }}
      />
      <svg
        className="absolute inset-x-0 top-0 h-[420px] w-full opacity-[0.16]"
        viewBox="0 0 1200 420"
        preserveAspectRatio="none"
        fill="none"
      >
        <g stroke="var(--color-primary)" strokeWidth="1.5">
          <path d="M-20 300 C 180 220, 320 380, 520 300 S 860 180, 1060 280 S 1220 240, 1240 260" />
          <path d="M-20 340 C 200 260, 340 420, 540 340 S 880 220, 1080 320 S 1220 280, 1240 300" />
          <path d="M-20 380 C 220 300, 360 460, 560 380 S 900 260, 1100 360 S 1220 320, 1240 340" />
          <path d="M-20 260 C 160 180, 300 340, 500 260 S 840 140, 1040 240 S 1220 200, 1240 220" />
          <path d="M-20 220 C 140 140, 280 300, 480 220 S 820 100, 1020 200 S 1220 160, 1240 180" />
        </g>
        <g fill="var(--color-accent)">
          <circle cx="520" cy="300" r="3" />
          <circle cx="1060" cy="280" r="3" />
          <circle cx="240" cy="250" r="2.5" />
          <circle cx="820" cy="210" r="2.5" />
        </g>
      </svg>
    </div>
  );
}
