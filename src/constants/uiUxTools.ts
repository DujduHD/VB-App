import type { UiUxTool } from "../types/project";

export type UiUxCategory =
  | "design"
  | "3d"
  | "ai"
  | "collab"
  | "inspiration";

export const uiUxCategoryLabels: Record<UiUxCategory, string> = {
  design: "Tasarım",
  "3d": "3D & Motion",
  ai: "AI UI",
  collab: "Wireframe",
  inspiration: "İlham",
};

export interface UiUxToolMeta {
  label: string;
  desc: string;
  category: UiUxCategory;
}

export const uiUxToolMeta: Record<UiUxTool, UiUxToolMeta> = {
  none: {
    label: "Yok",
    desc: "UI/UX aracı açılmaz",
    category: "design",
  },
  figma: {
    label: "Figma",
    desc: "UI tasarım & prototip",
    category: "design",
  },
  framer: {
    label: "Framer",
    desc: "Canlı prototip & site",
    category: "design",
  },
  penpot: {
    label: "Penpot",
    desc: "Açık kaynak tasarım",
    category: "design",
  },
  canva: {
    label: "Canva",
    desc: "Hızlı görsel & mockup",
    category: "design",
  },
  spline: {
    label: "Spline",
    desc: "3D sahneler & animasyon",
    category: "3d",
  },
  stick: {
    label: "Stick",
    desc: "AI ile UI üretimi",
    category: "ai",
  },
  v0: {
    label: "v0",
    desc: "Vercel AI arayüz üretici",
    category: "ai",
  },
  uizard: {
    label: "Uizard",
    desc: "Metinden UI mockup",
    category: "ai",
  },
  relume: {
    label: "Relume",
    desc: "Site haritası & wireframe",
    category: "ai",
  },
  miro: {
    label: "Miro",
    desc: "Beyaz tahta & akış",
    category: "collab",
  },
  excalidraw: {
    label: "Excalidraw",
    desc: "El çizimi wireframe",
    category: "collab",
  },
  dribbble: {
    label: "Dribbble",
    desc: "UI ilham galerisi",
    category: "inspiration",
  },
  mobbin: {
    label: "Mobbin",
    desc: "Mobil UI referansları",
    category: "inspiration",
  },
};

export const uiUxToolsByCategory: Record<
  UiUxCategory,
  Exclude<UiUxTool, "none">[]
> = {
  design: ["figma", "framer", "penpot", "canva"],
  "3d": ["spline"],
  ai: ["stick", "v0", "uizard", "relume"],
  collab: ["miro", "excalidraw"],
  inspiration: ["dribbble", "mobbin"],
};

export const ALL_UI_UX_TOOLS = Object.keys(uiUxToolMeta) as UiUxTool[];

export const uiUxCategoryOrder: UiUxCategory[] = [
  "design",
  "3d",
  "ai",
  "collab",
  "inspiration",
];
