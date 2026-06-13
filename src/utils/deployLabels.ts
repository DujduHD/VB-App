import i18n from "../i18n";
import type { DeployTarget } from "../types/project";

export function getDeployLabel(target: DeployTarget): string {
  return i18n.t(`deployTargets.${target}.label`, {
    defaultValue: target,
  });
}

export function getDeployShortLabel(target: DeployTarget): string {
  if (target === "none") {
    return i18n.t("deployTargets.none.short", {
      defaultValue: i18n.t("deployTargets.none.label"),
    });
  }
  return getDeployLabel(target);
}

export function getDeployDescription(target: DeployTarget): string {
  return i18n.t(`deployTargets.${target}.description`, {
    defaultValue: "",
  });
}
