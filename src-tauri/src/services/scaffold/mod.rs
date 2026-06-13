mod helpers;

use std::path::{Path, PathBuf};

use helpers::{install_deps, pm_program, pm_use_flag, run_and_log, run_npx_create};

pub fn scaffold_project(
    framework: &str,
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
) -> Result<(PathBuf, Vec<String>), String> {
    let project_path = parent_dir.join(slug);

    if project_path.exists() {
        return Err(format!(
            "'{}' dizini zaten mevcut: {}",
            slug,
            project_path.display()
        ));
    }

    let mut logs = Vec::new();
    let fw = crate::services::framework::normalize(framework);

    match fw {
        "nextjs-blank" | "nextjs-auth" => {
            logs.push(format!("Next.js iskeleti ({package_manager})..."));
            scaffold_nextjs(slug, package_manager, parent_dir, &mut logs)?;
        }
        "vite-react" => {
            logs.push(format!("Vite + React ({package_manager})..."));
            scaffold_vite(slug, package_manager, parent_dir, "react-ts", &mut logs)?;
        }
        "vite-vue" => {
            logs.push(format!("Vite + Vue ({package_manager})..."));
            scaffold_vite(slug, package_manager, parent_dir, "vue-ts", &mut logs)?;
        }
        "vite-svelte" => {
            logs.push(format!("Vite + Svelte ({package_manager})..."));
            scaffold_vite(slug, package_manager, parent_dir, "svelte-ts", &mut logs)?;
        }
        "remix" => {
            logs.push(format!("Remix ({package_manager})..."));
            scaffold_remix(slug, package_manager, parent_dir, &mut logs)?;
        }
        "astro" => {
            logs.push(format!("Astro ({package_manager})..."));
            scaffold_astro(slug, package_manager, parent_dir, &mut logs)?;
        }
        "nuxt" => {
            logs.push(format!("Nuxt ({package_manager})..."));
            scaffold_nuxt(slug, package_manager, parent_dir, &mut logs)?;
        }
        "sveltekit" => {
            logs.push(format!("SvelteKit ({package_manager})..."));
            scaffold_sveltekit(slug, package_manager, parent_dir, &mut logs)?;
        }
        "tauri-vite" => {
            logs.push(format!("Tauri + Vite ({package_manager})..."));
            scaffold_tauri(slug, package_manager, parent_dir, &mut logs)?;
        }
        "electron-vite" => {
            logs.push(format!("Electron + Vite ({package_manager})..."));
            scaffold_electron(slug, package_manager, parent_dir, &mut logs)?;
        }
        "expo-blank" => {
            logs.push(format!("Expo Blank ({package_manager})..."));
            scaffold_expo(slug, package_manager, parent_dir, "blank-typescript", &mut logs)?;
        }
        "expo-router" => {
            logs.push(format!("Expo Router ({package_manager})..."));
            scaffold_expo(slug, package_manager, parent_dir, "tabs", &mut logs)?;
        }
        "react-native-supabase" => {
            logs.push(format!("Expo + Supabase ({package_manager})..."));
            scaffold_expo(slug, package_manager, parent_dir, "blank-typescript", &mut logs)?;
        }
        "flutter" => {
            logs.push("Flutter iskeleti...".into());
            scaffold_flutter(slug, parent_dir, &mut logs)?;
        }
        other => return Err(format!("Desteklenmeyen framework: {other}")),
    }

    if !project_path.exists() {
        return Err("Proje dizini oluşturulamadı.".into());
    }

    logs.push(format!("Proje dizini hazır: {}", project_path.display()));
    Ok((project_path, logs))
}

fn scaffold_nextjs(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let use_flag = pm_use_flag(package_manager);
    let args: Vec<&str> = match package_manager {
        "pnpm" | "yarn" => vec![
            "dlx",
            "create-next-app@latest",
            slug,
            "--typescript",
            "--tailwind",
            "--eslint",
            "--app",
            "--src-dir",
            "--import-alias",
            "@/*",
            "--yes",
            use_flag,
        ],
        "bun" => vec![
            "create-next-app@latest",
            slug,
            "--typescript",
            "--tailwind",
            "--eslint",
            "--app",
            "--src-dir",
            "--import-alias",
            "@/*",
            "--yes",
            use_flag,
        ],
        _ => vec![
            "--yes",
            "create-next-app@latest",
            slug,
            "--typescript",
            "--tailwind",
            "--eslint",
            "--app",
            "--src-dir",
            "--import-alias",
            "@/*",
            use_flag,
        ],
    };
    run_and_log(
        pm_program(package_manager),
        &args,
        Some(parent_dir),
        logs,
        "create-next-app başarısız",
    )
}

