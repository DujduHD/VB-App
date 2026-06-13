const LABELS: Record<string, string> = {
  node: "Node.js",
  npm: "npm",
  pnpm: "pnpm",
  yarn: "Yarn",
  bun: "Bun",
  docker: "Docker",
  git: "Git",
  flutter: "Flutter",
  rust: "Rust (cargo)",
  editor: "Kod editörü (Cursor / VS Code)",
};

export function dependencyLabel(id: string): string {
  return LABELS[id] ?? id;
}
