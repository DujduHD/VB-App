import type { AppPlatform, Framework } from "../types/project";

export const platformOptions: {
  value: AppPlatform;
  label: string;
  desc: string;
}[] = [
  { value: "web", label: "Web Sitesi", desc: "Tarayıcıda çalışan uygulama" },
  { value: "desktop", label: "Masaüstü", desc: "Windows, Linux, macOS" },
  { value: "mobile", label: "Mobil", desc: "iOS & Android" },
];

/** @deprecated vite-blank → vite-react alias */
export const LEGACY_FRAMEWORK_ALIASES: Record<string, Framework> = {
  "vite-blank": "vite-react",
};

export function normalizeFramework(framework: string): Framework {
  return (LEGACY_FRAMEWORK_ALIASES[framework] ??
    framework) as Framework;
}

export const frameworksByPlatform: Record<AppPlatform, Framework[]> = {
  web: [
    "nextjs-blank",
    "nextjs-auth",
    "vite-react",
    "vite-vue",
    "vite-svelte",
    "remix",
    "astro",
    "nuxt",
    "sveltekit",
  ],
  desktop: [
    "tauri-vite",
    "electron-vite",
    "vite-react",
    "nextjs-blank",
  ],
  mobile: [
    "expo-blank",
    "expo-router",
    "react-native-supabase",
    "flutter",
  ],
};

export const defaultFrameworkByPlatform: Record<AppPlatform, Framework> = {
  web: "nextjs-blank",
  desktop: "tauri-vite",
  mobile: "expo-blank",
};

export const frameworkMeta: Record<
  Framework,
  { label: string; desc: string; platform: AppPlatform }
> = {
  "nextjs-blank": {
    label: "Next.js",
    desc: "App Router + TypeScript + Tailwind",
    platform: "web",
  },
  "nextjs-auth": {
    label: "Next.js + Auth",
    desc: "Kimlik doğrulama hazır iskelet",
    platform: "web",
  },
  "vite-react": {
    label: "Vite + React",
    desc: "Hızlı React SPA",
    platform: "web",
  },
  "vite-vue": {
    label: "Vite + Vue",
    desc: "Vue 3 + TypeScript",
    platform: "web",
  },
  "vite-svelte": {
    label: "Vite + Svelte",
    desc: "Svelte + TypeScript",
    platform: "web",
  },
  remix: {
    label: "Remix",
    desc: "Full-stack React framework",
    platform: "web",
  },
  astro: {
    label: "Astro",
    desc: "Content odaklı statik site",
    platform: "web",
  },
  nuxt: {
    label: "Nuxt 3",
    desc: "Vue full-stack framework",
    platform: "web",
  },
  sveltekit: {
    label: "SvelteKit",
    desc: "Svelte full-stack framework",
    platform: "web",
  },
  "tauri-vite": {
    label: "Tauri + Vite",
    desc: "Rust backend + React UI",
    platform: "desktop",
  },
  "electron-vite": {
    label: "Electron + Vite",
    desc: "Cross-platform masaüstü",
    platform: "desktop",
  },
  "expo-blank": {
    label: "Expo (Blank)",
    desc: "Boş TypeScript Expo projesi",
    platform: "mobile",
  },
  "expo-router": {
    label: "Expo Router",
    desc: "File-based routing mobil",
    platform: "mobile",
  },
  "react-native-supabase": {
    label: "Expo + Supabase",
    desc: "Mobil + BaaS entegrasyonu",
    platform: "mobile",
  },
  flutter: {
    label: "Flutter",
    desc: "Dart — iOS & Android native",
    platform: "mobile",
  },
};

export const platformLabels: Record<AppPlatform, string> = {
  web: "Web",
  desktop: "Masaüstü",
  mobile: "Mobil",
};

export const ALL_FRAMEWORKS = Object.keys(frameworkMeta) as Framework[];

export function supportsWebDeploy(framework: Framework): boolean {
  const desktopNative: Framework[] = ["tauri-vite", "electron-vite"];
  return (
    !frameworksByPlatform.mobile.includes(framework) &&
    !desktopNative.includes(framework)
  );
}
