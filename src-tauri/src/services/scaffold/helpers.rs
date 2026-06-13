use std::path::Path;

use super::super::shell::{output_to_log, run_command, run_shell_command};

pub fn pm_use_flag(package_manager: &str) -> &str {
    match package_manager {
        "yarn" => "--use-yarn",
        "pnpm" => "--use-pnpm",
        "bun" => "--use-bun",
        _ => "--use-npm",
    }
}

pub fn pm_program(package_manager: &str) -> &str {
    match package_manager {
        "pnpm" => "pnpm",
        "yarn" => "yarn",
        "bun" => "bunx",
        _ => "npx",
    }
}

pub fn install_cmd(package_manager: &str) -> String {
    match package_manager {
        "pnpm" => "pnpm install".into(),
        "yarn" => "yarn install".into(),
        "bun" => "bun install".into(),
        _ => "npm install".into(),
    }
}

pub fn run_and_log(
    program: &str,
    args: &[&str],
    cwd: Option<&Path>,
    logs: &mut Vec<String>,
    error_msg: &str,
) -> Result<(), String> {
    let output = run_command(program, args, cwd)?;
    let log = output_to_log(&output);
    if !log.is_empty() {
        logs.push(log);
    }
    if !output.status.success() {
        return Err(format!("{error_msg} (kod: {:?})", output.status.code()));
    }
    Ok(())
}

pub fn install_deps(
    project_path: &Path,
    package_manager: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let cmd = install_cmd(package_manager);
    logs.push(format!("Bağımlılıklar yükleniyor: {cmd}"));
    let output = run_shell_command(&cmd, Some(project_path))?;
    let log = output_to_log(&output);
    if !log.is_empty() {
        logs.push(log);
    }
    if !output.status.success() {
        logs.push("Uyarı: Bağımlılık kurulumu başarısız — manuel çalıştırabilirsiniz.".into());
    }
    Ok(())
}

pub fn run_npx_create(
    slug: &str,
    package_manager: &str,
    parent_dir: &Path,
    create_pkg: &str,
    extra_args: &[&str],
    logs: &mut Vec<String>,
    label: &str,
) -> Result<(), String> {
    let mut args: Vec<&str> = match package_manager {
        "pnpm" | "yarn" => vec!["dlx", create_pkg],
        "bun" => vec![create_pkg],
        _ => vec!["--yes", create_pkg],
    };
    args.push(slug);
    args.extend_from_slice(extra_args);

    let program = pm_program(package_manager);
    run_and_log(
        program,
        &args,
        Some(parent_dir),
        logs,
        &format!("{label} oluşturulamadı"),
    )
}
