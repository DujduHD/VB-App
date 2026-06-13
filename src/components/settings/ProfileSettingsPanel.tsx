import type { ReactNode } from "react";
import { useState } from "react";
import {
  Brain,
  Cloud,
  FolderOpen,
  GitBranch,
  Loader2,
  Sparkles,
  Terminal,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import {
  DEV_ROLE_OPTIONS,
  LICENSE_OPTIONS,
} from "../../constants/profile";
import { syncProfileToGist } from "../../services/githubSync";
import { pickProjectDirectory } from "../../services/tauri";
import { useToastStore } from "../../stores/toastStore";
import { formatError } from "../../utils/formatError";
import { ProfileAvatarField } from "./ProfileAvatarField";

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: typeof User;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-vb-border dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-vb-accent" />}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
    >
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-800 dark:text-zinc-100";

const selectClass = `${inputClass} cursor-pointer`;

export function ProfileSettingsPanel() {
  const { t } = useTranslation();
  const profile = useProjectStore((s) => s.userProfile);
  const settings = useProjectStore((s) => s.settings);
  const setProfileField = useProjectStore((s) => s.setProfileField);
  const setGistSyncId = useProjectStore((s) => s.setGistSyncId);
  const showToast = useToastStore((s) => s.show);
  const [syncing, setSyncing] = useState(false);
  const [showPat, setShowPat] = useState(false);

  const roleLabel = t(`devRoles.${profile.identity.role}`, {
    defaultValue: profile.identity.role,
  });

  const handlePickDirectory = async () => {
    try {
      const picked = await pickProjectDirectory();
      if (picked) setProfileField("workspace", "defaultPath", picked);
    } catch (err) {
      showToast(formatError(err, t("toast.pickDirectoryFailed")), "error");
    }
  };

  const handleGistSync = async () => {
    if (!profile.gitCloud.githubPAT.trim()) {
      showToast(t("toast.githubPatRequired"), "error");
      return;
    }

    setSyncing(true);
    try {
      const gistId = await syncProfileToGist(
        profile,
        settings,
        profile.gitCloud.gistSyncId,
      );
      setGistSyncId(gistId);
      showToast(t("toast.gistSyncSuccess"), "success");
    } catch (err) {
      showToast(formatError(err, t("toast.gistSyncFailed")), "error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <header>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("settings.profileSection.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("settings.profileSection.description")}
        </p>
      </header>

      {/* Header: avatar, name, role, metrics */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-vb-accent/5 to-transparent p-5 dark:border-vb-border dark:from-vb-accent/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <ProfileAvatarField />

            <div className="flex flex-col justify-center">
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {profile.identity.name || t("common.unnamed")}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {roleLabel}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:min-w-[220px] lg:w-auto lg:max-w-[240px]">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-zinc-200 bg-white/80 px-3 py-2.5 dark:border-vb-border dark:bg-zinc-900/80">
                <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  {t("settings.profileSection.totalSpawns")}
                </p>
                <p className="mt-0.5 text-xl font-bold text-vb-accent">
                  {profile.metrics.totalSpawns}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white/80 px-3 py-2.5 dark:border-vb-border dark:bg-zinc-900/80">
                <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  {t("settings.profileSection.topFramework")}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {profile.metrics.topFramework}
                </p>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="profile-role">
                {t("settings.profileSectionFields.role")}
              </FieldLabel>
              <select
                id="profile-role"
                value={profile.identity.role}
                onChange={(e) =>
                  setProfileField("identity", "role", e.target.value)
                }
                className={selectClass}
              >
                {DEV_ROLE_OPTIONS.map(({ value }) => (
                  <option key={value} value={value}>
                    {t(`devRoles.${value}`, { defaultValue: value })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <Section
        title={t("settings.profileSection.identityBrand")}
        description={t("settings.profileSection.identityBrandDesc")}
        icon={Sparkles}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="profile-name">
              {t("settings.profileSectionFields.nameCompany")}
            </FieldLabel>
            <input
              id="profile-name"
              type="text"
              value={profile.identity.name}
              onChange={(e) =>
                setProfileField("identity", "name", e.target.value)
              }
              placeholder="VeliDevo"
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel htmlFor="profile-website">
              {t("settings.profileSectionFields.website")}
            </FieldLabel>
            <input
              id="profile-website"
              type="url"
              value={profile.identity.website}
              onChange={(e) =>
                setProfileField("identity", "website", e.target.value)
              }
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel htmlFor="default-license">
              {t("settings.profileSectionFields.defaultLicense")}
            </FieldLabel>
            <select
              id="default-license"
              value={profile.branding.defaultLicense}
              onChange={(e) =>
                setProfileField("branding", "defaultLicense", e.target.value)
              }
              className={selectClass}
            >
              {LICENSE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="copyright-text">
              {t("settings.profileSectionFields.copyright")}
            </FieldLabel>
            <input
              id="copyright-text"
              type="text"
              value={profile.branding.copyrightText}
              onChange={(e) =>
                setProfileField("branding", "copyrightText", e.target.value)
              }
              placeholder="© 2026 VeliDevo"
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section
        title={t("settings.profileSection.workspace")}
        description={t("settings.profileSection.workspaceDesc")}
        icon={Terminal}
      >
        <div className="space-y-3">
          <div>
            <FieldLabel htmlFor="default-path">
              {t("settings.profileSectionFields.defaultPath")}
            </FieldLabel>
            <div className="flex gap-2">
              <input
                id="default-path"
                type="text"
                value={profile.workspace.defaultPath}
                onChange={(e) =>
                  setProfileField("workspace", "defaultPath", e.target.value)
                }
                placeholder="~/Projects"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handlePickDirectory}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-700 transition-colors hover:border-vb-accent/40 hover:text-vb-accent dark:border-vb-border dark:bg-zinc-800 dark:text-zinc-300"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                {t("buttons.select")}
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="terminal-cmd">
                {t("settings.profileSectionFields.terminalCmd")}
              </FieldLabel>
              <input
                id="terminal-cmd"
                type="text"
                value={profile.workspace.terminalCommand}
                onChange={(e) =>
                  setProfileField(
                    "workspace",
                    "terminalCommand",
                    e.target.value,
                  )
                }
                placeholder="alacritty, fish"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="ssh-key">
                {t("settings.profileSectionFields.sshKey")}
              </FieldLabel>
              <input
                id="ssh-key"
                type="text"
                value={profile.workspace.sshKeyPath}
                onChange={(e) =>
                  setProfileField("workspace", "sshKeyPath", e.target.value)
                }
                placeholder="~/.ssh/id_rsa"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        title={t("settings.profileSection.gitCloud")}
        description={t("settings.profileSection.gitCloudDesc")}
        icon={GitBranch}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="github-user">
              {t("settings.profileSectionFields.githubUser")}
            </FieldLabel>
            <input
              id="github-user"
              type="text"
              value={profile.gitCloud.githubUsername}
              onChange={(e) =>
                setProfileField("gitCloud", "githubUsername", e.target.value)
              }
              placeholder="kullaniciadi"
              className={inputClass}
              autoComplete="username"
            />
          </div>
          <div>
            <FieldLabel htmlFor="github-pat">
              {t("settings.profileSectionFields.githubPat")}
            </FieldLabel>
            <div className="relative">
              <input
                id="github-pat"
                type={showPat ? "text" : "password"}
                value={profile.gitCloud.githubPAT}
                onChange={(e) =>
                  setProfileField("gitCloud", "githubPAT", e.target.value)
                }
                placeholder="ghp_..."
                className={`${inputClass} pr-16`}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPat((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[10px] font-medium text-zinc-500 hover:text-vb-accent"
              >
                {showPat ? t("buttons.hide") : t("buttons.show")}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGistSync}
          disabled={syncing}
          className="mt-4 flex items-center gap-2 rounded-lg bg-vb-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          {t("buttons.syncGist")}
        </button>

        {profile.gitCloud.gistSyncId && (
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {t("settings.profileSectionFields.gistId")}:{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
              {profile.gitCloud.gistSyncId}
            </code>
          </p>
        )}
      </Section>

      <Section
        title={t("settings.profileSection.aiVibe")}
        description={t("settings.profileSection.aiVibeDesc")}
        icon={Brain}
      >
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="global-rules">
              {t("settings.profileSectionFields.globalRules")}
            </FieldLabel>
            <textarea
              id="global-rules"
              rows={5}
              value={profile.aiPreferences.globalRules}
              onChange={(e) =>
                setProfileField(
                  "aiPreferences",
                  "globalRules",
                  e.target.value,
                )
              }
              placeholder={t("settings.profileSectionFields.globalRulesPlaceholder")}
              className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
            />
          </div>
          <div>
            <FieldLabel htmlFor="prompt-context">
              {t("settings.profileSectionFields.promptContext")}
            </FieldLabel>
            <textarea
              id="prompt-context"
              rows={4}
              value={profile.aiPreferences.customPromptContext}
              onChange={(e) =>
                setProfileField(
                  "aiPreferences",
                  "customPromptContext",
                  e.target.value,
                )
              }
              placeholder={t("settings.profileSectionFields.promptContextPlaceholder")}
              className={`${inputClass} resize-y text-xs leading-relaxed`}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
