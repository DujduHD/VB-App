import { frameworkMeta } from "../constants/platforms";
import type { AppPlatform, Framework } from "../types/project";
import { platformLabels } from "./projectLabels";

export interface VitrinShareImageInput {
  name: string;
  slogan: string;
  framework: Framework;
  platform: AppPlatform;
  logoUrl: string | null;
  deployLabel?: string;
  createdLabel?: string;
}

function accentColor(): string {
  if (typeof document === "undefined") return "#6366f1";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-vb-accent")
    .trim();
  return value || "#6366f1";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Logo yüklenemedi"));
    img.src = src;
  });
}

function frameworkInitial(framework: Framework): string {
  const label = frameworkMeta[framework]?.label ?? framework;
  return label.slice(0, 2).toUpperCase();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let line = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const next = `${line} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      lines.push(line);
      line = words[i];
    }
  }
  lines.push(line);
  return lines;
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function vitrinShareFileName(name: string): string {
  const slug = slugify(name) || "proje";
  return `${slug}-vitrin.png`;
}

export async function renderVitrinShareImage(
  input: VitrinShareImageInput,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas oluşturulamadı");

  const accent = accentColor();

  const bg = ctx.createLinearGradient(0, 0, 1200, 630);
  bg.addColorStop(0, "#fafafa");
  bg.addColorStop(0.55, "#ffffff");
  bg.addColorStop(1, `${accent}18`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 630);

  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 1200, 6);

  const logoSize = 112;
  const logoX = 80;
  const logoY = 72;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e4e4e7";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(logoX, logoY, logoSize, logoSize, 24);
  ctx.fill();
  ctx.stroke();

  let drewLogo = false;
  if (input.logoUrl) {
    try {
      const src = input.logoUrl.startsWith("http")
        ? input.logoUrl
        : input.logoUrl.startsWith("file://")
          ? input.logoUrl
          : `file://${input.logoUrl}`;
      const img = await loadImage(src);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX + 2, logoY + 2, logoSize - 4, logoSize - 4, 22);
      ctx.clip();
      ctx.drawImage(img, logoX + 2, logoY + 2, logoSize - 4, logoSize - 4);
      ctx.restore();
      drewLogo = true;
    } catch {
      drewLogo = false;
    }
  }

  if (!drewLogo) {
    ctx.fillStyle = accent;
    ctx.font = "bold 36px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      frameworkInitial(input.framework),
      logoX + logoSize / 2,
      logoY + logoSize / 2,
    );
  }

  const textX = logoX + logoSize + 36;
  const textMaxWidth = 1200 - textX - 80;

  ctx.textAlign = "left";
  ctx.fillStyle = "#18181b";
  ctx.font = "bold 52px system-ui, sans-serif";
  const nameLines = wrapText(ctx, input.name, textMaxWidth).slice(0, 2);
  nameLines.forEach((line, index) => {
    ctx.fillText(line, textX, logoY + 36 + index * 58);
  });

  if (input.slogan.trim()) {
    ctx.fillStyle = "#71717a";
    ctx.font = "28px system-ui, sans-serif";
    const sloganLines = wrapText(ctx, input.slogan.trim(), textMaxWidth).slice(
      0,
      2,
    );
    const sloganY = logoY + 36 + nameLines.length * 58 + 12;
    sloganLines.forEach((line, index) => {
      ctx.fillText(line, textX, sloganY + index * 36);
    });
  }

  const cardY = 260;
  const cardGap = 20;
  const cardW = 340;
  const cardH = 120;
  const cards: { label: string; value: string }[] = [
    {
      label: "Framework",
      value: frameworkMeta[input.framework]?.label ?? input.framework,
    },
    {
      label: "Platform",
      value: platformLabels[input.platform],
    },
  ];

  if (input.deployLabel) {
    cards.push({ label: "Deploy", value: input.deployLabel });
  }
  if (input.createdLabel) {
    cards.push({ label: "Oluşturulma", value: input.createdLabel });
  }

  cards.slice(0, 3).forEach((card, index) => {
    const x = 80 + index * (cardW + cardGap);
    ctx.fillStyle = "#ffffffcc";
    ctx.strokeStyle = "#e4e4e7";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, cardY, cardW, cardH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "600 14px system-ui, sans-serif";
    ctx.fillText(card.label.toUpperCase(), x + 20, cardY + 34);

    ctx.fillStyle = "#27272a";
    ctx.font = "600 24px system-ui, sans-serif";
    const valueLines = wrapText(ctx, card.value, cardW - 40).slice(0, 2);
    valueLines.forEach((line, lineIndex) => {
      ctx.fillText(line, x + 20, cardY + 68 + lineIndex * 30);
    });
  });

  ctx.fillStyle = accent;
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillText("VB · Veli-Başlatıcı", 80, 580);

  return canvas.toDataURL("image/png");
}
