import type { BaasProvider } from "../types/project";

export type BaasCategory =
  | "postgres"
  | "sqlite"
  | "nosql"
  | "redis"
  | "upstash"
  | "analytics";

export type BaasFormType =
  | "supabase"
  | "firebase"
  | "connection"
  | "url-token"
  | "url-token-secret"
  | "aws-dynamodb";

export interface BaasProviderMeta {
  label: string;
  desc: string;
  category: BaasCategory;
  formType: BaasFormType;
  urlLabel?: string;
  urlPlaceholder?: string;
  tokenLabel?: string;
  tokenPlaceholder?: string;
  secretLabel?: string;
  secretPlaceholder?: string;
}

export const baasCategoryLabels: Record<BaasCategory, string> = {
  postgres: "Postgres",
  sqlite: "SQLite",
  nosql: "NoSQL",
  redis: "Redis",
  upstash: "Upstash",
  analytics: "Analitik",
};

export const baasProviderMeta: Record<
  Exclude<BaasProvider, "none">,
  BaasProviderMeta
> = {
  neon: {
    label: "Neon",
    desc: "Sunucusuz Postgres",
    category: "postgres",
    formType: "connection",
    urlLabel: "Connection String",
    urlPlaceholder: "postgresql://user:pass@ep-xxx.neon.tech/neondb",
  },
  supabase: {
    label: "Supabase",
    desc: "Postgres + Auth + Storage",
    category: "postgres",
    formType: "supabase",
  },
  nile: {
    label: "Nile",
    desc: "B2B için Postgres",
    category: "postgres",
    formType: "connection",
    urlLabel: "Database URL",
    urlPlaceholder: "postgresql://...",
  },
  "prisma-postgres": {
    label: "Prisma Postgres",
    desc: "Anında sunucusuz Postgres",
    category: "postgres",
    formType: "connection",
    urlLabel: "DATABASE_URL",
    urlPlaceholder: "prisma+postgres://...",
  },
  "aws-aurora-postgres": {
    label: "Aurora PostgreSQL",
    desc: "AWS sunucusuz Postgres",
    category: "postgres",
    formType: "connection",
    urlLabel: "Connection String",
    urlPlaceholder: "postgresql://...",
  },
  "aws-aurora-dsql": {
    label: "Aurora DSQL",
    desc: "AWS dağıtık SQL",
    category: "postgres",
    formType: "connection",
    urlLabel: "DSQL Endpoint",
    urlPlaceholder: "https://...",
  },
  turso: {
    label: "Turso",
    desc: "Sunucusuz SQLite",
    category: "sqlite",
    formType: "url-token",
    urlLabel: "Database URL",
    urlPlaceholder: "libsql://xxx.turso.io",
    tokenLabel: "Auth Token",
    tokenPlaceholder: "eyJhbG...",
  },
  "mongodb-atlas": {
    label: "MongoDB Atlas",
    desc: "Geliştirici NoSQL DB",
    category: "nosql",
    formType: "connection",
    urlLabel: "MongoDB URI",
    urlPlaceholder: "mongodb+srv://...",
  },
  "aws-dynamodb": {
    label: "DynamoDB",
    desc: "AWS NoSQL",
    category: "nosql",
    formType: "aws-dynamodb",
    urlLabel: "AWS Region",
    urlPlaceholder: "eu-central-1",
    tokenLabel: "Access Key ID",
    secretLabel: "Secret Access Key",
  },
  convex: {
    label: "Convex",
    desc: "Reaktif veritabanı",
    category: "nosql",
    formType: "url-token",
    urlLabel: "Deployment URL",
    urlPlaceholder: "https://xxx.convex.cloud",
    tokenLabel: "Deploy Key (opsiyonel)",
  },
  firebase: {
    label: "Firebase",
    desc: "Firestore + Auth",
    category: "nosql",
    formType: "firebase",
  },
  "upstash-redis": {
    label: "Upstash Redis",
    desc: "Sunucusuz Redis",
    category: "redis",
    formType: "url-token",
    urlLabel: "REST URL",
    urlPlaceholder: "https://xxx.upstash.io",
    tokenLabel: "REST Token",
  },
  "vercel-redis": {
    label: "Vercel Redis",
    desc: "Resmi Redis entegrasyonu",
    category: "redis",
    formType: "url-token",
    urlLabel: "KV REST URL",
    urlPlaceholder: "https://xxx.kv.vercel-storage.com",
    tokenLabel: "KV REST Token",
  },
  "upstash-vector": {
    label: "Upstash Vector",
    desc: "Vektör veritabanı",
    category: "upstash",
    formType: "url-token",
    urlLabel: "Vector URL",
    urlPlaceholder: "https://xxx-vector.upstash.io",
    tokenLabel: "Vector Token",
  },
  "upstash-qstash": {
    label: "Upstash QStash",
    desc: "İş akışı & kuyruk",
    category: "upstash",
    formType: "url-token",
    urlLabel: "QStash URL",
    urlPlaceholder: "https://qstash.upstash.io",
    tokenLabel: "QStash Token",
  },
  "upstash-search": {
    label: "Upstash Search",
    desc: "Tam metin arama",
    category: "upstash",
    formType: "url-token",
    urlLabel: "Search URL",
    urlPlaceholder: "https://xxx.upstash.io",
    tokenLabel: "Search Token",
  },
  motherduck: {
    label: "MotherDuck",
    desc: "Analitik veritabanı",
    category: "analytics",
    formType: "url-token",
    urlLabel: "MotherDuck Token",
    urlPlaceholder: "md:...",
    tokenLabel: "Database (opsiyonel)",
    tokenPlaceholder: "my_db",
  },
};

export const baasProvidersByCategory: Record<
  BaasCategory,
  Exclude<BaasProvider, "none">[]
> = {
  postgres: [
    "neon",
    "supabase",
    "nile",
    "prisma-postgres",
    "aws-aurora-postgres",
    "aws-aurora-dsql",
  ],
  sqlite: ["turso"],
  nosql: ["mongodb-atlas", "aws-dynamodb", "convex", "firebase"],
  redis: ["upstash-redis", "vercel-redis"],
  upstash: ["upstash-vector", "upstash-qstash", "upstash-search"],
  analytics: ["motherduck"],
};

export const baasCategoryOrder: BaasCategory[] = [
  "postgres",
  "sqlite",
  "nosql",
  "redis",
  "upstash",
  "analytics",
];

export const ALL_BAAS_PROVIDERS = Object.keys(
  baasProviderMeta,
) as Exclude<BaasProvider, "none">[];

export function getBaasLabel(provider: string): string {
  if (provider === "none") return "Yok";
  return (
    baasProviderMeta[provider as Exclude<BaasProvider, "none">]?.label ??
    provider
  );
}
