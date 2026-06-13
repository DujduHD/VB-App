export type ApiProvider = "supabase" | "stripe" | "openai" | "custom";

export interface InjectEnvResult {
  injectedKeys: string[];
  message: string;
}

export const API_PROVIDER_KEYS: Record<ApiProvider, string[]> = {
  supabase: [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ],
  stripe: [
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ],
  openai: ["OPENAI_API_KEY", "OPENAI_ORG_ID"],
  custom: ["CUSTOM_*", "API_*", "MY_*"],
};

const STANDARD_VAULT_KEYS = new Set([
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "OPENAI_API_KEY",
  "OPENAI_ORG_ID",
  "OPENAI_PROJECT_ID",
]);

export function apiProviderTemplate(provider: ApiProvider): string {
  switch (provider) {
    case "supabase":
      return `SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=`;
    case "stripe":
      return `STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=`;
    case "openai":
      return `OPENAI_API_KEY=
OPENAI_ORG_ID=`;
    case "custom":
      return `# Keys starting with CUSTOM_, API_, or MY_
CUSTOM_API_KEY=
API_SECRET=
MY_TOKEN=`;
  }
}

export function parseEnvLines(content: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) map[key] = value;
  }
  return map;
}

function isCustomProviderKey(key: string): boolean {
  if (STANDARD_VAULT_KEYS.has(key)) return false;
  return (
    key.startsWith("CUSTOM_") ||
    key.startsWith("API_") ||
    key.startsWith("MY_") ||
    key.includes("_API_")
  );
}

export function matchingProviderKeys(
  provider: ApiProvider,
  content: string,
): string[] {
  const entries = parseEnvLines(content);
  const allowed = new Set(API_PROVIDER_KEYS[provider].filter((k) => !k.includes("*")));

  return Object.entries(entries)
    .filter(([key, value]) => {
      if (!value.trim()) return false;
      if (provider === "custom") return isCustomProviderKey(key);
      return allowed.has(key);
    })
    .map(([key]) => key);
}

export const DEFAULT_VAULT_TEMPLATE = `# VB Merkezi .env Kasası
# Her satır: ANAHTAR=değer

OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
CUSTOM_API_KEY=
`;
