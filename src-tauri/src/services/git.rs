use std::path::Path;

use super::browser::open_url;
use super::shell::{command_exists, output_to_log, run_command};

const COMMIT_MSG: &str = "Initial commit from VB";

const GITIGNORE_APPEND: &str = "\n# VB\n.env.local\n.env*.local\n";

pub fn setup_git(project_path: &Path, open_github: bool, logs: &mut Vec<String>) -> Result<(), String> {
    if !command_exists("git") {
        logs.push("Git yüklü değil — git adımı atlandı.".into());
        return Ok(());
    }

    let git_dir = project_path.join(".git");
    if !git_dir.exists() {
        let init = run_command("git", &["init"], Some(project_path))?;
        if !init.status.success() {
            return Err(format!(
                "git init başarısız: {}",
                output_to_log(&init)
            ));
        }
        logs.push("git init tamamlandı.".into());
    } else {
        logs.push("Git deposu zaten mevcut.".into());
    }

    ensure_gitignore(project_path, logs)?;

    let _ = run_command(
        "git",
        &["config", "user.email", "vb@veli-baslatici.local"],
        Some(project_path),
    );
    let _ = run_command(
        "git",
        &["config", "user.name", "VB Veli-Baslatıcı"],
        Some(project_path),
    );

    let add = run_command("git", &["add", "-A"], Some(project_path))?;
    if !add.status.success() {
        logs.push(format!("git add uyarısı: {}", output_to_log(&add)));
    }

    let commit = run_command(
        "git",
        &["commit", "-m", COMMIT_MSG],
        Some(project_path),
    );

    match commit {
        Ok(output) if output.status.success() => {
            logs.push(format!("Git commit: \"{COMMIT_MSG}\""));
        }
        Ok(output) => {
            let log = output_to_log(&output);
            if log.contains("nothing to commit") {
                logs.push("Commit atlandı — değişiklik yok.".into());
            } else {
                logs.push(format!("Git commit uyarısı: {log}"));
            }
        }
        Err(e) => logs.push(format!("Git commit uyarısı: {e}")),
    }

    if open_github {
        if let Err(e) = open_url("https://github.com/new") {
            logs.push(format!("GitHub uyarısı: {e}"));
        } else {
            logs.push("GitHub yeni repo sayfası tarayıcıda açıldı.".into());
        }
    }

    Ok(())
}

fn ensure_gitignore(project_path: &Path, logs: &mut Vec<String>) -> Result<(), String> {
    let gitignore_path = project_path.join(".gitignore");

    if gitignore_path.exists() {
        let content = std::fs::read_to_string(&gitignore_path)
            .map_err(|e| format!(".gitignore okunamadı: {e}"))?;
        if !content.contains(".env.local") {
            std::fs::write(&gitignore_path, format!("{content}{GITIGNORE_APPEND}"))
                .map_err(|e| format!(".gitignore güncellenemedi: {e}"))?;
            logs.push(".gitignore güncellendi (.env.local eklendi).".into());
        }
    } else {
        std::fs::write(
            &gitignore_path,
            "node_modules/\n.dist/\ndist/\n.next/\n.env.local\n.env*.local\n.DS_Store\n",
        )
        .map_err(|e| format!(".gitignore oluşturulamadı: {e}"))?;
        logs.push(".gitignore oluşturuldu.".into());
    }

    Ok(())
}
