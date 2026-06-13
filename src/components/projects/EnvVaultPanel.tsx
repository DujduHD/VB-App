import { useEffect } from "react";
import { Lock, Loader2, Save, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { DEFAULT_VAULT_TEMPLATE } from "../../types/envVault";
import { InfoTooltip } from "../ui/InfoTooltip";

export function EnvVaultPanel() {
  const { t } = useTranslation();
  const globalEnvVault = useProjectStore((s) => s.globalEnvVault);
  const isVaultLoading = useProjectStore((s) => s.isVaultLoading);
  const isVaultSaving = useProjectStore((s) => s.isVaultSaving);
  const setGlobalEnvVault = useProjectStore((s) => s.setGlobalEnvVault);
  const loadGlobalEnvVault = useProjectStore((s) => s.loadGlobalEnvVault);
  const saveGlobalEnvVault = useProjectStore((s) => s.saveGlobalEnvVault);

  useEffect(() => {
    void loadGlobalEnvVault();
  }, [loadGlobalEnvVault]);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-vb-accent/20 bg-vb-accent/5 p-4 dark:border-vb-accent/30 dark:bg-vb-accent/10">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-vb-accent" />
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t("projectsHub.env.secureTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t("projectsHub.env.secureDesc")}
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="env-vault"
          className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500"
        >
          <Lock className="h-3.5 w-3.5" />
          {t("projectsHub.env.vaultLabel")}
          <InfoTooltip
            content={t("tooltips.envVault")}
            label={t("projectsHub.env.vaultLabel")}
          />
        </label>
        <textarea
          id="env-vault"
          value={globalEnvVault}
          onChange={(e) => setGlobalEnvVault(e.target.value)}
          placeholder={DEFAULT_VAULT_TEMPLATE}
          rows={12}
          disabled={isVaultLoading}
          spellCheck={false}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs leading-relaxed text-zinc-800 outline-none focus:border-vb-accent dark:border-vb-border dark:bg-zinc-950 dark:text-zinc-200"
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {t("projectsHub.env.vaultHint")}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void saveGlobalEnvVault()}
        disabled={isVaultSaving || isVaultLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-vb-accent/40 bg-vb-accent/10 py-3 text-sm font-semibold text-vb-accent transition-colors hover:bg-vb-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isVaultSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("projectsHub.env.saving")}
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {t("projectsHub.env.saveVault")}
          </>
        )}
      </button>
    </div>
  );
}
