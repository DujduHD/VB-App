import type { ComponentType } from "react";
import {
  Code2,
  Container,
  Palette,
  Music,
  Cloud,
  Globe,
} from "lucide-react";
import type { TimeCapsuleProject } from "../../types/project";
import { resolveMusicProvider } from "../../constants/musicProviders";
import { useProjectStore } from "../../stores/projectStore";
import { getDeployShortLabel } from "../../utils/deployLabels";
import {
  getCodeEditorLabel,
  musicProviderLabel,
  uiUxLabels,
} from "../../utils/projectLabels";

interface WakeItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}

export function WakePreview({ project }: { project: TimeCapsuleProject }) {
  const musicQuery = useProjectStore((s) => s.settings.musicQuery);
  const music = resolveMusicProvider(
    project.musicProvider,
    project.spotifyEnabled,
  );
  const musicLabel =
    music !== "none" && musicQuery.trim()
      ? `${musicProviderLabel(music)} · ${musicQuery.trim()}`
      : musicProviderLabel(music);

  const items: WakeItem[] = [
    {
      icon: Code2,
      label: getCodeEditorLabel(project.aiTool),
      active: true,
    },
    {
      icon: Container,
      label: "Dev Stack",
      active: !!project.dockerEnabled,
    },
    {
      icon: Palette,
      label: uiUxLabels[project.uiUxTool ?? "none"],
      active: !!project.uiUxTool && project.uiUxTool !== "none",
    },
    {
      icon: Music,
      label: musicLabel,
      active: music !== "none",
    },
    {
      icon: Cloud,
      label: getDeployShortLabel(project.deployTarget ?? "none"),
      active: !!project.deployTarget && project.deployTarget !== "none",
    },
    {
      icon: Globe,
      label: project.port ? `:${project.port}` : "Dev",
      active: !!project.port,
    },
  ];

  return (
    <div className="mt-3 flex flex-wrap gap-1">
      {items.map(({ icon: Icon, label, active }) => (
        <span
          key={label}
          title={label}
          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] ${
            active
              ? "bg-vb-accent/10 text-vb-accent"
              : "bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600"
          }`}
        >
          <Icon className="h-3 w-3" />
        </span>
      ))}
    </div>
  );
}
