import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { useDensity } from "../../hooks/useDensity";

export interface SelectionCardProps {
  title: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  badge?: string;
  /** Platform kartları için üstte accent ikon */
  iconPlacement?: "top" | "leading-box";
  descriptionSize?: "xs" | "2xs";
  className?: string;
}

const selectedClass =
  "border-vb-accent bg-vb-accent/10 ring-1 ring-vb-accent";
const unselectedClass =
  "border-zinc-200 bg-white hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900 dark:hover:border-zinc-600";

export const SelectionCard = memo(function SelectionCard({
  title,
  description,
  isSelected,
  onClick,
  icon: Icon,
  badge,
  iconPlacement = "top",
  descriptionSize = "xs",
  className = "",
}: SelectionCardProps) {
  const { cardPadding } = useDensity();
  const descriptionClass =
    descriptionSize === "2xs"
      ? "mt-0.5 block text-[11px] leading-tight text-zinc-500 dark:text-zinc-400"
      : "mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border text-left transition-all ${cardPadding} ${
        isSelected ? selectedClass : unselectedClass
      } ${className}`}
    >
      {Icon && iconPlacement === "top" && (
        <Icon className="mb-2 h-4 w-4 text-vb-accent" />
      )}

      {Icon && iconPlacement === "leading-box" && (
        <div className="flex items-start gap-2.5">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              isSelected
                ? "bg-vb-accent text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <CardContent
            title={title}
            description={description}
            badge={badge}
            descriptionClass={descriptionClass}
          />
        </div>
      )}

      {(!Icon || iconPlacement === "top") && (
        <CardContent
          title={title}
          description={description}
          badge={badge}
          descriptionClass={descriptionClass}
        />
      )}
    </button>
  );
});

function CardContent({
  title,
  description,
  badge,
  descriptionClass,
}: {
  title: string;
  description?: string;
  badge?: string;
  descriptionClass: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        {badge && (
          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
            {badge}
          </span>
        )}
      </div>
      {description && <span className={descriptionClass}>{description}</span>}
    </div>
  );
}
