import { InfoTooltip } from "./InfoTooltip";

export function TitleWithTooltip({
  title,
  tooltip,
}: {
  title: string;
  tooltip: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {title}
      <InfoTooltip content={tooltip} label={title} />
    </span>
  );
}
