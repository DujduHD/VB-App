import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import App from "./App";
import "./index.css";
import { loadAppearanceSettings } from "./services/appearanceStorage";

const appearance = loadAppearanceSettings();
const root = document.documentElement;
root.dataset.accent = appearance.accentColor;
root.dataset.density = appearance.density;
root.dataset.terminalFont = appearance.terminalFont;
root.dataset.animation = appearance.animationLevel;

const storedTheme = localStorage.getItem("vb-theme") as
  | "light"
  | "dark"
  | "system"
  | null;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const resolvedTheme =
  storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : prefersDark
      ? "dark"
      : "light";
root.classList.toggle("dark", resolvedTheme === "dark");
root.style.colorScheme = resolvedTheme;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
