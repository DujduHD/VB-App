import { Info } from "lucide-react";
import { Tooltip } from "./Tooltip";

export function InfoTooltip({
  content,
  label,
  side = "top",
}: {
  content: string;
  label?: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Tooltip content={content} side={side} delay={300}>
      <button
        type="button"
        aria-label={label ?? content}
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-vb-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-vb-accent/40 dark:text-zinc-500 dark:hover:text-vb-accent"
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
    </Tooltip>
  );
}
