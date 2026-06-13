use std::fs;
use std::path::Path;

use crate::models::TimeCapsuleProject;
use super::paths::{ensure_dir, time_capsule_path};

pub fn load_capsule() -> Result<Vec<TimeCapsuleProject>, String> {
    let path = time_capsule_path()?;
    if !path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&path).map_err(|e| format!("Zaman Kapsülü okunamadı: {e}"))?;
    serde_json::from_str(&content).map_err(|e| format!("Zaman Kapsülü ayrıştırılamadı: {e}"))
}

pub fn save_capsule(projects: &[TimeCapsuleProject]) -> Result<(), String> {
    let path = time_capsule_path()?;
    if let Some(parent) = path.parent() {
        ensure_dir(parent)?;
    }

    let content =
        serde_json::to_string_pretty(projects).map_err(|e| format!("JSON serileştirilemedi: {e}"))?;
    fs::write(&path, content).map_err(|e| format!("Zaman Kapsülü kaydedilemedi: {e}"))
}

pub fn add_project(project: TimeCapsuleProject) -> Result<Vec<TimeCapsuleProject>, String> {
    let mut projects = load_capsule()?;
    projects.insert(0, project);
    save_capsule(&projects)?;
    Ok(projects)
}

pub fn find_project(id: &str) -> Result<TimeCapsuleProject, String> {
    load_capsule()?
        .into_iter()
        .find(|p| p.id == id)
        .ok_or_else(|| format!("Proje bulunamadı: {id}"))
}

pub fn remove_project(id: &str) -> Result<Vec<TimeCapsuleProject>, String> {
    let mut projects = load_capsule()?;
    let before = projects.len();
    projects.retain(|p| p.id != id);
    if projects.len() == before {
        return Err(format!("Proje bulunamadı: {id}"));
    }
    save_capsule(&projects)?;
    Ok(projects)
}

pub fn project_path_exists(path: &str) -> bool {
    expand_path(path).map(|p| p.exists()).unwrap_or(false)
}

pub fn expand_path(path: &str) -> Result<std::path::PathBuf, String> {
    if path.starts_with("~/") {
        dirs::home_dir()
            .map(|h| h.join(path.trim_start_matches("~/")))
            .ok_or_else(|| "Ana dizin bulunamadı.".into())
    } else if path == "~" {
        dirs::home_dir().ok_or_else(|| "Ana dizin bulunamadı.".into())
    } else {
        Ok(Path::new(path).to_path_buf())
    }
}
