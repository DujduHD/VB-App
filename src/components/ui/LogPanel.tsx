import { Terminal, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { translateLogLine } from "../../utils/translateLog";

export function LogPanel() {
  const { t, i18n } = useTranslation();
  const logs = useProjectStore((s) => s.logs);
  const clearLogs = useProjectStore((s) => s.clearLogs);

  return (
    <div className="border-t border-zinc-200 bg-zinc-50 dark:border-vb-border dark:bg-vb-surface">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <Terminal className="h-3.5 w-3.5" />
          {t("log.title")}
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={clearLogs}
            className="rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            title={t("log.clear")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {logs.length === 0 ? (
        <p className="px-4 pb-3 text-[11px] text-zinc-400 dark:text-zinc-500">
          {t("log.empty")}
        </p>
      ) : (
        <div className="vb-terminal-font max-h-32 overflow-y-auto px-4 pb-3 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          {logs.map((line, i) => (
            <div key={`${i18n.language}-${i}`} className="truncate">
              {translateLogLine(line)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
