import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";

export function ImportWarningSection({
  fieldKey,
  children,
  className = "",
}: {
  fieldKey: string;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  const hasWarning = useProjectStore((s) => s.importWarnings.includes(fieldKey));

  return (
    <div
      className={`rounded-xl transition-colors ${
        hasWarning
          ? "border-2 border-red-500 p-3 dark:border-red-400"
          : className
      }`}
    >
      {children}
      {hasWarning && (
        <p className="mt-2 text-xs leading-relaxed text-red-600 dark:text-red-400">
          {t("import.fieldWarning")}
        </p>
      )}
    </div>
  );
}
