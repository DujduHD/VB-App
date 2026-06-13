use std::path::Path;

use super::framework::{
    build_script, dev_script, framework_label, publish_dir, start_script, supports_web_deploy,
    vercel_framework,
};

fn build_cmd(package_manager: &str, script: &str) -> String {
    match package_manager {
        "pnpm" => format!("pnpm run {script}"),
        "yarn" => format!("yarn {script}"),
        "bun" => format!("bun run {script}"),
        _ => format!("npm run {script}"),
    }
}

fn install_cmd(package_manager: &str) -> String {
    match package_manager {
        "pnpm" => "pnpm install".into(),
        "yarn" => "yarn install".into(),
        "bun" => "bun install".into(),
        _ => "npm install".into(),
    }
}

fn slug_name(name: &str) -> String {
    let slug: String = name
        .to_lowercase()
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() {
                c
            } else {
                '-'
            }
        })
        .collect();
    let trimmed = slug.trim_matches('-');
    if trimmed.is_empty() {
        "vb-project".into()
    } else {
        trimmed.into()
    }
}

pub fn write_deploy_configs(
    project_path: &Path,
    deploy_target: &str,
    framework: &str,
    package_manager: &str,
    project_name: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    if deploy_target == "none" {
        return Ok(());
    }

    if !supports_web_deploy(framework) {
        logs.push(format!(
            "Deploy atlandı: {} mobil/native projelerde web deploy desteklenmiyor.",
            framework_label(framework)
        ));
        return Ok(());
    }

    match deploy_target {
        "vercel" => write_vercel(project_path, framework, package_manager, logs)?,
        "netlify" => write_netlify(project_path, framework, package_manager, logs)?,
        "render" => write_render(project_path, framework, package_manager, project_name, logs)?,
        "cloudflare-pages" => {
            write_cloudflare_pages(project_path, framework, package_manager, project_name, logs)?
        }
        "fly-io" => write_fly_io(project_path, framework, package_manager, project_name, logs)?,
        "railway" => write_railway(project_path, framework, package_manager, logs)?,
        "aws-amplify" => write_aws_amplify(project_path, framework, package_manager, logs)?,
        "github-pages" => write_github_pages(project_path, framework, package_manager, logs)?,
        other => return Err(format!("Desteklenmeyen deploy hedefi: {other}")),
    }

    logs.push(format!("Deploy yapılandırması eklendi: {deploy_target}"));
    Ok(())
}

fn write_vercel(
    project_path: &Path,
    framework: &str,
    package_manager: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let fw = vercel_framework(framework);
    let content = format!(
        r#"{{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "{fw}",
  "installCommand": "{install}",
  "buildCommand": "{build}",
  "devCommand": "{dev}"
}}
"#,
        install = install_cmd(package_manager),
        build = build_cmd(package_manager, build_script(framework)),
        dev = build_cmd(package_manager, dev_script(framework)),
    );

    std::fs::write(project_path.join("vercel.json"), content)
        .map_err(|e| format!("vercel.json yazılamadı: {e}"))?;
    logs.push("vercel.json oluşturuldu.".into());
    Ok(())
}

fn write_netlify(
    project_path: &Path,
    framework: &str,
    package_manager: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let publish = publish_dir(framework);
    let content = format!(
        r#"# VB tarafından otomatik oluşturuldu
[build]
  command = "{install} && {build}"
  publish = "{publish}"

[build.environment]
  NODE_VERSION = "20"
"#,
        install = install_cmd(package_manager),
        build = build_cmd(package_manager, build_script(framework)),
    );

    std::fs::write(project_path.join("netlify.toml"), content)
        .map_err(|e| format!("netlify.toml yazılamadı: {e}"))?;
    logs.push("netlify.toml oluşturuldu.".into());
    Ok(())
}

fn write_render(
    project_path: &Path,
    framework: &str,
    package_manager: &str,
    project_name: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let content = format!(
        r#"# VB tarafından otomatik oluşturuldu
services:
  - type: web
    name: {project_name}
    runtime: node
    plan: free
    buildCommand: "{install} && {build}"
    startCommand: "{start}"
    envVars:
      - key: NODE_VERSION
        value: "20"
"#,
        install = install_cmd(package_manager),
        build = build_cmd(package_manager, build_script(framework)),
        start = build_cmd(package_manager, start_script(framework)),
    );

    std::fs::write(project_path.join("render.yaml"), content)
        .map_err(|e| format!("render.yaml yazılamadı: {e}"))?;
    logs.push("render.yaml oluşturuldu.".into());
    Ok(())
}

