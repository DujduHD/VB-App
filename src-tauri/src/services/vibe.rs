use crate::models::{CreateProjectRequest, TimeCapsuleProject};
use super::browser::{open_music, open_ui_ux_tool, resolve_music_provider};
use super::clipboard::set_clipboard;
use super::code_editor::editor_label;
use super::prompt::generate_initial_prompt;

fn augment_prompt(base: &str, context: &str) -> String {
    if context.trim().is_empty() {
        return base.to_string();
    }
    format!(
        "{base}\n\n---\nKişisel yönerge:\n{}",
        context.trim()
    )
}

pub fn run_vibe_automation(
    request: &CreateProjectRequest,
    port: u16,
    music_query: &str,
    custom_prompt_context: &str,
    logs: &mut Vec<String>,
) -> String {
    let base = generate_initial_prompt(
        &request.identity.name,
        &request.identity.slogan,
        &request.platform,
        &request.framework,
        &request.package_manager,
        &request.ai_tool,
        &request.integrations.baas_provider,
        port,
    );
    let prompt = augment_prompt(&base, custom_prompt_context);

    match set_clipboard(&prompt) {
        Ok(()) => logs.push("İlk prompt panoya kopyalandı.".into()),
        Err(e) => logs.push(format!("Pano uyarısı: {e}")),
    }

    if let Err(e) = open_ui_ux_tool(&request.vibe.ui_ux_tool, logs) {
        logs.push(format!("UI/UX uyarısı: {e}"));
    }

    logs.push(format!(
        "Kod editörü: {} — proje dizini açılacak.",
        editor_label(&request.ai_tool)
    ));

    if request.vibe.music_provider != "none" {
        if let Err(e) = open_music(&request.vibe.music_provider, music_query, logs) {
            logs.push(format!("Müzik uyarısı: {e}"));
        }
    }

    prompt
}

pub fn run_wake_vibe(
    project: &TimeCapsuleProject,
    music_query: &str,
    custom_prompt_context: &str,
    logs: &mut Vec<String>,
) -> String {
    let base = generate_initial_prompt(
        &project.name,
        &project.slogan,
        &project.platform,
        &project.framework,
        &project.package_manager,
        &project.ai_tool,
        &project.baas_provider,
        project.port,
    );
    let prompt = augment_prompt(&base, custom_prompt_context);

    match set_clipboard(&prompt) {
        Ok(()) => logs.push("Prompt panoya kopyalandı.".into()),
        Err(e) => logs.push(format!("Pano uyarısı: {e}")),
    }

    if let Err(e) = open_ui_ux_tool(&project.ui_ux_tool, logs) {
        logs.push(format!("UI/UX uyarısı: {e}"));
    }

    logs.push(format!(
        "Kod editörü: {}",
        editor_label(&project.ai_tool)
    ));

    let music = resolve_music_provider(&project.music_provider, project.spotify_enabled);

    if music != "none" {
        if let Err(e) = open_music(music, music_query, logs) {
            logs.push(format!("Müzik uyarısı: {e}"));
        }
    }

    prompt
}
