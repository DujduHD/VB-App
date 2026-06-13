import { useState } from "react";
import {
  Bookmark,
  Globe,
  ImageDown,
  Loader2,
  Monitor,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { frameworkMeta, normalizeFramework } from "../../constants/platforms";
import type { AppPlatform, Framework } from "../../types/project";
import type { SelectedProject } from "../../types/projectsHub";
import {
  selectedProjectLogoUrl,
  selectedProjectName,
  selectedProjectPath,
  selectedProjectSlogan,
} from "../../types/projectsHub";
import {
  formatDate,
  platformLabels,
} from "../../utils/projectLabels";
import { getDeployShortLabel } from "../../utils/deployLabels";
import {
  renderVitrinShareImage,
  vitrinShareFileName,
} from "../../utils/vitrinExport";
import { formatError } from "../../utils/formatError";
import { isTauri, saveShareImagePng } from "../../services/tauri";
import { useToastStore } from "../../stores/toastStore";

const platformIcons: Record<AppPlatform, typeof Globe> = {
  web: Globe,
  desktop: Monitor,
  mobile: Smartphone,
};

function frameworkInitial(framework: Framework): string {
  const label = frameworkMeta[framework]?.label ?? framework;
  return label.slice(0, 2).toUpperCase();
}

export function VitrinPanel({ selected }: { selected: SelectedProject }) {
  const { t } = useTranslation();
  const showToast = useToastStore((s) => s.show);
  const [exporting, setExporting] = useState(false);

  const name = selectedProjectName(selected);
  const slogan = selectedProjectSlogan(selected);
  const path = selectedProjectPath(selected);
  const logoUrl = selectedProjectLogoUrl(selected);
  const isCapsule = selected.kind === "capsule";

  const framework = normalizeFramework(
    isCapsule
      ? selected.project.framework
      : selected.draft.form.framework,
  ) as Framework;
  const platform = (isCapsule
    ? selected.project.platform ?? "web"
    : selected.draft.form.platform) as AppPlatform;

  const PlatformIcon = platformIcons[platform];
  const meta = frameworkMeta[framework];

  const handleExport = async () => {
    if (exporting) return;

    setExporting(true);
    try {
      const dataUrl = await renderVitrinShareImage({
        name,
        slogan,
        framework,
        platform,
        logoUrl,
        deployLabel:
          isCapsule && selected.project.deployTarget
            ? getDeployShortLabel(selected.project.deployTarget)
            : undefined,
        createdLabel: isCapsule
          ? formatDate(selected.project.createdAt)
          : undefined,
      });

      const fileName = vitrinShareFileName(name);

      if (isTauri()) {
        const savedPath = await saveShareImagePng(dataUrl, fileName);
        if (savedPath) {
          showToast(
            t("projectsHub.vitrin.exportSuccess", { path: savedPath }),
            "success",
          );
        }
      } else {
        const anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = fileName;
        anchor.click();
        showToast(t("projectsHub.vitrin.exportSuccessBrowser"), "success");
      }
    } catch (err) {
      showToast(formatError(err, t("projectsHub.vitrin.exportFailed")), "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mt-4 space-y-5">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-vb-accent/5 dark:border-vb-border dark:from-zinc-900 dark:via-vb-surface dark:to-vb-accent/10">
        <div className="border-b border-zinc-200/80 px-6 py-5 dark:border-vb-border">
          <div className="flex items-start gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-vb-border dark:bg-zinc-900">
              {logoUrl ? (
                <img
                  src={logoUrl.startsWith("http") ? logoUrl : `file://${logoUrl}`}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-vb-accent">
                  {frameworkInitial(framework)}
                </span>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-zinc-900 text-white dark:border-zinc-900 dark:bg-vb-accent">
                {isCapsule ? (
                  <Sparkles className="h-3 w-3" />
                ) : (
                  <Bookmark className="h-3 w-3" />
                )}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {name}
              </h4>
              {slogan ? (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {slogan}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white/80 p-3 dark:border-vb-border dark:bg-zinc-900/60">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              {t("projectsHub.vitrin.framework")}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-vb-accent/10 text-[10px] font-bold text-vb-accent">
                {frameworkInitial(framework)}
              </span>
              {meta?.label ?? framework}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white/80 p-3 dark:border-vb-border dark:bg-zinc-900/60">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              {t("projectsHub.vitrin.platform")}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              <PlatformIcon className="h-4 w-4 text-vb-accent" />
              {platformLabels[platform]}
            </p>
          </div>

          {isCapsule && selected.project.deployTarget && (
            <div className="rounded-xl border border-zinc-200 bg-white/80 p-3 dark:border-vb-border dark:bg-zinc-900/60">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                {t("projectsHub.vitrin.deploy")}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {getDeployShortLabel(selected.project.deployTarget)}
              </p>
            </div>
          )}

          {isCapsule && (
            <div className="rounded-xl border border-zinc-200 bg-white/80 p-3 dark:border-vb-border dark:bg-zinc-900/60">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                {t("projectsHub.vitrin.created")}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {formatDate(selected.project.createdAt)}
              </p>
            </div>
          )}
        </div>

        {path && (
          <div className="border-t border-zinc-200/80 px-6 py-3 dark:border-vb-border">
            <p className="truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              {path}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-vb-accent/40 bg-vb-accent/5 py-3.5 text-sm font-semibold text-vb-accent transition-all hover:border-vb-accent hover:bg-vb-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("projectsHub.vitrin.exporting")}
          </>
        ) : (
          <>
            <ImageDown className="h-4 w-4" />
            {t("projectsHub.vitrin.exportButton")}
          </>
        )}
      </button>
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
        {t("projectsHub.vitrin.exportHint")}
      </p>
    </div>
  );
}
