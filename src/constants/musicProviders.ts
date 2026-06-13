import type { MusicProvider } from "../types/project";
import {
  getMusicProviderDesc,
  getMusicProviderLabel,
} from "../utils/musicProviderLabels";

export const MUSIC_PROVIDERS: MusicProvider[] = [
  "none",
  "spotify",
  "youtube-music",
];

export function musicProviderLabel(provider: string): string {
  return getMusicProviderLabel(provider);
}

export { getMusicProviderDesc, getMusicProviderLabel };

/** Eski taslak / kapsül kayıtları */
export function resolveMusicProvider(
  musicProvider?: MusicProvider,
  spotifyEnabled?: boolean,
): MusicProvider {
  if (musicProvider && musicProvider !== "none") return musicProvider;
  if (spotifyEnabled === false) return "none";
  if (spotifyEnabled === true) return "spotify";
  return musicProvider ?? "none";
}
