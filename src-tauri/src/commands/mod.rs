use chrono::Utc;
use uuid::Uuid;

use crate::models::{
    AddCicdResult, CreateProjectRequest, CreateProjectResponse, InjectEnvResult, InjectMediaResult,
    ProjectAnalysis, TimeCapsuleProject, UserProfilePayload, WakeProjectRequest,
    WakeProjectResponse,
};
use crate::services::analyze::analyze_project as analyze_project_dir;
use crate::services::crypto::{encrypt_integrations, load_env_vault, save_env_vault};
use crate::services::logo::{delete_staged_logo, install_logo, pick_and_stage_logo, read_logo_data_url, StagedLogo};
use crate::services::clipboard::set_clipboard;
use crate::services::deploy::write_deploy_configs;
use crate::services::docker::{docker_up, write_docker_compose};
use crate::services::editor::open_editor;
use crate::services::env::{resolve_env_ports, write_env_local};
use crate::services::github::create_github_repo_and_push;
use crate::services::git::setup_git;
use crate::services::paths::{default_projects_dir, ensure_dir, slugify};
use crate::services::profile::{
    append_copyright_to_readme, apply_profile_to_project, expand_path, pick_directory_dialog,
    resolve_projects_dir,
};
use crate::services::port::find_available_port;
use crate::services::readme::{generate_readme, write_readme};
use crate::services::scaffold::scaffold_project;
use crate::services::storage::{add_project, load_capsule, remove_project as remove_from_storage};
use crate::services::vibe::run_vibe_automation;
use crate::services::wake::wake_project as wake_project_service;

#[tauri::command]
pub fn load_time_capsule() -> Result<Vec<TimeCapsuleProject>, String> {
    load_capsule()
}

#[tauri::command]
pub fn analyze_project(path: String) -> Result<ProjectAnalysis, String> {
    let result = analyze_project_dir(&path)?;
    Ok(ProjectAnalysis {
        project_name: result.project_name,
        platform: result.platform,
        package_manager: result.package_manager,
        framework: result.framework,
        deploy_target: result.deploy_target,
        git_enabled: result.git_enabled,
        docker_enabled: result.docker_enabled,
        unknown_fields: result.unknown_fields,
    })
}