fn write_cloudflare_pages(
    project_path: &Path,
    framework: &str,
    package_manager: &str,
    project_name: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let publish = publish_dir(framework);
    let content = format!(
        r#"# VB tarafından otomatik oluşturuldu
name = "{slug}"
compatibility_date = "2024-01-01"
pages_build_output_dir = "{publish}"

[build]
command = "{install} && {build}"
"#,
        slug = slug_name(project_name),
        install = install_cmd(package_manager),
        build = build_cmd(package_manager, build_script(framework)),
    );

    std::fs::write(project_path.join("wrangler.toml"), content)
        .map_err(|e| format!("wrangler.toml yazılamadı: {e}"))?;
    logs.push("wrangler.toml oluşturuldu.".into());
    Ok(())
}

fn write_fly_io(
    project_path: &Path,
    framework: &str,
    package_manager: &str,
    project_name: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let content = format!(
        r#"# VB tarafından otomatik oluşturuldu
app = "{slug}"
primary_region = "fra"

[build]

[env]
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1

# Build & start (Dockerfile yoksa Nixpacks/Railpack kullanılır)
# Yerelde: fly launch && fly deploy
# Build: {install} && {build}
# Start: {start}
"#,
        slug = slug_name(project_name),
        install = install_cmd(package_manager),
        build = build_cmd(package_manager, build_script(framework)),
        start = build_cmd(package_manager, start_script(framework)),
    );

    std::fs::write(project_path.join("fly.toml"), content)
        .map_err(|e| format!("fly.toml yazılamadı: {e}"))?;
    logs.push("fly.toml oluşturuldu.".into());
    Ok(())
}

fn write_railway(
    project_path: &Path,
    framework: &str,
    package_manager: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let content = format!(
        r#"# VB tarafından otomatik oluşturuldu
[build]
builder = "nixpacks"
buildCommand = "{install} && {build}"

[deploy]
startCommand = "{start}"
restartPolicyType = "on_failure"
"#,
        install = install_cmd(package_manager),
        build = build_cmd(package_manager, build_script(framework)),
        start = build_cmd(package_manager, start_script(framework)),
    );

    std::fs::write(project_path.join("railway.toml"), content)
        .map_err(|e| format!("railway.toml yazılamadı: {e}"))?;
    logs.push("railway.toml oluşturuldu.".into());
    Ok(())
}

fn write_aws_amplify(
    project_path: &Path,
    framework: &str,
    package_manager: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let publish = publish_dir(framework);
    let content = format!(
        r#"# VB tarafından otomatik oluşturuldu
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - {install}
    build:
      commands:
        - {build}
  artifacts:
    baseDirectory: {publish}
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
"#,
        install = install_cmd(package_manager),
        build = build_cmd(package_manager, build_script(framework)),
    );

    std::fs::write(project_path.join("amplify.yml"), content)
        .map_err(|e| format!("amplify.yml yazılamadı: {e}"))?;
    logs.push("amplify.yml oluşturuldu.".into());
    Ok(())
}

fn write_github_pages(
    project_path: &Path,
    framework: &str,
    package_manager: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let publish = publish_dir(framework);
    let install = install_cmd(package_manager);
    let build = build_cmd(package_manager, build_script(framework));

    let content = format!(
        r#"# VB tarafından otomatik oluşturuldu
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - name: Install dependencies
        run: "{install}"
      - name: Build
        run: "{build}"
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "{publish}"

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{{{ steps.deployment.outputs.page_url }}}}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
"#,
    );

    let workflow_dir = project_path.join(".github").join("workflows");
    std::fs::create_dir_all(&workflow_dir)
        .map_err(|e| format!(".github/workflows oluşturulamadı: {e}"))?;
    std::fs::write(workflow_dir.join("deploy.yml"), content)
        .map_err(|e| format!("deploy.yml yazılamadı: {e}"))?;
    logs.push(".github/workflows/deploy.yml oluşturuldu.".into());
    Ok(())
}
