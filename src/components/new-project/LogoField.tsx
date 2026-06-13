import { useEffect, useRef, useState } from "react";
import { ImageIcon, Link2, Upload, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useProjectStore } from "../../stores/projectStore";
import type { LogoSource } from "../../types/project";
import {
  isTauri,
  pickLogoFile,
  readLogoPreview,
  removeStagedLogo,
} from "../../services/tauri";
import { useToastStore } from "../../stores/toastStore";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon";

export function LogoField() {
  const { t } = useTranslation();
  const identity = useProjectStore(
    useShallow((s) => ({
      logoUrl: s.form.identity.logoUrl,
      logoFilePath: s.form.identity.logoFilePath,
      logoFileName: s.form.identity.logoFileName,
      logoSource: s.form.identity.logoSource,
    })),
  );
  const setIdentity = useProjectStore((s) => s.setIdentity);
  const showToast = useToastStore((s) => s.show);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [picking, setPicking] = useState(false);

  const mode: LogoSource =
    identity.logoSource === "file" || identity.logoFilePath
      ? "file"
      : identity.logoSource === "url" || identity.logoUrl.trim()
        ? "url"
        : "none";

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (identity.logoSource === "file" && identity.logoFilePath) {
        setLoadingPreview(true);
        try {
          const dataUrl = await readLogoPreview(identity.logoFilePath);
          if (!cancelled) setPreview(dataUrl);
        } catch {
          if (!cancelled) setPreview("");
        } finally {
          if (!cancelled) setLoadingPreview(false);
        }
        return;
      }

      if (identity.logoSource === "url" && identity.logoUrl.trim()) {
        setPreview(identity.logoUrl.trim());
        return;
      }

      setPreview("");
    }

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [
    identity.logoSource,
    identity.logoFilePath,
    identity.logoUrl,
  ]);

  const clearLogo = async () => {
    if (identity.logoFilePath) {
      try {
        await removeStagedLogo(identity.logoFilePath);
      } catch {
        /* staged file may already be gone */
      }
    }
    setIdentity({
      logoUrl: "",
      logoFilePath: "",
      logoFileName: "",
      logoSource: "none",
    });
    setPreview("");
  };

  const applyStagedLogo = async (staged: { path: string; fileName: string }) => {
    if (identity.logoFilePath && identity.logoFilePath !== staged.path) {
      await removeStagedLogo(identity.logoFilePath).catch(() => {});
    }
    setIdentity({
      logoUrl: "",
      logoFilePath: staged.path,
      logoFileName: staged.fileName,
      logoSource: "file",
    });
  };

  const handlePickNative = async () => {
    setPicking(true);
    try {
      const staged = await pickLogoFile();
      if (staged) {
        await applyStagedLogo(staged);
        showToast(t("toast.logoUploaded", { fileName: staged.fileName }), "success");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("form.logo.pickFailed");
      showToast(msg, "error");
    } finally {
      setPicking(false);
    }
  };

  const switchMode = async (id: "url" | "file") => {
    if (id === "url" && identity.logoFilePath) {
      await removeStagedLogo(identity.logoFilePath).catch(() => {});
    }
    setIdentity({
      logoSource: id,
      ...(id === "url"
        ? { logoFilePath: "", logoFileName: "" }
        : { logoUrl: "" }),
    });
  };

  const handleBrowserFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast(t("toast.logoTooLarge"), "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIdentity({
        logoUrl: reader.result as string,
        logoFilePath: "",
        logoFileName: file.name,
        logoSource: "url",
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t("form.logo.label")}
      </label>

      <div className="mb-3 flex rounded-lg border border-zinc-200 p-1 dark:border-vb-border">
        {(
          [
            { id: "url" as const, label: t("form.logo.link"), icon: Link2 },
            { id: "file" as const, label: t("form.logo.file"), icon: Upload },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => void switchMode(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-all ${
              mode === id
                ? "bg-vb-accent text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <input
          type="url"
          value={identity.logoUrl}
          onChange={(e) =>
            setIdentity({
              logoUrl: e.target.value,
              logoSource: e.target.value.trim() ? "url" : "none",
            })
          }
          placeholder={t("form.logo.urlPlaceholder")}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-900"
        />
      ) : (
        <div className="space-y-2">
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
            onClick={() => {
              if (isTauri()) void handlePickNative();
              else fileInputRef.current?.click();
            }}
            disabled={picking}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm font-medium text-zinc-600 transition-colors hover:border-vb-accent hover:bg-vb-accent/5 hover:text-vb-accent disabled:opacity-50 dark:border-vb-border dark:bg-zinc-900/50 dark:text-zinc-300"
          >
            {picking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {identity.logoFileName || t("form.logo.pick")}
          </button>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {t("form.logo.fileTypesHelp")}
          </p>
        </div>
      )}

      {(preview || loadingPreview) && (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-vb-border dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <ImageIcon className="h-3.5 w-3.5" />
              {t("form.logo.preview")}
            </span>
            <button
              type="button"
              onClick={() => void clearLogo()}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-red-500 dark:hover:bg-zinc-800"
              title={t("form.logo.remove")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {loadingPreview ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center">
              <img
                src={preview}
                alt={t("form.logo.preview")}
                className="max-h-24 max-w-full object-contain"
                onError={() => setPreview("")}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
