use crate::models::CreateProjectRequest;
use crate::services::code_editor;
use crate::services::shell::{command_exists, output_to_log, run_command, run_shell_command};

#[derive(Clone, Copy)]
struct DepSpec {
    id: &'static str,
    label: &'static str,
    bins: &'static [&'static str],
    pacman_pkg: Option<&'static str>,
    npm_global: Option<&'static str>,
}

const NODE: DepSpec = DepSpec {
    id: "node",
    label: "Node.js",
    bins: &["node"],
    pacman_pkg: Some("nodejs"),
    npm_global: None,
};

const NPM: DepSpec = DepSpec {
    id: "npm",
    label: "npm",
    bins: &["npm"],
    pacman_pkg: Some("nodejs"),
    npm_global: None,
};

const PNPM: DepSpec = DepSpec {
    id: "pnpm",
    label: "pnpm",
    bins: &["pnpm"],
    pacman_pkg: Some("pnpm"),
    npm_global: Some("pnpm"),
};

const YARN: DepSpec = DepSpec {
    id: "yarn",
    label: "Yarn",
    bins: &["yarn"],
    pacman_pkg: Some("yarn"),
    npm_global: Some("yarn"),
};

const BUN: DepSpec = DepSpec {
    id: "bun",
    label: "Bun",
    bins: &["bun"],
    pacman_pkg: Some("bun"),
    npm_global: None,
};

const DOCKER: DepSpec = DepSpec {
    id: "docker",
    label: "Docker",
    bins: &["docker"],
    pacman_pkg: Some("docker"),
    npm_global: None,
};

const GIT: DepSpec = DepSpec {
    id: "git",
    label: "Git",
    bins: &["git"],
    pacman_pkg: Some("git"),
    npm_global: None,
};

const FLUTTER: DepSpec = DepSpec {
    id: "flutter",
    label: "Flutter",
    bins: &["flutter"],
    pacman_pkg: Some("flutter"),
    npm_global: None,
};

const RUST: DepSpec = DepSpec {
    id: "rust",
    label: "Rust (cargo)",
    bins: &["cargo", "rustc"],
    pacman_pkg: Some("rust"),
    npm_global: None,
};

fn dep_installed(spec: &DepSpec) -> bool {
    spec.bins.iter().any(|bin| command_exists(bin))
}

fn push_if_missing(list: &mut Vec<String>, spec: &DepSpec) {
    if !dep_installed(spec) && !list.iter().any(|id| id == spec.id) {
        list.push(spec.id.to_string());
    }
}

fn editor_available(ai_tool: &str) -> bool {
    for editor_id in code_editor::fallback_order(ai_tool) {
        if let Some(spec) = code_editor::spec_for(editor_id) {
            if spec.programs.iter().any(|p| command_exists(p)) {
                return true;
            }
        }
    }
    false
}

fn collect_specs(request: &CreateProjectRequest) -> Vec<&'static DepSpec> {
    let fw = crate::services::framework::normalize(&request.framework);
    let mut specs: Vec<&'static DepSpec> = Vec::new();

    if fw == "flutter" {
        specs.push(&FLUTTER);
    } else {
        specs.push(&NODE);
        if request.package_manager == "npm" {
            specs.push(&NPM);
        }

        match request.package_manager.as_str() {
            "pnpm" => specs.push(&PNPM),
            "yarn" => specs.push(&YARN),
            "bun" => specs.push(&BUN),
            _ => {}
        }
    }

    if request.integrations.docker_enabled {
        specs.push(&DOCKER);
    }

    if request.launch.git_enabled {
        specs.push(&GIT);
    }

    if fw == "tauri-vite" {
        specs.push(&RUST);
    }

    specs
}

pub fn check_dependencies(request: &CreateProjectRequest) -> Vec<String> {
    let mut missing = Vec::new();

    for spec in collect_specs(request) {
        push_if_missing(&mut missing, spec);
    }

    if !editor_available(&request.ai_tool) {
        missing.push("editor".into());
    }

    missing
}

fn spec_by_id(id: &str) -> Option<&'static DepSpec> {
    match id {
        "node" => Some(&NODE),
        "npm" => Some(&NPM),
        "pnpm" => Some(&PNPM),
        "yarn" => Some(&YARN),
        "bun" => Some(&BUN),
        "docker" => Some(&DOCKER),
        "git" => Some(&GIT),
        "flutter" => Some(&FLUTTER),
        "rust" => Some(&RUST),
        _ => None,
    }
}

