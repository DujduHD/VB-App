# Quick Start & Project Deployment

VB (Veli-Başlatıcı) helps you scaffold a new project in a few steps.

## Creating a new project

1. On **Home**, enter project name, slogan, and logo.
2. Choose platform (Web, Desktop, Mobile) and framework.
3. Set package manager and code editor.
4. Click **Launch** to run scaffold, Git, and deploy configuration automatically.

## Time Capsule

Created projects are saved in the left **Time Capsule** panel. Use **Wake** to reopen a project and trigger terminal and editor automation.

## Deploy targets

From the Launch section, pick Vercel, Netlify, Cloudflare Pages, or Docker. Configuration files are added automatically after creation.

---

# Dependency Checker & Safe Auto-Install

VB checks required tools on your system before starting a project.

## Automatic scan

Dependencies such as Node.js, pnpm/npm, Git, Docker, and your chosen code editor are scanned. Missing tools open the **Dependency Modal**.

## Safe installation

- System packages install only when you approve.
- Code editors are not auto-installed; open them manually after creation.
- Use **Launch Anyway** to continue even if the editor is missing.

---

# API Vault & Automatic Cloudflare DNS

## Central .env Vault

In **My Projects → Central .env Vault**, store API keys encrypted with AES-256. Vault keys can be injected into projects from the **Add API** panel.

## API injection

In **My Projects → Add API**, enter Supabase, Stripe, OpenAI, or custom keys and click **Inject into Project** to append them to `.env.local`.

## Cloudflare DNS

Save your Cloudflare API token under **Settings → Domain**. DNS records can be configured automatically during project creation.

---

# External Project Import & AI (.cursorrules) Rules

## Import external project

Use **Import Project** on the home page to pick an existing folder. VB analyzes framework, package manager, and integrations, then pre-fills the form.

## Import warnings

Unsupported or undetected features show as red warnings. Review them and click **Launch** to add the project to Time Capsule.

## AI rules

On creation, your code editor choice and **global rules** from profile settings are written to `.cursorrules` or editor-specific rule files so your AI assistant understands project context immediately.

## Projects hub

Select a Time Capsule project or draft to manage media injection, CI/CD workflows, showcase images, and API keys from one place.
