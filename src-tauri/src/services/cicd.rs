use std::path::Path;

use crate::models::AddCicdResult;

use super::framework::{build_script, normalize, readme_install_command};
use super::paths::ensure_dir;
use super::profile::expand_path;

fn node_cache(package_manager: &str) -> &'static str {
    match package_manager {
        "pnpm" => "pnpm",
        "yarn" => "yarn",
        "bun" => "bun",
        _ => "npm",
    }
}

fn install_step(package_manager: &str, framework: &str) -> String {
    if normalize(framework) == "flutter" {
        return "flutter pub get".into();
    }
    match package_manager {
        "pnpm" => "pnpm install --frozen-lockfile".into(),
        "yarn" => "yarn install --frozen-lockfile".into(),
        "bun" => "bun install --frozen-lockfile".into(),
        _ => "npm ci".into(),
    }
}

fn build_step(package_manager: &str, framework: &str) -> String {
    if normalize(framework) == "flutter" {
        return "flutter analyze".into();
    }
    let script = build_script(framework);
    match package_manager {
        "pnpm" => format!("pnpm run {script}"),
        "yarn" => format!("yarn {script}"),
        "bun" => format!("bun run {script}"),
        _ => format!("npm run {script}"),
    }
}

fn flutter_workflow() -> &'static str {
    r#"name: VB CI/CD

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          channel: stable
      - name: Install dependencies
        run: flutter pub get
      - name: Analyze
        run: flutter analyze
"#
}

fn node_workflow(package_manager: &str, framework: &str) -> String {
    let cache = node_cache(package_manager);
    let install = install_step(package_manager, framework);
    let build = build_step(package_manager, framework);
    let _ = readme_install_command(package_manager, framework);

    format!(
        r#"name: VB CI/CD

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: {cache}
      - name: Install dependencies
        run: {install}
      - name: Build
        run: {build}
"#
    )
}

pub fn add_github_actions(
    project_path: &str,
    framework: &str,
    package_manager: &str,
) -> Result<AddCicdResult, String> {
    let root = expand_path(project_path)?;
    if !root.is_dir() {
        return Err("Proje klasörü bulunamadı.".into());
    }

    let workflow_dir = root.join(".github").join("workflows");
    let workflow_file = workflow_dir.join("main.yml");

    if workflow_file.exists() {
        return Err(".github/workflows/main.yml zaten mevcut.".into());
    }

    ensure_dir(&workflow_dir)?;

    let content = if normalize(framework) == "flutter" {
        flutter_workflow().to_string()
    } else {
        node_workflow(package_manager, framework)
    };

    std::fs::write(&workflow_file, content)
        .map_err(|e| format!("GitHub Actions dosyası yazılamadı: {e}"))?;

    let display_path = display_workflow_path(&root, &workflow_file);

    Ok(AddCicdResult {
        workflow_path: display_path,
        message: "GitHub Actions workflow oluşturuldu.".into(),
    })
}

fn display_workflow_path(root: &Path, workflow_file: &Path) -> String {
    workflow_file
        .strip_prefix(root)
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| workflow_file.display().to_string())
}
