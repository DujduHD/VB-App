import type { AppearanceSettings } from "./appearance";
import { DEFAULT_APPEARANCE } from "./appearance";
import type { AppLanguage } from "./language";
import { DEFAULT_LANGUAGE } from "./language";

export type DnsSetupStatus = "idle" | "loading" | "success" | "error";

export interface AppSettings extends AppearanceSettings {
  language: AppLanguage;
  cloudflareToken: string;
  /** Parça adı, arama terimi veya Spotify/YouTube URL */
  musicQuery: string;
  hasSeenTour: boolean;
}

export { DEFAULT_APPEARANCE, DEFAULT_LANGUAGE };
export type { AppLanguage };
