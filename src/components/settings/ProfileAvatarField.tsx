import { useRef, useState } from "react";
import { Loader2, Upload, User, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import type { AvatarSource } from "../../types/profile";
import { isTauri, pickLogoFile, readLogoPreview } from "../../services/tauri";
import { useToastStore } from "../../stores/toastStore";

const ACCEPTED_TYPES =
  "image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon";
const MAX_BYTES = 5 * 1024 * 1024;

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-800 dark:text-zinc-100";

export function ProfileAvatarField() {
  const { t } = useTranslation();
  const avatarUrl = useProjectStore((s) => s.userProfile.identity.avatarUrl);
  const avatarSource = useProjectStore(
    (s) => s.userProfile.identity.avatarSource,
  );
  const setProfileField = useProjectStore((s) => s.setProfileField);
  const showToast = useToastStore((s) => s.show);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);

  const mode: AvatarSource =
    avatarSource === "file" || avatarUrl.startsWith("data:")
      ? "file"
      : avatarSource === "url" || avatarUrl.trim()
        ? "url"
        : "none";

  const preview = avatarUrl.trim() || null;

  const clearAvatar = () => {
    setProfileField("identity", "avatarUrl", "");
    setProfileField("identity", "avatarSource", "none");
  };

  const applyDataUrl = (dataUrl: string, source: AvatarSource) => {
    setProfileField("identity", "avatarUrl", dataUrl);
    setProfileField("identity", "avatarSource", source);
  };

  const handlePickNative = async () => {
    setPicking(true);
    try {
      const staged = await pickLogoFile();
      if (!staged) return;

      const dataUrl = await readLogoPreview(staged.path);
      applyDataUrl(dataUrl, "file");
      showToast(t("toast.avatarUploaded"), "success");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : t("settings.profileSectionFields.avatarPickFailed");
      showToast(msg, "error");
    } finally {
      setPicking(false);
    }
  };

  const handleBrowserFile = (file: File) => {
    if (file.size > MAX_BYTES) {
      showToast(t("toast.logoTooLarge"), "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      applyDataUrl(reader.result as string, "file");
      showToast(t("toast.avatarUploaded"), "success");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-vb-border dark:bg-zinc-800">
          {preview ? (
            <img
              src={preview}
              alt={t("settings.profileSectionFields.avatar")}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-9 w-9 text-zinc-400" />
          )}
        </div>
        {preview && (
          <button
            type="button"
            onClick={clearAvatar}
            title={t("settings.profileSectionFields.avatarRemove")}
            className="absolute -right-1.5 -top-1.5 rounded-full border border-zinc-200 bg-white p-1 text-zinc-400 shadow-sm transition-colors hover:text-red-500 dark:border-vb-border dark:bg-zinc-900"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex w-full max-w-[220px] flex-col gap-2 sm:max-w-none">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleBrowserFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={picking}
          onClick={() => {
            if (isTauri()) void handlePickNative();
            else fileInputRef.current?.click();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-vb-accent/40 hover:text-vb-accent disabled:opacity-50 dark:border-vb-border dark:bg-zinc-800 dark:text-zinc-300"
        >
          {picking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {t("settings.profileSectionFields.avatarUpload")}
        </button>

        <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-vb-border">
          {(
            [
              { id: "url" as const, label: t("form.logo.link") },
              { id: "file" as const, label: t("form.logo.file") },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (id === "url") {
                  if (avatarUrl.startsWith("data:")) {
                    setProfileField("identity", "avatarUrl", "");
                  }
                  setProfileField("identity", "avatarSource", "url");
                } else {
                  setProfileField("identity", "avatarSource", "file");
                }
              }}
              className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${
                mode === id
                  ? "bg-vb-accent text-white"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "url" ? (
          <input
            type="url"
            value={avatarSource === "file" ? "" : avatarUrl}
            onChange={(e) => {
              const value = e.target.value;
              setProfileField("identity", "avatarUrl", value);
              setProfileField(
                "identity",
                "avatarSource",
                value.trim() ? "url" : "none",
              );
            }}
            placeholder={t("settings.profileSectionFields.avatarUrlPlaceholder")}
            className={inputClass}
          />
        ) : (
          <p className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t("form.logo.fileTypesHelp")}
          </p>
        )}
      </div>
    </div>
  );
}
