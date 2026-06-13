use std::path::{Path, PathBuf};

use serde_json::Value;

pub fn expand_path(path: &str) -> Result<PathBuf, String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err("Yol boş.".into());
    }
    if trimmed == "~" {
        return dirs::home_dir().ok_or_else(|| "Ana dizin bulunamadı.".into());
    }
    if let Some(rest) = trimmed.strip_prefix("~/") {
        let home = dirs::home_dir().ok_or("Ana dizin bulunamadı.".to_string())?;
        return Ok(home.join(rest));
    }
    Ok(PathBuf::from(trimmed))
}

pub fn resolve_projects_dir(default_path: &str) -> Result<PathBuf, String> {
    if default_path.trim().is_empty() {
        super::paths::default_projects_dir()
    } else {
        expand_path(default_path)
    }
}

pub fn pick_directory_dialog() -> Result<Option<String>, String> {
    let picked = rfd::FileDialog::new()
        .set_title("Proje dizini seç")
        .pick_folder();

    let Some(path) = picked else {
        return Ok(None);
    };

    let home = dirs::home_dir();
    let display = if let Some(ref h) = home {
        if path.starts_with(h) {
            format!("~/{}", path.strip_prefix(h).unwrap().display())
        } else {
            path.display().to_string()
        }
    } else {
        path.display().to_string()
    };

    Ok(Some(display))
}

pub fn inject_ai_rules(project_path: &Path, rules: &str, logs: &mut Vec<String>) {
    if rules.trim().is_empty() {
        return;
    }

    let cursor_path = project_path.join(".cursorrules");
    let windsurf_path = project_path.join(".windsurfrules");

    match std::fs::write(&cursor_path, rules) {
        Ok(()) => logs.push(".cursorrules oluşturuldu.".into()),
        Err(e) => logs.push(format!(".cursorrules uyarısı: {e}")),
    }

    match std::fs::write(&windsurf_path, rules) {
        Ok(()) => logs.push(".windsurfrules oluşturuldu.".into()),
        Err(e) => logs.push(format!(".windsurfrules uyarısı: {e}")),
    }
}

pub fn inject_package_author(
    project_path: &Path,
    author: &str,
    logs: &mut Vec<String>,
) {
    if author.trim().is_empty() {
        return;
    }

    let pkg_path = project_path.join("package.json");
    if !pkg_path.exists() {
        return;
    }

    let content = match std::fs::read_to_string(&pkg_path) {
        Ok(c) => c,
        Err(e) => {
            logs.push(format!("package.json uyarısı: {e}"));
            return;
        }
    };

    let mut value: Value = match serde_json::from_str(&content) {
        Ok(v) => v,
        Err(e) => {
            logs.push(format!("package.json parse uyarısı: {e}"));
            return;
        }
    };

    if let Some(obj) = value.as_object_mut() {
        obj.insert("author".into(), Value::String(author.trim().into()));
    }

    match serde_json::to_string_pretty(&value) {
        Ok(updated) => {
            if let Err(e) = std::fs::write(&pkg_path, format!("{updated}\n")) {
                logs.push(format!("package.json yazma uyarısı: {e}"));
            } else {
                logs.push(format!("package.json author: {author}"));
            }
        }
        Err(e) => logs.push(format!("package.json serialize uyarısı: {e}")),
    }
}

pub fn inject_license(
    project_path: &Path,
    license: &str,
    copyright: &str,
    logs: &mut Vec<String>,
) {
    if license.trim().is_empty() || license == "none" {
        return;
    }

    let license_path = project_path.join("LICENSE");
    if license_path.exists() {
        return;
    }

    let holder = if copyright.trim().is_empty() {
        "Author".into()
    } else {
        copyright.trim().to_string()
    };

    let content = license_text(license, &holder);
    match std::fs::write(&license_path, content) {
        Ok(()) => logs.push(format!("LICENSE ({license}) oluşturuldu.")),
        Err(e) => logs.push(format!("LICENSE uyarısı: {e}")),
    }
}

fn license_text(license: &str, holder: &str) -> String {
    let year = chrono::Utc::now().format("%Y").to_string();
    match license {
        "MIT" => format!(
            "MIT License\n\nCopyright (c) {year} {holder}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n"
        ),
        "Apache-2.0" => format!(
            "Copyright {year} {holder}\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n"
        ),
        "Unlicense" => "This is free and unencumbered software released into the public domain.\n".into(),
        "Proprietary" => format!(
            "Copyright (c) {year} {holder}. All rights reserved.\n\nThis software is proprietary and confidential.\n"
        ),
        _ => format!("Copyright (c) {year} {holder}\n"),
    }
}

pub fn append_copyright_to_readme(readme: &mut String, copyright: &str) {
    if copyright.trim().is_empty() {
        return;
    }
    readme.push_str("\n\n---\n");
    readme.push_str(copyright.trim());
    readme.push('\n');
}

pub fn apply_profile_to_project(
    project_path: &Path,
    global_rules: &str,
    author: &str,
    license: &str,
    copyright: &str,
    logs: &mut Vec<String>,
) {
    inject_ai_rules(project_path, global_rules, logs);
    inject_package_author(project_path, author, logs);
    inject_license(project_path, license, copyright, logs);
}