fn install_pacman(package: &str, logs: &mut Vec<String>) -> Result<(), String> {
    logs.push(format!("pacman ile kuruluyor: {package}"));

    let output = run_command(
        "pkexec",
        &[
            "pacman",
            "-S",
            "--needed",
            "--noconfirm",
            package,
        ],
        None,
    )?;

    let log = output_to_log(&output);
    if !log.is_empty() {
        logs.push(log);
    }

    if output.status.success() {
        logs.push(format!("{package} kuruldu."));
        Ok(())
    } else {
        let detail = output_to_log(&output);
        Err(if detail.is_empty() {
            format!("pacman kurulumu başarısız: {package}")
        } else {
            format!("pacman kurulumu başarısız ({package}): {detail}")
        })
    }
}

fn npm_global_prefix() -> Option<String> {
    let output = run_shell_command("npm config get prefix 2>/dev/null", None).ok()?;
    if !output.status.success() {
        return None;
    }
    let prefix = output_to_log(&output);
    if prefix.is_empty() || prefix == "undefined" {
        return None;
    }
    Some(prefix)
}

fn install_npm_global(package: &str, logs: &mut Vec<String>) -> Result<(), String> {
    if !command_exists("npm") {
        logs.push("npm bulunamadı — önce Node.js kuruluyor...".into());
        install_pacman("nodejs", logs)?;
    }

    let prefix = npm_global_prefix().unwrap_or_else(|| "/usr".into());
    let needs_root = prefix.starts_with("/usr") && !prefix.starts_with("/usr/local");

    logs.push(format!("npm global kurulum: {package} (prefix: {prefix})"));

    let output = if needs_root {
        logs.push("Sistem geneli npm dizini — yetki isteniyor...".into());
        run_command(
            "pkexec",
            &[
                "npm",
                "install",
                "-g",
                package,
            ],
            None,
        )?
    } else {
        run_shell_command(&format!("npm install -g {package}"), None)?
    };

    let log = output_to_log(&output);
    if !log.is_empty() {
        logs.push(log.clone());
    }

    if output.status.success() {
        logs.push(format!("{package} (npm -g) kuruldu."));
        Ok(())
    } else {
        Err(if log.is_empty() {
            format!("npm global kurulumu başarısız: {package}")
        } else {
            format!("npm global kurulumu başarısız ({package}): {log}")
        })
    }
}

pub fn install_dependencies(
    request: &CreateProjectRequest,
    targets: &[String],
) -> Result<Vec<String>, String> {
    let mut logs = vec!["Bağımlılık kurulumu başlıyor...".into()];

    for id in targets {
        if id == "editor" {
            logs.push(
                "Kod editörü otomatik kurulamaz — Cursor veya VS Code'u manuel yükleyin.".into(),
            );
            continue;
        }

        let Some(spec) = spec_by_id(id) else {
            logs.push(format!("Bilinmeyen bağımlılık atlandı: {id}"));
            continue;
        };

        if dep_installed(spec) {
            logs.push(format!("{} zaten yüklü.", spec.label));
            continue;
        }

        if let Some(pkg) = spec.pacman_pkg {
            if let Err(pacman_err) = install_pacman(pkg, &mut logs) {
                if let Some(npm_pkg) = spec.npm_global {
                    logs.push(format!(
                        "pacman başarısız ({pacman_err}) — npm ile deneniyor..."
                    ));
                    install_npm_global(npm_pkg, &mut logs)?;
                } else {
                    return Err(pacman_err);
                }
            }
        } else if let Some(pkg) = spec.npm_global {
            install_npm_global(pkg, &mut logs)?;
        } else {
            logs.push(format!("{} için otomatik kurulum tanımlı değil.", spec.label));
        }
    }

    let still_missing = check_dependencies(request);
    let blocking: Vec<String> = still_missing
        .into_iter()
        .filter(|id| id != "editor")
        .collect();

    if !blocking.is_empty() {
        return Err(format!(
            "Kurulum sonrası hâlâ eksik: {}",
            blocking.join(", ")
        ));
    }

    logs.push("Tüm gerekli araçlar hazır.".into());
    Ok(logs)
}
