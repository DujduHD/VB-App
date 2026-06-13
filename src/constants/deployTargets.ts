import type { DeployTarget } from "../types/project";

export interface DeployTargetOption {
  value: DeployTarget;
  label: string;
  description: string;
  configFile?: string;
}

export const deployTargetOptions: DeployTargetOption[] = [
  {
    value: "none",
    label: "Yok",
    description: "Deploy dosyası eklenmez",
  },
  {
    value: "vercel",
    label: "Vercel",
    description: "Next.js ve full-stack için sıfır yapılandırma deploy",
    configFile: "vercel.json",
  },
  {
    value: "netlify",
    label: "Netlify",
    description: "JAMstack ve statik siteler için hızlı global CDN",
    configFile: "netlify.toml",
  },
  {
    value: "render",
    label: "Render",
    description: "Web servisleri, API ve veritabanı tek platformda",
    configFile: "render.yaml",
  },
  {
    value: "cloudflare-pages",
    label: "Cloudflare Pages",
    description: "Uç noktada (Edge) süper hızlı statik ve full-stack siteler",
    configFile: "wrangler.toml",
  },
  {
    value: "fly-io",
    label: "Fly.io",
    description: "Docker tabanlı uygulamaları global (farklı kıtalara) dağıt",
    configFile: "fly.toml",
  },
  {
    value: "railway",
    label: "Railway",
    description: "Sıfır ayar, anında deploy (Heroku'nun modern alternatifi)",
    configFile: "railway.toml",
  },
  {
    value: "aws-amplify",
    label: "AWS Amplify",
    description: "AWS gücüyle ölçeklenebilir full-stack React/Next.js uygulamaları",
    configFile: "amplify.yml",
  },
  {
    value: "github-pages",
    label: "GitHub Pages",
    description: "Vite/Astro gibi statik projeler için CI/CD ile ücretsiz barındırma",
    configFile: "deploy.yml",
  },
];

export const deployLabels: Record<DeployTarget, string> = {
  ...(Object.fromEntries(
    deployTargetOptions.map(({ value, label }) => [value, label]),
  ) as Record<DeployTarget, string>),
  none: "Deploy yok",
};
