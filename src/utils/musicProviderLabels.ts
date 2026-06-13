import i18n from "../i18n";
import type { MusicProvider } from "../types/project";

export function getMusicProviderLabel(provider: MusicProvider | string): string {
  return i18n.t(`musicProviders.${provider}.label`, {
    defaultValue: provider,
  });
}

export function getMusicProviderDesc(provider: MusicProvider | string): string {
  return i18n.t(`musicProviders.${provider}.desc`, {
    defaultValue: "",
  });
}