#[tauri::command]
pub fn create_project(
    request: CreateProjectRequest,
    music_query: Option<String>,
    user_profile: Option<UserProfilePayload>,
) -> Result<CreateProjectResponse, String> {
    let profile = user_profile.unwrap_or_default();
    let slug = slugify(&request.identity.name);
    if slug.is_empty() {
        return Err("Geçerli bir proje adı girin.".into());
    }

    let is_import = request
        .existing_project_path
        .as_ref()
        .is_some_and(|path| !path.trim().is_empty());

    let app_port = find_available_port(3000);
    let env_ports = resolve_env_ports(app_port, request.integrations.docker_enabled);
    let mut logs = vec![if is_import {
        "Mevcut proje Zaman Kapsülüne ekleniyor...".into()
    } else {
        format!("Uygulama portu: {}", env_ports.app_port)
    }];

    if !is_import && request.integrations.docker_enabled {
        logs.push(format!(
            "Dev Stack portları — DB: {}, Cache: {}",
            env_ports.postgres_port, env_ports.redis_port
        ));
    }

    let (project_path, scaffold_logs) = if is_import {
        let existing = request.existing_project_path.as_ref().unwrap();
        let path = expand_path(existing)?;
        if !path.is_dir() {
            return Err("Geçerli bir proje klasörü seçin.".into());
        }
        let path_log = format!("Mevcut proje dizini kullanılıyor: {}", path.display());
        (path, vec![path_log])
    } else {
        let projects_dir = resolve_projects_dir(&profile.default_path)
            .or_else(|_| default_projects_dir())?;
        ensure_dir(&projects_dir)?;
        scaffold_project(
            &request.framework,
            &slug,
            &request.package_manager,
            &projects_dir,
        )?
    };
    logs.extend(scaffold_logs);

    let logo_ref = match install_logo(
        &project_path,
        &request.framework,
        &request.identity.logo_source,
        &request.identity.logo_url,
        &request.identity.logo_file_path,
        &mut logs,
    ) {
        Ok(reference) => reference,
        Err(e) => {
            logs.push(format!("Logo uyarısı: {e}"));
            None
        }
    };

    let env_local_path = project_path.join(".env.local");
    if is_import && env_local_path.exists() {
        logs.push(".env.local korundu (içe aktarma).".into());
    } else {
        write_env_local(&project_path, &env_ports, &request.integrations)?;
        logs.push(".env.local oluşturuldu.".into());
    }

    if request.integrations.docker_enabled {
        let compose_path = project_path.join("docker-compose.yml");
        if is_import && compose_path.exists() {
            logs.push("docker-compose.yml korundu (içe aktarma).".into());
        } else {
            write_docker_compose(&project_path)?;
            logs.push("docker-compose.yml oluşturuldu.".into());
        }
        match docker_up(&project_path, &env_ports) {
            Ok(docker_logs) => logs.extend(docker_logs),
            Err(e) => logs.push(format!("Docker uyarısı: {e}")),
        }
    }

    let readme_path = project_path.join("README.md");
    if is_import && readme_path.exists() {
        logs.push("README.md korundu (içe aktarma).".into());
    } else {
        let mut readme = generate_readme(
            &request.identity.name,
            &request.identity.slogan,
            &request.platform,
            &request.framework,
            &request.package_manager,
            &request.ai_tool,
            env_ports.app_port,
            logo_ref.as_deref().unwrap_or(""),
        );
        append_copyright_to_readme(&mut readme, &profile.copyright_text);
        write_readme(&project_path, &readme)?;
        logs.push("README.md oluşturuldu.".into());
    }

    apply_profile_to_project(
        &project_path,
        &profile.global_rules,
        &profile.identity_name,
        &profile.default_license,
        &profile.copyright_text,
        &mut logs,
    );

    if let Err(e) = write_deploy_configs(
        &project_path,
        &request.launch.deploy_target,
        &request.framework,
        &request.package_manager,
        &slug,
        &mut logs,
    ) {
        logs.push(format!("Deploy uyarısı: {e}"));
    }

    if request.launch.git_enabled && !is_import {
        if let Err(e) = setup_git(
            &project_path,
            request.launch.open_github && profile.github_pat.is_empty(),
            &mut logs,
        ) {
            logs.push(format!("Git uyarısı: {e}"));
        }

        if !profile.github_pat.is_empty() {
            if let Err(e) = create_github_repo_and_push(
                &project_path,
                &slug,
                &profile.github_username,
                &profile.github_pat,
                &profile.ssh_key_path,
                &mut logs,
            ) {
                logs.push(format!("GitHub uyarısı: {e}"));
            }
        }
    } else if request.launch.git_enabled && is_import {
        logs.push("Git otomasyonu atlandı (içe aktarma).".into());
    }

    let home = dirs::home_dir().ok_or("Ana dizin bulunamadı.")?;
    let display_path = if project_path.starts_with(&home) {
        format!("~/{}", project_path.strip_prefix(&home).unwrap().display())
    } else {
        project_path.display().to_string()
    };

    let project_id = Uuid::new_v4().to_string();

    if request.integrations.baas_provider != "none" {
        encrypt_integrations(&project_id, &request.integrations)?;
        logs.push("API anahtarları şifreli olarak kaydedildi.".into());
    }

    let project = TimeCapsuleProject {
        id: project_id,
        name: request.identity.name.clone(),
        slogan: request.identity.slogan.clone(),
        platform: request.platform.clone(),
        framework: request.framework.clone(),
        package_manager: request.package_manager.clone(),
        ai_tool: request.ai_tool.clone(),
        created_at: Utc::now().to_rfc3339(),
        path: display_path,
        port: env_ports.app_port,
        baas_provider: request.integrations.baas_provider.clone(),
        docker_enabled: request.integrations.docker_enabled,
        ui_ux_tool: request.vibe.ui_ux_tool.clone(),
        music_provider: request.vibe.music_provider.clone(),
        spotify_enabled: request.vibe.music_provider == "spotify",
        deploy_target: request.launch.deploy_target.clone(),
        git_enabled: request.launch.git_enabled,
    };

    add_project(project.clone())?;
    logs.push("Zaman Kapsülüne kaydedildi.".into());

    logs.push("Vibe otomasyonu başlatılıyor...".into());
    let query = music_query.unwrap_or_default();
    let prompt = run_vibe_automation(
        &request,
        env_ports.app_port,
        &query,
        &profile.custom_prompt_context,
        &mut logs,
    );

    logs.push("Editör açılıyor...".into());
    if let Err(e) = open_editor(&project_path, &request.ai_tool, &mut logs) {
        logs.push(format!("Editör uyarısı: {e}"));
    }

    Ok(CreateProjectResponse {
        project,
        logs,
        prompt,
    })
}