fn scaffold_vite(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    template: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    use crate::services::shell::{output_to_log, run_command};

    let result = match package_manager {
        "pnpm" => run_command(
            "pnpm",
            &["create", "vite", slug, "--template", template],
            Some(parent_dir),
        ),
        "yarn" => run_command(
            "yarn",
            &["create", "vite", slug, "--template", template],
            Some(parent_dir),
        ),
        "bun" => run_command(
            "bun",
            &["create", "vite", slug, "--template", template],
            Some(parent_dir),
        ),
        _ => run_command(
            "npm",
            &["create", "vite@latest", slug, "--", "--template", template],
            Some(parent_dir),
        ),
    }?;

    let log = output_to_log(&result);
    if !log.is_empty() {
        logs.push(log);
    }
    if !result.status.success() {
        return Err(format!(
            "Vite iskeleti oluşturulamadı (kod: {:?})",
            result.status.code()
        ));
    }

    install_deps(&parent_dir.join(slug), package_manager, logs)
}

fn scaffold_remix(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    run_npx_create(
        slug,
        package_manager,
        parent_dir,
        "create-remix@latest",
        &["--yes", "--no-git-init", "--install"],
        logs,
        "Remix",
    )
}

fn scaffold_astro(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let args: Vec<&str> = vec![
        "--",
        "--template",
        "basics",
        "--typescript",
        "strict",
        "--install",
        "yes",
        "--git",
        "false",
        "--yes",
    ];
    run_npx_create(
        slug,
        package_manager,
        parent_dir,
        "create-astro@latest",
        &args,
        logs,
        "Astro",
    )
}

fn scaffold_nuxt(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let pm_flag = match package_manager {
        "pnpm" => "pnpm",
        "yarn" => "yarn",
        "bun" => "bun",
        _ => "npm",
    };

    let args: Vec<&str> = match package_manager {
        "pnpm" | "yarn" => vec![
            "dlx",
            "nuxi@latest",
            "init",
            slug,
            "--packageManager",
            pm_flag,
            "--no-gitInit",
            "--force",
        ],
        "bun" => vec![
            "nuxi@latest",
            "init",
            slug,
            "--packageManager",
            pm_flag,
            "--no-gitInit",
            "--force",
        ],
        _ => vec![
            "--yes",
            "nuxi@latest",
            "init",
            slug,
            "--packageManager",
            pm_flag,
            "--no-gitInit",
            "--force",
        ],
    };

    run_and_log(
        pm_program(package_manager),
        &args,
        Some(parent_dir),
        logs,
        "Nuxt oluşturulamadı",
    )
}

fn scaffold_sveltekit(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let args: Vec<&str> = match package_manager {
        "pnpm" | "yarn" => vec![
            "dlx",
            "sv@latest",
            "create",
            slug,
            "--template",
            "minimal",
            "--types",
            "ts",
            "--no-install",
        ],
        "bun" => vec![
            "sv@latest",
            "create",
            slug,
            "--template",
            "minimal",
            "--types",
            "ts",
            "--no-install",
        ],
        _ => vec![
            "--yes",
            "sv@latest",
            "create",
            slug,
            "--template",
            "minimal",
            "--types",
            "ts",
            "--no-install",
        ],
    };

    run_and_log(
        pm_program(package_manager),
        &args,
        Some(parent_dir),
        logs,
        "SvelteKit oluşturulamadı",
    )?;
    install_deps(&parent_dir.join(slug), package_manager, logs)
}

fn scaffold_tauri(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let pm = match package_manager {
        "pnpm" => "pnpm",
        "yarn" => "yarn",
        "bun" => "bun",
        _ => "npm",
    };
    run_npx_create(
        slug,
        package_manager,
        parent_dir,
        "create-tauri-app@latest",
        &["--template", "react-ts", "--manager", pm, "--yes"],
        logs,
        "Tauri",
    )
}

fn scaffold_electron(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let args: Vec<&str> = match package_manager {
        "pnpm" | "yarn" => vec![
            "dlx",
            "create-electron-vite@latest",
            slug,
            "--template",
            "react",
        ],
        "bun" => vec![
            "create-electron-vite@latest",
            slug,
            "--template",
            "react",
        ],
        _ => vec![
            "--yes",
            "create-electron-vite@latest",
            slug,
            "--template",
            "react",
        ],
    };

    run_and_log(
        pm_program(package_manager),
        &args,
        Some(parent_dir),
        logs,
        "Electron oluşturulamadı",
    )
}

fn scaffold_expo(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    template: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    run_npx_create(
        slug,
        package_manager,
        parent_dir,
        "create-expo-app@latest",
        &["--template", template],
        logs,
        "Expo",
    )
}

fn scaffold_flutter(slug: &str, parent_dir: &Path, logs: &mut Vec<String>) -> Result<(), String> {
    let project_name = slug.replace('-', "_");
    run_and_log(
        "flutter",
        &[
            "create",
            slug,
            "--org",
            "com.vb",
            "--project-name",
            &project_name,
        ],
        Some(parent_dir),
        logs,
        "flutter create başarısız",
    )
}
