use std::collections::HashMap;
use std::path::Path;

use serde_json::Value;

use super::framework::{is_desktop_native, is_mobile, normalize};
use super::profile::expand_path;

const SUPPORTED_FRAMEWORKS: &[&str] = &[
    "nextjs-blank",
    "nextjs-auth",
    "vite-react",
    "vite-vue",
    "vite-svelte",
    "remix",
    "astro",
    "nuxt",
    "sveltekit",
    "tauri-vite",
    "electron-vite",
    "expo-blank",
    "expo-router",
    "react-native-supabase",
    "flutter",
];
const SUPPORTED_DEPLOY_TARGETS: &[&str] = &[
    "none",
    "vercel",
    "netlify",
    "render",
    "cloudflare-pages",
    "fly-io",
    "railway",
    "aws-amplify",
    "github-pages",
];

pub struct ProjectAnalysisResult {
    pub project_name: String,
    pub platform: String,
    pub package_manager: String,
    pub framework: String,
    pub deploy_target: String,
    pub git_enabled: bool,
    pub docker_enabled: bool,
    pub unknown_fields: Vec<String>,
}

pub fn analyze_project(path: &str) -> Result<ProjectAnalysisResult, String> {
    let root = expand_path(path)?;
    if !root.exists() {
        return Err(format!("Proje klasörü bulunamadı: {}", root.display()));
    }
    if !root.is_dir() {
        return Err("Geçerli bir proje klasörü seçin.".into());
    }

    let mut unknown_fields = Vec::new();

    let project_name = detect_project_name(&root);
    let (package_manager, pm_unknown) = detect_package_manager(&root);
    if pm_unknown {
        unknown_fields.push("packageManager".into());
    }

    let (framework, fw_unknown) = detect_framework(&root);
    if fw_unknown {
        unknown_fields.push("framework".into());
    }

    let platform = detect_platform(&framework);

    let (deploy_target, deploy_unknown) = detect_deploy_target(&root);
    if deploy_unknown {
        unknown_fields.push("deployTarget".into());
    }

    let git_enabled = root.join(".git").is_dir();
    let docker_enabled = root.join("docker-compose.yml").is_file()
        || root.join("docker-compose.yaml").is_file();

    Ok(ProjectAnalysisResult {
        project_name,
        platform,
        package_manager,
        framework,
        deploy_target,
        git_enabled,
        docker_enabled,
        unknown_fields,
    })
}

fn detect_project_name(root: &Path) -> String {
    if let Some(pkg) = read_package_json(root) {
        if let Some(name) = pkg.get("name").and_then(|v| v.as_str()) {
            let trimmed = name.trim();
            if !trimmed.is_empty() {
                return humanize_package_name(trimmed);
            }
        }
    }

    root.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Imported Project")
        .to_string()
}

