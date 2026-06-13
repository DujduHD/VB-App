import { memo } from "react";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useProjectStore } from "../../stores/projectStore";
import { baasProviderMeta } from "../../constants/baasProviders";

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-900";

function CredentialForm({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-vb-border dark:bg-zinc-900/50">
      <p className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Shield className="h-3 w-3" />
        {t("form.integrationsExtended.vaultNote")}
      </p>
      {children}
    </div>
  );
}

export const BaasCredentialFields = memo(function BaasCredentialFields() {
  const baasProvider = useProjectStore((s) => s.form.integrations.baasProvider);
  const credentials = useProjectStore(
    useShallow((s) => {
      const i = s.form.integrations;
      return {
        supabaseUrl: i.supabaseUrl,
        supabaseAnonKey: i.supabaseAnonKey,
        supabaseServiceKey: i.supabaseServiceKey,
        firebaseApiKey: i.firebaseApiKey,
        firebaseAuthDomain: i.firebaseAuthDomain,
        firebaseProjectId: i.firebaseProjectId,
        firebaseAppId: i.firebaseAppId,
        databaseUrl: i.databaseUrl,
        databaseToken: i.databaseToken,
        databaseSecret: i.databaseSecret,
      };
    }),
  );
  const setIntegrations = useProjectStore((s) => s.setIntegrations);

  const meta =
    baasProvider !== "none" ? baasProviderMeta[baasProvider] : null;

  if (!meta) return null;

  return (
    <div className="mt-4">
      {meta.formType === "supabase" && (
        <CredentialForm>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Supabase URL
            </label>
            <input
              type="url"
              value={credentials.supabaseUrl}
              onChange={(e) => setIntegrations({ supabaseUrl: e.target.value })}
              placeholder="https://xxxx.supabase.co"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Anon Key
            </label>
            <input
              type="password"
              value={credentials.supabaseAnonKey}
              onChange={(e) =>
                setIntegrations({ supabaseAnonKey: e.target.value })
              }
              placeholder="eyJhbG..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Service Role Key (opsiyonel)
            </label>
            <input
              type="password"
              value={credentials.supabaseServiceKey}
              onChange={(e) =>
                setIntegrations({ supabaseServiceKey: e.target.value })
              }
              placeholder="eyJhbG..."
              className={inputClass}
            />
          </div>
        </CredentialForm>
      )}

      {meta.formType === "firebase" && (
        <CredentialForm>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              API Key
            </label>
            <input
              type="password"
              value={credentials.firebaseApiKey}
              onChange={(e) =>
                setIntegrations({ firebaseApiKey: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Auth Domain
            </label>
            <input
              type="text"
              value={credentials.firebaseAuthDomain}
              onChange={(e) =>
                setIntegrations({ firebaseAuthDomain: e.target.value })
              }
              placeholder="proje.firebaseapp.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Project ID
            </label>
            <input
              type="text"
              value={credentials.firebaseProjectId}
              onChange={(e) =>
                setIntegrations({ firebaseProjectId: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              App ID
            </label>
            <input
              type="text"
              value={credentials.firebaseAppId}
              onChange={(e) =>
                setIntegrations({ firebaseAppId: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </CredentialForm>
      )}

      {meta.formType === "connection" && (
        <CredentialForm>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {meta.urlLabel ?? "Connection String"}
            </label>
            <input
              type="password"
              value={credentials.databaseUrl}
              onChange={(e) => setIntegrations({ databaseUrl: e.target.value })}
              placeholder={meta.urlPlaceholder}
              className={inputClass}
            />
          </div>
        </CredentialForm>
      )}

      {meta.formType === "url-token" && (
        <CredentialForm>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {meta.urlLabel ?? "URL"}
            </label>
            <input
              type="password"
              value={credentials.databaseUrl}
              onChange={(e) => setIntegrations({ databaseUrl: e.target.value })}
              placeholder={meta.urlPlaceholder}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {meta.tokenLabel ?? "Token"}
            </label>
            <input
              type="password"
              value={credentials.databaseToken}
              onChange={(e) =>
                setIntegrations({ databaseToken: e.target.value })
              }
              placeholder={meta.tokenPlaceholder}
              className={inputClass}
            />
          </div>
        </CredentialForm>
      )}

      {meta.formType === "aws-dynamodb" && (
        <CredentialForm>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {meta.urlLabel}
            </label>
            <input
              type="text"
              value={credentials.databaseUrl}
              onChange={(e) => setIntegrations({ databaseUrl: e.target.value })}
              placeholder={meta.urlPlaceholder}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {meta.tokenLabel}
            </label>
            <input
              type="password"
              value={credentials.databaseToken}
              onChange={(e) =>
                setIntegrations({ databaseToken: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {meta.secretLabel}
            </label>
            <input
              type="password"
              value={credentials.databaseSecret}
              onChange={(e) =>
                setIntegrations({ databaseSecret: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </CredentialForm>
      )}
    </div>
  );
});
