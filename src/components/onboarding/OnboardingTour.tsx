import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { useNavigationStore } from "../../stores/navigationStore";

export function OnboardingTour() {
  const { t } = useTranslation();
  const view = useNavigationStore((s) => s.view);
  const hasSeenTour = useProjectStore((s) => s.settings.hasSeenTour);
  const setHasSeenTour = useProjectStore((s) => s.setHasSeenTour);
  const startedRef = useRef(false);

  useEffect(() => {
    if (hasSeenTour || view !== "home" || startedRef.current) return;

    const timer = window.setTimeout(() => {
      const formEl = document.querySelector('[data-tour="new-project-form"]');
      const capsuleEl = document.querySelector('[data-tour="time-capsule"]');
      const logEl = document.querySelector('[data-tour="log-panel"]');
      const settingsEl = document.querySelector('[data-tour="settings"]');

      if (!formEl || !capsuleEl || !logEl || !settingsEl) return;

      startedRef.current = true;

      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayOpacity: 0.55,
        stagePadding: 8,
        stageRadius: 12,
        nextBtnText: t("onboarding.next"),
        prevBtnText: t("onboarding.prev"),
        doneBtnText: t("onboarding.done"),
        progressText: "{{current}} / {{total}}",
        onDestroyed: () => setHasSeenTour(true),
        steps: [
          {
            element: '[data-tour="new-project-form"]',
            popover: {
              title: t("onboarding.step1Title"),
              description: t("onboarding.step1Desc"),
              side: "left",
              align: "start",
            },
          },
          {
            element: '[data-tour="time-capsule"]',
            popover: {
              title: t("onboarding.step2Title"),
              description: t("onboarding.step2Desc"),
              side: "right",
              align: "start",
            },
          },
          {
            element: '[data-tour="log-panel"]',
            popover: {
              title: t("onboarding.step3Title"),
              description: t("onboarding.step3Desc"),
              side: "top",
              align: "start",
            },
          },
          {
            element: '[data-tour="settings"]',
            popover: {
              title: t("onboarding.step4Title"),
              description: t("onboarding.step4Desc"),
              side: "bottom",
              align: "end",
            },
          },
        ],
      });

      driverObj.drive();
    }, 600);

    return () => window.clearTimeout(timer);
  }, [hasSeenTour, view, setHasSeenTour, t]);

  return null;
}
