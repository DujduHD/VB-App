use std::path::Path;

use reqwest::blocking::Client;

use super::profile::expand_path;
use super::shell::{command_exists, output_to_log, run_command};

pub fn create_github_repo_and_push(
    project_path: &Path,
    repo_name: &str,
    github_username: &str,
    github_pat: &str,
    ssh_key_path: &str,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    if github_pat.trim().is_empty() || github_username.trim().is_empty() {
        return Ok(());
    }

    if !command_exists("git") {
        logs.push("Git yüklü değil — GitHub push atlandı.".into());
        return Ok(());
    }

    let client = Client::builder()
        .user_agent("VB-Veli-Baslatıci")
        .build()
        .map_err(|e| format!("HTTP istemcisi: {e}"))?;

    let response = client
        .post("https://api.github.com/user/repos")
        .header("Authorization", format!("Bearer {}", github_pat.trim()))
        .header("Accept", "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .json(&serde_json::json!({
            "name": repo_name,
            "private": false,
            "auto_init": false
        }))
        .send()
        .map_err(|e| format!("GitHub repo isteği başarısız: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().unwrap_or_default();
        if body.contains("name already exists") {
            logs.push(format!(
                "GitHub repo zaten mevcut: {github_username}/{repo_name}"
            ));
        } else {
            return Err(format!("GitHub repo oluşturulamadı ({status}): {body}"));
        }
    } else {
        logs.push(format!(
            "GitHub repo oluşturuldu: {github_username}/{repo_name}"
        ));
    }

    if !ssh_key_path.trim().is_empty() {
        let key = expand_path(ssh_key_path.trim())?;
        let ssh_cmd = format!(
            "ssh -i {} -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes",
            key.display()
        );
        let _ = run_command(
            "git",
            &["config", "core.sshCommand", &ssh_cmd],
            Some(project_path),
        );
        logs.push("SSH anahtarı git için yapılandırıldı.".into());
    }

    let remote_url = format!(
        "git@github.com:{}/{}.git",
        github_username.trim(),
        repo_name
    );

    let remotes = run_command("git", &["remote"], Some(project_path))?;
    let has_origin = String::from_utf8_lossy(&remotes.stdout).contains("origin");

    if has_origin {
        let set_url = run_command(
            "git",
            &["remote", "set-url", "origin", &remote_url],
            Some(project_path),
        )?;
        if !set_url.status.success() {
            logs.push(format!(
                "git remote set-url uyarısı: {}",
                output_to_log(&set_url)
            ));
        }
    } else {
        let add = run_command(
            "git",
            &["remote", "add", "origin", &remote_url],
            Some(project_path),
        )?;
        if !add.status.success() {
            return Err(format!(
                "git remote add başarısız: {}",
                output_to_log(&add)
            ));
        }
        logs.push("git remote origin eklendi.".into());
    }

    let branch_out = run_command(
        "git",
        &["rev-parse", "--abbrev-ref", "HEAD"],
        Some(project_path),
    )?;
    let branch = String::from_utf8_lossy(&branch_out.stdout)
        .trim()
        .to_string();

    if branch.is_empty() || branch == "HEAD" {
        let _ = run_command("git", &["branch", "-M", "main"], Some(project_path));
    }

    let branch_out = run_command(
        "git",
        &["rev-parse", "--abbrev-ref", "HEAD"],
        Some(project_path),
    )?;
    let branch = String::from_utf8_lossy(&branch_out.stdout)
        .trim()
        .to_string();

    let push = run_command(
        "git",
        &["push", "-u", "origin", &branch],
        Some(project_path),
    )?;

    if push.status.success() {
        logs.push(format!("GitHub'a push edildi ({branch})."));
    } else {
        logs.push(format!(
            "Git push uyarısı: {}",
            output_to_log(&push)
        ));
    }

    Ok(())
}
