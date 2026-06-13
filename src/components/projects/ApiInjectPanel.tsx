import { useEffect, useState } from "react";
import { Bot, CreditCard, Database, KeyRound, Loader2, Plug } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import type { ApiProvider } from "../../types/envVault";
import {
  API_PROVIDER_KEYS,
  apiProviderTemplate,
  matchingProviderKeys,
} from "../../types/envVault";
import { SelectionCard } from "../ui/SelectionCard";
import { useToastStore } from "../../stores/toastStore";

const providers: {
  id: ApiProvider;
  icon: typeof Database;
  labelKey: string;
  descKey: string;
}[] = [
  {
    id: "supabase",
    icon: Database,
    labelKey: "projectsHub.api.supabase",
    descKey: "projectsHub.api.supabaseDesc",
  },
  {
    id: "stripe",
    icon: CreditCard,
    labelKey: "projectsHub.api.stripe",
    descKey: "projectsHub.api.stripeDesc",
  },
  {
    id: "openai",
    icon: Bot,
    labelKey: "projectsHub.api.openai",
    descKey: "projectsHub.api.openaiDesc",
  },
  {
    id: "custom",
    icon: KeyRound,
    labelKey: "projectsHub.api.custom",
    descKey: "projectsHub.api.customDesc",
  },
];

export function ApiInjectPanel({ projectPath }: { projectPath: string }) {
  const { t } = useTranslation();
  const showToast = useToastStore((s) => s.show);
  const injectApiToProject = useProjectStore((s) => s.injectApiToProject);
  const isInjectingEnv = useProjectStore((s) => s.isInjectingEnv);
  const [provider, setProvider] = useState<ApiProvider>("supabase");
  const [envInput, setEnvInput] = useState(() => apiProviderTemplate("supabase"));
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setEnvInput(apiProviderTemplate(provider));
    setSuccessMessage("");
  }, [provider]);

  const handleInject = async () => {
    setSuccessMessage("");

    const matched = matchingProviderKeys(provider, envInput);
    if (matched.length === 0) {
      showToast(t("projectsHub.api.noKeysEntered"), "error");
      return;
    }

    const result = await injectApiToProject(provider, projectPath, envInput);
    if (result) {
      setSuccessMessage(result.message);
    }
  };

  const keyHint = API_PROVIDER_KEYS[provider].join(", ");

  return (
    <div className="mt-4 space-y-5">
      <div className="grid grid-cols-2 gap-2">
        {providers.map(({ id, icon: Icon, labelKey, descKey }) => (
          <SelectionCard
            key={id}
            icon={Icon}
            title={t(labelKey)}
            description={t(descKey)}
            descriptionSize="2xs"
            isSelected={provider === id}
            onClick={() => setProvider(id)}
          />
        ))}
      </div>

      <div>
        <label
          htmlFor="api-env-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          {t("projectsHub.api.inputLabel")}
        </label>
        <textarea
          id="api-env-input"
          value={envInput}
          onChange={(e) => {
            setEnvInput(e.target.value);
            setSuccessMessage("");
          }}
          rows={8}
          spellCheck={false}
          placeholder={apiProviderTemplate(provider)}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs leading-relaxed text-zinc-800 outline-none focus:border-vb-accent dark:border-vb-border dark:bg-zinc-950 dark:text-zinc-200"
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {t("projectsHub.api.inputHint")}
        </p>
        <p className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          {t("projectsHub.api.expectedKeys")}: {keyHint}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void handleInject()}
        disabled={isInjectingEnv}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-vb-accent py-3.5 text-sm font-semibold text-white shadow-sm shadow-vb-accent/25 transition-colors hover:bg-vb-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isInjectingEnv ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("projectsHub.api.injecting")}
          </>
        ) : (
          <>
            <Plug className="h-4 w-4" />
            {t("projectsHub.api.injectButton")}
          </>
        )}
      </button>

      {successMessage && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {successMessage}
        </p>
      )}
    </div>
  );
}
