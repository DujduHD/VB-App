use crate::models::TimeCapsuleProject;
use super::browser::{open_deploy_dashboard, open_dev_server};
use super::docker::docker_up_if_exists;
use super::editor::open_editor;
use super::storage::{expand_path, project_path_exists};
use super::vibe::run_wake_vibe;

pub fn wake_project(
    project: &TimeCapsuleProject,
    music_query: &str,
    custom_prompt_context: &str,
) -> Result<(Vec<String>, String), String> {
    let mut logs = Vec::new();
    let path = expand_path(&project.path)?;

    if !project_path_exists(&project.path) {
        return Err(format!(
            "Proje dizini bulunamadı: {}",
            path.display()
        ));
    }

    logs.push(format!("⏳ Uyandırılıyor: {}", project.name));

    if project.docker_enabled {
        match docker_up_if_exists(&path) {
            Ok(docker_logs) if !docker_logs.is_empty() => logs.extend(docker_logs),
            Ok(_) => logs.push("VB Dev Stack yapılandırması bulunamadı.".into()),
            Err(e) => logs.push(format!("Docker uyarısı: {e}")),
        }
    }

    if let Err(e) = open_editor(&path, &project.ai_tool, &mut logs) {
        logs.push(format!("Editör uyarısı: {e}"));
    }

    let prompt = run_wake_vibe(project, music_query, custom_prompt_context, &mut logs);

    if project.deploy_target != "none" {
        if let Err(e) = open_deploy_dashboard(&project.deploy_target, &mut logs) {
            logs.push(format!("Deploy uyarısı: {e}"));
        }
    }

    if project.port > 0 {
        if let Err(e) = open_dev_server(project.port, &mut logs) {
            logs.push(format!("Dev sunucu uyarısı: {e}"));
        }
    }

    logs.push("✓ Tüm ortam tek tıkla uyandırıldı.".into());
    Ok((logs, prompt))
}
