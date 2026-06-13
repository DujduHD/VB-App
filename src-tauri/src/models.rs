use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectIdentity {
    pub name: String,
    pub slogan: String,
    pub logo_url: String,
    #[serde(default)]
    pub logo_file_path: String,
    #[serde(default)]
    pub logo_file_name: String,
    #[serde(default = "default_logo_source")]
    pub logo_source: String,
}

fn default_logo_source() -> String {
    "none".into()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrationsConfig {
    pub baas_provider: String,
    #[serde(default)]
    pub database_url: String,
    #[serde(default)]
    pub database_token: String,
    #[serde(default)]
    pub database_secret: String,
    pub supabase_url: String,
    pub supabase_anon_key: String,
    pub supabase_service_key: String,
    pub firebase_api_key: String,
    pub firebase_auth_domain: String,
    pub firebase_project_id: String,
    pub firebase_app_id: String,
    pub docker_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VibeConfig {
    pub ui_ux_tool: String,
    #[serde(default = "default_music_provider")]
    pub music_provider: String,
}

fn default_music_provider() -> String {
    "spotify".into()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchConfig {
    pub deploy_target: String,
    pub git_enabled: bool,
    pub open_github: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectRequest {
    pub identity: ProjectIdentity,
    pub platform: String,
    pub framework: String,
    pub package_manager: String,
    pub ai_tool: String,
    pub integrations: IntegrationsConfig,
    pub vibe: VibeConfig,
    pub launch: LaunchConfig,
    #[serde(default)]
    pub existing_project_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimeCapsuleProject {
    pub id: String,
    pub name: String,
    pub slogan: String,
    #[serde(default = "default_platform")]
    pub platform: String,
    pub framework: String,
    pub package_manager: String,
    pub ai_tool: String,
    pub created_at: String,
    pub path: String,
    pub port: u16,
    #[serde(default = "default_baas")]
    pub baas_provider: String,
    #[serde(default)]
    pub docker_enabled: bool,
    #[serde(default = "default_ui_ux")]
    pub ui_ux_tool: String,
    #[serde(default = "default_music_none")]
    pub music_provider: String,
    #[serde(default = "default_spotify")]
    pub spotify_enabled: bool,
    #[serde(default = "default_deploy")]
    pub deploy_target: String,
    #[serde(default = "default_git")]
    pub git_enabled: bool,
}

fn default_platform() -> String {
    "web".into()
}

fn default_baas() -> String {
    "none".into()
}

fn default_ui_ux() -> String {
    "none".into()
}

fn default_music_none() -> String {
    "none".into()
}

fn default_spotify() -> bool {
    true
}

fn default_deploy() -> String {
    "none".into()
}

fn default_git() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserProfilePayload {
    #[serde(default)]
    pub identity_name: String,
    #[serde(default)]
    pub identity_website: String,
    #[serde(default = "default_license")]
    pub default_license: String,
    #[serde(default)]
    pub copyright_text: String,
    #[serde(default = "default_workspace_path")]
    pub default_path: String,
    #[serde(default)]
    pub terminal_command: String,
    #[serde(default = "default_ssh_key")]
    pub ssh_key_path: String,
    #[serde(default)]
    pub github_username: String,
    #[serde(default)]
    pub github_pat: String,
    #[serde(default)]
    pub global_rules: String,
    #[serde(default)]
    pub custom_prompt_context: String,
}

impl Default for UserProfilePayload {
    fn default() -> Self {
        Self {
            identity_name: String::new(),
            identity_website: String::new(),
            default_license: default_license(),
            copyright_text: String::new(),
            default_path: default_workspace_path(),
            terminal_command: String::new(),
            ssh_key_path: default_ssh_key(),
            github_username: String::new(),
            github_pat: String::new(),
            global_rules: String::new(),
            custom_prompt_context: String::new(),
        }
    }
}

fn default_license() -> String {
    "MIT".into()
}

fn default_workspace_path() -> String {
    "~/Projects".into()
}

fn default_ssh_key() -> String {
    "~/.ssh/id_rsa".into()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectResponse {
    pub project: TimeCapsuleProject,
    pub logs: Vec<String>,
    pub prompt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WakeProjectRequest {
    pub id: String,
    #[serde(default)]
    pub music_query: String,
    #[serde(default)]
    pub custom_prompt_context: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WakeProjectResponse {
    pub logs: Vec<String>,
    pub prompt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectAnalysis {
    pub project_name: String,
    pub platform: String,
    pub package_manager: String,
    pub framework: String,
    pub deploy_target: String,
    pub git_enabled: bool,
    pub docker_enabled: bool,
    pub unknown_fields: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InjectedMediaFile {
    pub file_name: String,
    pub project_relative_path: String,
    pub public_path: String,
    pub kind: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InjectMediaResult {
    pub files: Vec<InjectedMediaFile>,
    pub prompt: String,
    pub target_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InjectEnvResult {
    pub injected_keys: Vec<String>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddCicdResult {
    pub workflow_path: String,
    pub message: String,
}
