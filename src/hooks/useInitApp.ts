import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../stores/projectStore";
import { loadTimeCapsule } from "../services/tauri";
import { useToastStore } from "../stores/toastStore";

export function useInitApp() {
  const { t } = useTranslation();
  const setTimeCapsule = useProjectStore((s) => s.setTimeCapsule);
  const hydrateDrafts = useProjectStore((s) => s.hydrateDrafts);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    hydrateDrafts();

    loadTimeCapsule()
      .then(setTimeCapsule)
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : t("toast.capsuleLoadFailed");
        showToast(msg, "error");
      });
  }, [setTimeCapsule, hydrateDrafts, showToast, t]);
}
