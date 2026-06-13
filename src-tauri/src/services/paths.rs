use std::path::{Path, PathBuf};

pub fn vb_config_dir() -> Result<PathBuf, String> {
    dirs::config_dir()
        .map(|p| p.join("vb"))
        .ok_or_else(|| "Yapılandırma dizini bulunamadı.".into())
}

pub fn time_capsule_path() -> Result<PathBuf, String> {
    Ok(vb_config_dir()?.join("time-capsule.json"))
}

pub fn default_projects_dir() -> Result<PathBuf, String> {
    dirs::home_dir()
        .map(|p| p.join("Projects"))
        .ok_or_else(|| "Ana dizin bulunamadı.".into())
}

pub fn slugify(name: &str) -> String {
    name.trim()
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

pub fn ensure_dir(path: &Path) -> Result<(), String> {
    std::fs::create_dir_all(path).map_err(|e| format!("Dizin oluşturulamadı: {e}"))
}
