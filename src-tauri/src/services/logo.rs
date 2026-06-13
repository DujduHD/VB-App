use std::fs;
use std::path::{Path, PathBuf};

use uuid::Uuid;

use super::framework;
use super::paths::{ensure_dir, vb_config_dir};

const MAX_LOGO_BYTES: u64 = 5 * 1024 * 1024;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StagedLogo {
    pub path: String,
    pub file_name: String,
}

pub fn logos_cache_dir() -> Result<PathBuf, String> {
    let dir = vb_config_dir()?.join("logos");
    ensure_dir(&dir)?;
    Ok(dir)
}

fn validate_image_size(path: &Path) -> Result<(), String> {
    let meta = fs::metadata(path).map_err(|e| format!("Logo okunamadı: {e}"))?;
    if meta.len() > MAX_LOGO_BYTES {
        return Err("Logo dosyası 5 MB'dan küçük olmalı.".into());
    }
    Ok(())
}

fn extension_from_path(path: &Path) -> String {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_ascii_lowercase())
        .filter(|e| is_allowed_ext(e))
        .unwrap_or_else(|| "png".to_string())
}

fn is_allowed_ext(ext: &str) -> bool {
    matches!(
        ext,
        "png" | "jpg" | "jpeg" | "webp" | "svg" | "gif" | "ico"
    )
}

pub fn pick_and_stage_logo() -> Result<Option<StagedLogo>, String> {
    let picked = rfd::FileDialog::new()
        .add_filter(
            "Görseller",
            &["png", "jpg", "jpeg", "webp", "svg", "gif", "ico"],
        )
        .pick_file();

    let Some(source) = picked else {
        return Ok(None);
    };

    stage_logo_from_path(&source).map(Some)
}

pub fn stage_logo_from_path(source: &Path) -> Result<StagedLogo, String> {
    if !source.exists() {
        return Err("Logo dosyası bulunamadı.".into());
    }

    let ext = extension_from_path(source);
    if !is_allowed_ext(&ext) {
        return Err("Desteklenmeyen logo formatı. PNG, JPG, WebP, SVG veya GIF kullanın.".into());
    }

    validate_image_size(source)?;

    let dest = logos_cache_dir()?.join(format!("{}.{}", Uuid::new_v4(), ext));
    fs::copy(source, &dest).map_err(|e| format!("Logo kopyalanamadı: {e}"))?;

    Ok(StagedLogo {
        path: dest.display().to_string(),
        file_name: source
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| format!("logo.{ext}")),
    })
}

pub fn read_logo_data_url(path: &str) -> Result<String, String> {
    let path = Path::new(path);
    if !path.exists() {
        return Err("Logo dosyası bulunamadı.".into());
    }
    validate_image_size(path)?;

    let ext = extension_from_path(path);
    let mime = match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        "gif" => "image/gif",
        "ico" => "image/x-icon",
        _ => "image/png",
    };

    let bytes = fs::read(path).map_err(|e| format!("Logo okunamadı: {e}"))?;
    use base64::Engine;
    let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);
    Ok(format!("data:{mime};base64,{encoded}"))
}

fn logo_dest_dir(project_path: &Path, framework: &str) -> PathBuf {
    match framework::normalize(framework) {
        "expo-blank" | "expo-router" | "react-native-supabase" | "flutter" => {
            project_path.join("assets")
        }
        _ => project_path.join("public"),
    }
}

fn readme_logo_ref(relative: &str) -> String {
    if relative.starts_with("./") {
        relative.to_string()
    } else {
        format!("./{relative}")
    }
}

/// Proje dizinine logo kopyalar; README için referans döner.
pub fn install_logo(
    project_path: &Path,
    framework: &str,
    logo_source: &str,
    logo_url: &str,
    logo_file_path: &str,
    logs: &mut Vec<String>,
) -> Result<Option<String>, String> {
    match logo_source {
        "url" if !logo_url.trim().is_empty() => Ok(Some(logo_url.trim().to_string())),
        "file" if !logo_file_path.trim().is_empty() => {
            let source = Path::new(logo_file_path.trim());
            if !source.exists() {
                return Err(format!(
                    "Logo dosyası bulunamadı: {}",
                    logo_file_path.trim()
                ));
            }

            validate_image_size(source)?;
            let ext = extension_from_path(source);
            let dest_dir = logo_dest_dir(project_path, framework);
            ensure_dir(&dest_dir)?;

            let file_name = format!("logo.{ext}");
            let dest = dest_dir.join(&file_name);
            fs::copy(source, &dest).map_err(|e| format!("Logo projeye kopyalanamadı: {e}"))?;

            let folder = if dest_dir.ends_with("assets") {
                "assets"
            } else {
                "public"
            };
            let relative = format!("{folder}/{file_name}");
            logs.push(format!("Logo projeye eklendi: {relative}"));
            Ok(Some(readme_logo_ref(&relative)))
        }
        _ => Ok(None),
    }
}

pub fn delete_staged_logo(path: &str) -> Result<(), String> {
    if path.trim().is_empty() {
        return Ok(());
    }
    let logos_dir = logos_cache_dir()?;
    let target = Path::new(path);
    if target.starts_with(&logos_dir) && target.exists() {
        fs::remove_file(target).map_err(|e| format!("Logo silinemedi: {e}"))?;
    }
    Ok(())
}