#[tauri::command]
pub fn wake_project(request: WakeProjectRequest) -> Result<WakeProjectResponse, String> {
    let project = crate::services::storage::find_project(&request.id)?;
    let (logs, prompt) = wake_project_service(
        &project,
        &request.music_query,
        &request.custom_prompt_context,
    )?;
    Ok(WakeProjectResponse { logs, prompt })
}

#[tauri::command]
pub fn find_free_port(preferred: u16) -> Result<u16, String> {
    Ok(find_available_port(preferred))
}

#[tauri::command]
pub fn remove_from_capsule(id: String) -> Result<Vec<TimeCapsuleProject>, String> {
    crate::services::crypto::delete_secrets(&id)?;
    remove_from_storage(&id)
}

#[tauri::command]
pub fn pick_project_directory() -> Result<Option<String>, String> {
    pick_directory_dialog()
}

#[tauri::command]
pub fn preview_prompt(request: CreateProjectRequest) -> Result<String, String> {
    use crate::services::prompt::generate_initial_prompt;
    Ok(generate_initial_prompt(
        &request.identity.name,
        &request.identity.slogan,
        &request.platform,
        &request.framework,
        &request.package_manager,
        &request.ai_tool,
        &request.integrations.baas_provider,
        3000,
    ))
}

#[tauri::command]
pub fn pick_logo_file() -> Result<Option<StagedLogo>, String> {
    pick_and_stage_logo()
}

#[tauri::command]
pub fn read_logo_preview(path: String) -> Result<String, String> {
    read_logo_data_url(&path)
}

#[tauri::command]
pub fn remove_staged_logo(path: String) -> Result<(), String> {
    delete_staged_logo(&path)
}

#[tauri::command]
pub fn check_domain_availability(domain: String) -> Result<String, String> {
    match crate::services::domain::check_domain_availability(&domain)? {
        crate::services::domain::DomainAvailability::Available => Ok("available".into()),
        crate::services::domain::DomainAvailability::Taken => Ok("taken".into()),
    }
}

#[tauri::command]
pub fn check_dependencies(request: CreateProjectRequest) -> Result<Vec<String>, String> {
    Ok(crate::services::deps::check_dependencies(&request))
}

#[tauri::command]
pub fn install_dependencies(
    request: CreateProjectRequest,
    targets: Vec<String>,
) -> Result<Vec<String>, String> {
    crate::services::deps::install_dependencies(&request, &targets)
}

#[tauri::command]
pub fn setup_project_dns(
    domain: String,
    token: String,
    deploy_target: String,
    project_path: String,
) -> Result<crate::services::dns::SetupDnsResult, String> {
    crate::services::dns::setup_project_dns(&domain, &token, &deploy_target, &project_path)
}

#[tauri::command]
pub fn pick_media_files() -> Result<Vec<String>, String> {
    crate::services::media::pick_media_files()
}

#[tauri::command]
pub fn inject_media(
    project_path: String,
    framework: String,
    source_paths: Vec<String>,
) -> Result<InjectMediaResult, String> {
    crate::services::media::inject_media(&project_path, &framework, &source_paths)
}

#[tauri::command]
pub fn copy_to_clipboard(text: String) -> Result<(), String> {
    set_clipboard(&text)
}

#[tauri::command]
pub fn load_global_env_vault() -> Result<String, String> {
    load_env_vault()
}

#[tauri::command]
pub fn save_global_env_vault(content: String) -> Result<(), String> {
    save_env_vault(&content)
}

#[tauri::command]
pub fn inject_env(
    project_path: String,
    provider: String,
    env_content: Option<String>,
) -> Result<InjectEnvResult, String> {
    crate::services::inject_env::inject_env(
        &project_path,
        &provider,
        env_content.as_deref(),
    )
}

#[tauri::command]
pub fn add_github_actions(
    project_path: String,
    framework: String,
    package_manager: String,
) -> Result<AddCicdResult, String> {
    crate::services::cicd::add_github_actions(&project_path, &framework, &package_manager)
}

#[tauri::command]
pub fn save_share_image_png(
    base64_png: String,
    default_name: String,
) -> Result<Option<String>, String> {
    use base64::Engine;

    let data = base64_png
        .strip_prefix("data:image/png;base64,")
        .unwrap_or(base64_png.as_str());

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(data)
        .map_err(|e| format!("Görsel kodu çözülemedi: {e}"))?;

    let path = rfd::FileDialog::new()
        .add_filter("PNG", &["png"])
        .set_file_name(&default_name)
        .save_file();

    match path {
        Some(p) => {
            std::fs::write(&p, bytes).map_err(|e| e.to_string())?;
            Ok(Some(p.to_string_lossy().to_string()))
        }
        None => Ok(None),
    }
}
