use std::fs;
use std::path::{Path, PathBuf};

use crate::models::{InjectMediaResult, InjectedMediaFile};

use super::framework::normalize;
use super::paths::ensure_dir;
use super::profile::expand_path;

const MAX_IMAGE_BYTES: u64 = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES: u64 = 50 * 1024 * 1024;

struct MediaTarget {
    relative_dir: &'static str,
    url_prefix: &'static str,
}

fn media_target(framework: &str) -> MediaTarget {
    match normalize(framework) {
        "sveltekit" => MediaTarget {
            relative_dir: "static",
            url_prefix: "/",
        },
        "flutter" => MediaTarget {
            relative_dir: "assets",
            url_prefix: "assets/",
        },
        "expo-blank" | "expo-router" | "react-native-supabase" => MediaTarget {
            relative_dir: "assets",
            url_prefix: "assets/",
        },
        _ => MediaTarget {
            relative_dir: "public",
            url_prefix: "/",
        },
    }
}

fn is_allowed_ext(ext: &str) -> bool {
    matches!(
        ext,
        "png" | "jpg" | "jpeg" | "gif" | "svg" | "ico" | "webp" | "mp4" | "webm" | "mov"
    )
}

fn extension_from_path(path: &Path) -> Option<String> {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_ascii_lowercase())
        .filter(|e| is_allowed_ext(e))
}

fn media_kind(ext: &str, file_name: &str) -> String {
    let lower = file_name.to_ascii_lowercase();
    if ext == "ico" || lower.contains("favicon") {
        "favicon".into()
    } else if matches!(ext, "mp4" | "webm" | "mov") {
        "video".into()
    } else if lower.contains("logo") {
        "logo".into()
    } else {
        "image".into()
    }
}

fn kind_label(kind: &str) -> &'static str {
    match kind {
        "logo" => "Logo için",
        "favicon" => "Favicon için",
        "video" => "Video için",
        _ => "Görsel için",
    }
}

fn validate_size(path: &Path, ext: &str) -> Result<(), String> {
    let meta = fs::metadata(path).map_err(|e| format!("Dosya okunamadı: {e}"))?;
    let max = if matches!(ext, "mp4" | "webm" | "mov") {
        MAX_VIDEO_BYTES
    } else {
        MAX_IMAGE_BYTES
    };
    if meta.len() > max {
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("dosya");
        return Err(format!(
            "'{name}' çok büyük (görsel max 5 MB, video max 50 MB)."
        ));
    }
    Ok(())
}

pub fn pick_media_files() -> Result<Vec<String>, String> {
    let picked = rfd::FileDialog::new()
        .add_filter(
            "Medya",
            &[
                "png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "mp4", "webm", "mov",
            ],
        )
        .pick_files();

    Ok(picked
        .unwrap_or_default()
        .into_iter()
        .map(|path| path.display().to_string())
        .collect())
}

pub fn inject_media(
    project_path: &str,
    framework: &str,
    source_paths: &[String],
) -> Result<InjectMediaResult, String> {
    if source_paths.is_empty() {
        return Err("En az bir dosya seçin.".into());
    }

    let root = expand_path(project_path)?;
    if !root.is_dir() {
        return Err("Proje klasörü bulunamadı.".into());
    }

    let target = media_target(framework);
    let dest_dir = root.join(target.relative_dir);
    ensure_dir(&dest_dir)?;

    let mut files = Vec::new();

    for source_str in source_paths {
        let source = PathBuf::from(source_str.trim());
        if source_str.trim().is_empty() {
            continue;
        }
        if !source.is_file() {
            return Err(format!("Dosya bulunamadı: {}", source.display()));
        }

        let ext = extension_from_path(&source)
            .ok_or_else(|| format!("Desteklenmeyen format: {}", source.display()))?;
        validate_size(&source, &ext)?;

        let file_name = source
            .file_name()
            .and_then(|n| n.to_str())
            .ok_or_else(|| "Geçersiz dosya adı.".to_string())?
            .to_string();

        let dest = dest_dir.join(&file_name);
        fs::copy(&source, &dest)
            .map_err(|e| format!("Dosya kopyalanamadı ({}): {e}", file_name))?;

        let public_path = if target.url_prefix == "/" {
            format!("/{file_name}")
        } else {
            format!("{}{file_name}", target.url_prefix)
        };

        let kind = media_kind(&ext, &file_name);
        files.push(InjectedMediaFile {
            file_name: file_name.clone(),
            project_relative_path: format!("{}/{}", target.relative_dir, file_name),
            public_path,
            kind,
        });
    }

    if files.is_empty() {
        return Err("En az bir dosya seçin.".into());
    }

    let prompt = build_media_prompt(&files);
    Ok(InjectMediaResult {
        files,
        prompt,
        target_dir: target.relative_dir.to_string(),
    })
}

fn build_media_prompt(files: &[InjectedMediaFile]) -> String {
    let mut lines = vec![
        "Aşağıdaki medya dosyaları projeye başarıyla eklendi. Lütfen kodlarda bu yolları kullan:"
            .to_string(),
    ];

    for file in files {
        lines.push(format!(
            "{}: {}",
            kind_label(&file.kind),
            file.public_path
        ));
    }

    lines.join("\n")
}