fn humanize_package_name(name: &str) -> String {
    name.split('/')
        .next_back()
        .unwrap_or(name)
        .replace(['-', '_'], " ")
        .split_whitespace()
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                Some(first) => {
                    let mut result = first.to_uppercase().to_string();
                    result.push_str(chars.as_str());
                    result
                }
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn detect_package_manager(root: &Path) -> (String, bool) {
    if root.join("pnpm-lock.yaml").is_file() {
        return ("pnpm".into(), false);
    }
    if root.join("yarn.lock").is_file() {
        return ("yarn".into(), false);
    }
    if root.join("bun.lockb").is_file() || root.join("bun.lock").is_file() {
        return ("bun".into(), false);
    }
    if root.join("package-lock.json").is_file() {
        return ("npm".into(), false);
    }

    if root.join("package.json").is_file() {
        ("npm".into(), true)
    } else {
        ("npm".into(), true)
    }
}

fn detect_platform(framework: &str) -> String {
    if is_mobile(framework) {
        "mobile".into()
    } else if is_desktop_native(framework) {
        "desktop".into()
    } else {
        "web".into()
    }
}

fn detect_deploy_target(root: &Path) -> (String, bool) {
    let mappings: [(&str, &str); 7] = [
        ("vercel.json", "vercel"),
        ("netlify.toml", "netlify"),
        ("render.yaml", "render"),
        ("wrangler.toml", "cloudflare-pages"),
        ("fly.toml", "fly-io"),
        ("railway.toml", "railway"),
        ("amplify.yml", "aws-amplify"),
    ];

    for (file, target) in mappings {
        if root.join(file).is_file() {
            if SUPPORTED_DEPLOY_TARGETS.contains(&target) {
                return (target.into(), false);
            }
            return ("none".into(), true);
        }
    }

    if root.join(".github").join("workflows").is_dir() {
        if has_github_pages_workflow(root) {
            return ("github-pages".into(), false);
        }
    }

    ("none".into(), false)
}

fn has_github_pages_workflow(root: &Path) -> bool {
    let workflows = root.join(".github").join("workflows");
    let Ok(entries) = std::fs::read_dir(workflows) else {
        return false;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("yml")
            && path.extension().and_then(|e| e.to_str()) != Some("yaml")
        {
            continue;
        }
        if let Ok(content) = std::fs::read_to_string(&path) {
            if content.contains("github-pages") || content.contains("pages deploy") {
                return true;
            }
        }
    }

    false
}

fn detect_framework(root: &Path) -> (String, bool) {
    if root.join("pubspec.yaml").is_file() {
        return validate_framework("flutter");
    }

    let Some(pkg) = read_package_json(root) else {
        return ("vite-react".into(), true);
    };

    let deps = merged_dependencies(&pkg);

    if deps.contains_key("next") {
        let fw = if deps.contains_key("next-auth") || deps.contains_key("@auth/core") {
            "nextjs-auth"
        } else {
            "nextjs-blank"
        };
        return validate_framework(fw);
    }

    if deps.contains_key("nuxt") || deps.contains_key("nuxt3") {
        return validate_framework("nuxt");
    }

    if deps.contains_key("@sveltejs/kit") {
        return validate_framework("sveltekit");
    }

    if deps.contains_key("astro") {
        return validate_framework("astro");
    }

    if deps.contains_key("@remix-run/node")
        || deps.contains_key("@remix-run/react")
        || deps.contains_key("@remix-run/dev")
    {
        return validate_framework("remix");
    }

    if deps.contains_key("@tauri-apps/api") || deps.contains_key("@tauri-apps/cli") {
        return validate_framework("tauri-vite");
    }

    if deps.contains_key("electron") || deps.contains_key("electron-vite") {
        return validate_framework("electron-vite");
    }

    if deps.contains_key("expo") || deps.contains_key("expo-router") {
        if deps.contains_key("expo-router") {
            return validate_framework("expo-router");
        }
        if deps.contains_key("@supabase/supabase-js")
            && (deps.contains_key("react-native") || deps.contains_key("expo"))
        {
            return validate_framework("react-native-supabase");
        }
        return validate_framework("expo-blank");
    }

    if deps.contains_key("react-native") {
        if deps.contains_key("@supabase/supabase-js") {
            return validate_framework("react-native-supabase");
        }
        return validate_framework("expo-blank");
    }

    if deps.contains_key("vite") {
        if deps.contains_key("vue") || deps.contains_key("@vitejs/plugin-vue") {
            return validate_framework("vite-vue");
        }
        if deps.contains_key("svelte") || deps.contains_key("@sveltejs/vite-plugin-svelte") {
            return validate_framework("vite-svelte");
        }
        if deps.contains_key("react") || deps.contains_key("@vitejs/plugin-react") {
            return validate_framework("vite-react");
        }
        return validate_framework("vite-react");
    }

    if deps.contains_key("react") {
        return validate_framework("vite-react");
    }

    if deps.contains_key("vue") {
        return validate_framework("vite-vue");
    }

    if deps.contains_key("svelte") {
        return validate_framework("vite-svelte");
    }

    ("vite-react".into(), true)
}

fn validate_framework(framework: &str) -> (String, bool) {
    let normalized = normalize(framework).to_string();
    if SUPPORTED_FRAMEWORKS.contains(&normalized.as_str()) {
        (normalized, false)
    } else {
        (normalized, true)
    }
}

fn read_package_json(root: &Path) -> Option<Value> {
    let content = std::fs::read_to_string(root.join("package.json")).ok()?;
    serde_json::from_str(&content).ok()
}

fn merged_dependencies(pkg: &Value) -> HashMap<String, Value> {
    let mut deps = HashMap::new();
    for key in ["dependencies", "devDependencies", "peerDependencies"] {
        if let Some(obj) = pkg.get(key).and_then(|v| v.as_object()) {
            for (name, value) in obj {
                deps.insert(name.clone(), value.clone());
            }
        }
    }
    deps
}
