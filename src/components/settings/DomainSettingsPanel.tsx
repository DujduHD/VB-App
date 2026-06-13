import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cloud,
  FolderOpen,
  KeyRound,
  Loader2,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { getDeployShortLabel } from "../../utils/deployLabels";
import { translateLogLine } from "../../utils/translateLog";
import {
  DomainCheckBar,
  type DomainCheckStatus,
} from "../new-project/DomainCheckBar";
import { slugifyDomainLabel } from "../../services/domain";

function resolveProjectPath(
  projectName: string,
  timeCapsule: { name: string; path: string }[],
): string {
  const slug = slugifyDomainLabel(projectName);
  if (!slug) return "";

  const exact = timeCapsule.find(
    (p) => slugifyDomainLabel(p.name) === slug,
  );
  if (exact) return exact.path;

  const partial = timeCapsule.find((p) =>
    slugifyDomainLabel(p.name).includes(slug),
  );
  return partial?.path ?? "";
}

export function DomainSettingsPanel() {
  const { t } = useTranslation();
  const projectName = useProjectStore((s) => s.form.identity.name);
  const deployTarget = useProjectStore((s) => s.form.launch.deployTarget);
  const timeCapsule = useProjectStore((s) => s.timeCapsule);
  const cloudflareToken = useProjectStore((s) => s.settings.cloudflareToken);
  const setCloudflareToken = useProjectStore((s) => s.setCloudflareToken);
  const runMagicDns = useProjectStore((s) => s.runMagicDns);
  const dnsSetupStatus = useProjectStore((s) => s.dnsSetupStatus);
  const dnsLogs = useProjectStore((s) => s.dnsLogs);
  const clearDnsState = useProjectStore((s) => s.clearDnsState);

  const [checkStatus, setCheckStatus] = useState<DomainCheckStatus>("idle");
  const [checkedDomain, setCheckedDomain] = useState("");
  const [projectPath, setProjectPath] = useState("");

  const suggestedPath = useMemo(
    () => resolveProjectPath(projectName, timeCapsule),
    [projectName, timeCapsule],
  );

  useEffect(() => {
    setProjectPath(suggestedPath);
  }, [suggestedPath]);

  const handleStatusChange = useCallback(
    (state: { status: DomainCheckStatus; checkedDomain: string }) => {
      setCheckStatus(state.status);
      setCheckedDomain(state.checkedDomain);
      if (state.status === "idle") {
        clearDnsState();
      }
    },
    [clearDnsState],
  );

  const hasToken = cloudflareToken.trim().length > 0;
  const hasDeploy = deployTarget !== "none";
  const queryDone =
    checkStatus === "available" || checkStatus === "taken";
  const canRunMagicDns =
    hasToken && hasDeploy && queryDone && checkedDomain.length > 0;
  const isDnsLoading = dnsSetupStatus === "loading";

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("settings.domainSection.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("settings.domainSection.description")}
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-vb-border dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-vb-accent" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("settings.domainSection.cloudflareTitle")}
          </h3>
        </div>
        <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          {t("settings.domainSection.cloudflareDesc")}
        </p>
        <input
          type="password"
          value={cloudflareToken}
          onChange={(e) => setCloudflareToken(e.target.value)}
          placeholder={t("settings.domainSection.cloudflarePlaceholder")}
          autoComplete="off"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-800 dark:text-zinc-100"
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-vb-border dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <Cloud className="h-4 w-4 text-vb-accent" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("settings.domainSection.magicDnsTitle")}
          </h3>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {t("settings.domainSection.deployLabel")}:{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              {getDeployShortLabel(deployTarget)}
            </strong>
          </span>
          {!hasDeploy && (
            <span className="text-amber-600 dark:text-amber-400">
              {t("settings.domainSection.selectDeployHint")}
            </span>
          )}
        </div>

        <DomainCheckBar
          projectName={projectName}
          className=""
          onStatusChange={handleStatusChange}
          footer={
            queryDone ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label
                    htmlFor="magic-dns-project-path"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    {t("settings.domainSection.projectFolder")}
                  </label>
                  <input
                    id="magic-dns-project-path"
                    type="text"
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                    placeholder={t("settings.domainSection.projectFolderPlaceholder")}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <button
                  type="button"
                  disabled={!canRunMagicDns || isDnsLoading}
                  onClick={() => void runMagicDns(checkedDomain, projectPath)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-vb-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isDnsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {t("settings.domainSection.runMagicDns")}
                </button>

                {!hasToken && (
                  <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                    {t("settings.domainSection.tokenRequired")}
                  </p>
                )}
              </div>
            ) : null
          }
        />
      </section>

      {dnsLogs.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-vb-border dark:bg-zinc-900">
          <div className="mb-3 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("settings.domainSection.dnsLogsTitle")}
            </h3>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                dnsSetupStatus === "success"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : dnsSetupStatus === "error"
                    ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    : dnsSetupStatus === "loading"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {dnsSetupStatus}
            </span>
          </div>
          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg bg-zinc-950 px-3 py-2 font-mono text-[11px] leading-relaxed text-emerald-400">
            {dnsLogs.map((line, i) => (
              <li key={`${i}-${line.slice(0, 24)}`}>{translateLogLine(line)}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
