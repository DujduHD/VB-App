export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export type Framework =
  | "nextjs-blank"
  | "nextjs-auth"
  | "vite-react"
  | "vite-vue"
  | "vite-svelte"
  | "remix"
  | "astro"
  | "nuxt"
  | "sveltekit"
  | "tauri-vite"
  | "electron-vite"
  | "expo-blank"
  | "expo-router"
  | "react-native-supabase"
  | "flutter";

/** Eski Zaman Kapsülü kayıtları için */
export type LegacyFramework = "vite-blank";

export type CodeEditor =
  | "cursor"
  | "vscode"
  | "windsurf"
  | "zed"
  | "void"
  | "trae"
  | "pearai"
  | "antigravity";

/** @deprecated Eski sohbet tabanlı AI araçları */
export type LegacyAiTool = "claude" | "chatgpt" | "gemini" | "llama";

export type UiUxTool =
  | "none"
  | "figma"
  | "framer"
  | "penpot"
  | "canva"
  | "spline"
  | "stick"
  | "v0"
  | "uizard"
  | "relume"
  | "miro"
  | "excalidraw"
  | "dribbble"
  | "mobbin";

export type BaasProvider =
  | "none"
  | "neon"
  | "supabase"
  | "nile"
  | "prisma-postgres"
  | "aws-aurora-postgres"
  | "aws-aurora-dsql"
  | "turso"
  | "mongodb-atlas"
  | "aws-dynamodb"
  | "convex"
  | "firebase"
  | "upstash-redis"
  | "vercel-redis"
  | "upstash-vector"
  | "upstash-qstash"
  | "upstash-search"
  | "motherduck";

export type AppPlatform = "web" | "desktop" | "mobile";

export type DeployTarget =
  | "none"
  | "vercel"
  | "netlify"
  | "render"
  | "cloudflare-pages"
  | "fly-io"
  | "railway"
  | "aws-amplify"
  | "github-pages";

export type LogoSource = "none" | "url" | "file";

export interface ProjectIdentity {
  name: string;
  slogan: string;
  logoUrl: string;
  logoFilePath: string;
  logoFileName: string;
  logoSource: LogoSource;
}

export interface IntegrationsConfig {
  baasProvider: BaasProvider;
  databaseUrl: string;
  databaseToken: string;
  databaseSecret: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseAppId: string;
  dockerEnabled: boolean;
}

export type MusicProvider = "none" | "spotify" | "youtube-music";

export interface VibeConfig {
  uiUxTool: UiUxTool;
  musicProvider: MusicProvider;
}

export interface LaunchConfig {
  deployTarget: DeployTarget;
  gitEnabled: boolean;
  openGithub: boolean;
}

/** Dış proje analizi — Rust `analyze_project` yanıtı */
export interface ProjectAnalysis {
  projectName: string;
  platform: AppPlatform;
  packageManager: PackageManager;
  framework: Framework;
  deployTarget: DeployTarget;
  gitEnabled: boolean;
  dockerEnabled: boolean;
  unknownFields: string[];
}

export interface NewProjectForm {
  identity: ProjectIdentity;
  platform: AppPlatform;
  framework: Framework;
  packageManager: PackageManager;
  aiTool: CodeEditor;
  integrations: IntegrationsConfig;
  vibe: VibeConfig;
  launch: LaunchConfig;
}

export interface TimeCapsuleProject {
  id: string;
  name: string;
  slogan: string;
  platform?: AppPlatform;
  framework: Framework | LegacyFramework;
  packageManager: PackageManager;
  aiTool: CodeEditor | LegacyAiTool;
  createdAt: string;
  path: string;
  port?: number;
  baasProvider?: BaasProvider;
  dockerEnabled?: boolean;
  uiUxTool?: UiUxTool;
  musicProvider?: MusicProvider;
  /** @deprecated musicProvider kullanın */
  spotifyEnabled?: boolean;
  deployTarget?: DeployTarget;
  gitEnabled?: boolean;
}
