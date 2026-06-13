import { useCallback, useRef, useState } from "react";
import {
  Copy,
  FileImage,
  Loader2,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  copyToClipboard,
  injectMedia,
  pickMediaFiles,
} from "../../services/tauri";
import { useToastStore } from "../../stores/toastStore";
import { formatError } from "../../utils/formatError";

const ACCEPT =
  ".png,.jpg,.jpeg,.gif,.svg,.ico,.webp,.mp4,.webm,.mov,image/*,video/*";

interface StagedFile {
  path: string;
  name: string;
}

function fileIcon(name: string) {
  return /\.(mp4|webm|mov)$/i.test(name) ? Video : FileImage;
}

export function MediaAssetPanel({
  projectPath,
  framework,
}: {
  projectPath: string;
  framework: string;
}) {
  const { t } = useTranslation();
  const showToast = useToastStore((s) => s.show);
  const inputRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [targetDir, setTargetDir] = useState("");

  const mergeStaged = useCallback((incoming: StagedFile[]) => {
    if (incoming.length === 0) return;
    setStaged((prev) => {
      const seen = new Set(prev.map((f) => f.path));
      const next = [...prev];
      for (const file of incoming) {
        if (!seen.has(file.path)) {
          seen.add(file.path);
          next.push(file);
        }
      }
      return next;
    });
  }, []);

  const addFromPaths = (paths: string[]) => {
    mergeStaged(
      paths.map((path) => ({
        path,
        name: path.split(/[/\\]/).pop() ?? path,
      })),
    );
  };

  const handlePickFiles = async () => {
    try {
      const paths = await pickMediaFiles();
      addFromPaths(paths);
    } catch (err) {
      showToast(formatError(err, t("projectsHub.media.pickFailed")), "error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const stagedFiles: StagedFile[] = [];

    for (const file of files) {
      const withPath = file as File & { path?: string };
      if (withPath.path) {
        stagedFiles.push({ path: withPath.path, name: file.name });
      }
    }

    if (stagedFiles.length > 0) {
      mergeStaged(stagedFiles);
    } else if (files.length > 0) {
      showToast(t("projectsHub.media.usePicker"), "info");
    }

    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const stagedFiles: StagedFile[] = [];

    for (const file of files) {
      const withPath = file as File & { path?: string };
      if (withPath.path) {
        stagedFiles.push({ path: withPath.path, name: file.name });
      }
    }

    if (stagedFiles.length > 0) {
      mergeStaged(stagedFiles);
    } else if (files.length > 0) {
      showToast(t("projectsHub.media.usePicker"), "info");
    }
  };

  const handleInject = async () => {
    if (staged.length === 0) {
      showToast(t("projectsHub.media.noFiles"), "error");
      return;
    }

    setIsInjecting(true);
    try {
      const result = await injectMedia(
        projectPath,
        framework,
        staged.map((f) => f.path),
      );
      setPrompt(result.prompt);
      setTargetDir(result.targetDir);
      setStaged([]);
      showToast(t("projectsHub.media.injectSuccess"), "success");
    } catch (err) {
      showToast(formatError(err, t("projectsHub.media.injectFailed")), "error");
    } finally {
      setIsInjecting(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (!prompt.trim()) return;
    try {
      await copyToClipboard(prompt);
      showToast(t("projectsHub.media.promptCopied"), "success");
    } catch (err) {
      showToast(formatError(err, t("projectsHub.media.copyFailed")), "error");
    }
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-vb-accent bg-vb-accent/5"
            : "border-zinc-300 dark:border-zinc-600"
        }`}
      >
        <Upload className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("projectsHub.media.dropHint")}
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {t("projectsHub.media.formats")}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void handlePickFiles();
          }}
          className="mt-4 rounded-lg border border-vb-accent/40 bg-vb-accent/5 px-4 py-2 text-sm font-medium text-vb-accent transition-colors hover:bg-vb-accent/10"
        >
          {t("projectsHub.media.pickFiles")}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {staged.length > 0 && (
        <ul className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-vb-border dark:bg-zinc-900/50">
          {staged.map((file) => {
            const Icon = fileIcon(file.name);
            return (
              <li
                key={file.path}
                className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 dark:bg-zinc-900"
              >
                <Icon className="h-4 w-4 shrink-0 text-vb-accent" />
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setStaged((prev) => prev.filter((f) => f.path !== file.path))
                  }
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                  aria-label={t("projectsHub.media.removeFile")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => void handleInject()}
        disabled={isInjecting || staged.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-vb-accent py-3.5 text-sm font-semibold text-white shadow-sm shadow-vb-accent/25 transition-colors hover:bg-vb-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isInjecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("projectsHub.media.injecting")}
          </>
        ) : (
          t("projectsHub.media.injectButton")
        )}
      </button>

      {prompt && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              {t("projectsHub.media.promptTitle")}
            </p>
            {targetDir && (
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[10px] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                {targetDir}/
              </span>
            )}
          </div>
          <textarea
            readOnly
            value={prompt}
            rows={5}
            className="w-full resize-none rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-xs leading-relaxed text-zinc-800 outline-none dark:border-emerald-500/20 dark:bg-zinc-950 dark:text-zinc-200"
          />
          <button
            type="button"
            onClick={() => void handleCopyPrompt()}
            className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-zinc-900 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
          >
            <Copy className="h-4 w-4" />
            {t("projectsHub.media.copyPrompt")}
          </button>
        </div>
      )}
    </div>
  );
}
