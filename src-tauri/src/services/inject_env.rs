use std::collections::{HashMap, HashSet};

use crate::models::InjectEnvResult;

use super::crypto::load_env_vault;
use super::profile::expand_path;

const SUPABASE_KEYS: &[&str] = &[
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const STRIPE_KEYS: &[&str] = &[
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
];

const OPENAI_KEYS: &[&str] = &[
    "OPENAI_API_KEY",
    "OPENAI_ORG_ID",
    "OPENAI_PROJECT_ID",
];

fn all_standard_keys() -> HashSet<String> {
    SUPABASE_KEYS
        .iter()
        .chain(STRIPE_KEYS.iter())
        .chain(OPENAI_KEYS.iter())
        .map(|k| k.to_string())
        .collect()
}

pub fn parse_env_lines(content: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        let Some((key, value)) = trimmed.split_once('=') else {
            continue;
        };
        let key = key.trim();
        if key.is_empty() {
            continue;
        }
        map.insert(key.to_string(), value.trim().to_string());
    }
    map
}

fn keys_for_provider(provider: &str, entries: &HashMap<String, String>) -> HashMap<String, String> {
    match provider {
        "supabase" => filter_keys(entries, SUPABASE_KEYS),
        "stripe" => filter_keys(entries, STRIPE_KEYS),
        "openai" => filter_keys(entries, OPENAI_KEYS),
        "custom" => custom_keys(entries),
        _ => HashMap::new(),
    }
}

fn filter_keys(entries: &HashMap<String, String>, allowed: &[&str]) -> HashMap<String, String> {
    let allowed_set: HashSet<&str> = allowed.iter().copied().collect();
    entries
        .iter()
        .filter(|(key, value)| allowed_set.contains(key.as_str()) && !value.is_empty())
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect()
}

fn custom_keys(entries: &HashMap<String, String>) -> HashMap<String, String> {
    let standard = all_standard_keys();
    entries
        .iter()
        .filter(|(key, value)| {
            if value.is_empty() {
                return false;
            }
            if standard.contains(key.as_str()) {
                return false;
            }
            key.starts_with("CUSTOM_")
                || key.starts_with("API_")
                || key.starts_with("MY_")
                || key.contains("_API_")
        })
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect()
}

fn existing_env_keys(content: &str) -> HashSet<String> {
    parse_env_lines(content).into_keys().collect()
}

pub fn inject_env(
    project_path: &str,
    provider: &str,
    env_content: Option<&str>,
) -> Result<InjectEnvResult, String> {
    let entries = if let Some(content) = env_content.filter(|c| !c.trim().is_empty()) {
        parse_env_lines(content)
    } else {
        let vault = load_env_vault()?;
        if vault.trim().is_empty() {
            return Err(
                "Anahtar girilmedi. API alanına KEY=değer satırları yazın.".into(),
            );
        }
        parse_env_lines(&vault)
    };

    let selected = keys_for_provider(provider, &entries);
    if selected.is_empty() {
        return Err(format!(
            "'{provider}' için geçerli anahtar bulunamadı. KEY=değer formatında değer girin."
        ));
    }

    let root = expand_path(project_path)?;
    if !root.is_dir() {
        return Err("Proje klasörü bulunamadı.".into());
    }

    let env_path = root.join(".env.local");
    let mut existing = if env_path.exists() {
        std::fs::read_to_string(&env_path).map_err(|e| format!(".env.local okunamadı: {e}"))?
    } else {
        String::new()
    };

    let present = existing_env_keys(&existing);
    let mut injected_keys = Vec::new();
    let mut lines_to_append = Vec::new();

    let provider_label = match provider {
        "supabase" => "Supabase",
        "stripe" => "Stripe",
        "openai" => "OpenAI",
        "custom" => "Custom API",
        other => other,
    };

    for (key, value) in &selected {
        if present.contains(key) {
            continue;
        }
        lines_to_append.push(format!("{key}={value}"));
        injected_keys.push(key.clone());
    }

    if injected_keys.is_empty() {
        return Err("Tüm anahtarlar .env.local dosyasında zaten mevcut.".into());
    }

    if !existing.is_empty() && !existing.ends_with('\n') {
        existing.push('\n');
    }

    if existing.is_empty() {
        existing.push_str("# VB Merkezi .env Kasası\n");
    }

    existing.push_str(&format!("\n# VB API enjeksiyonu — {provider_label}\n"));
    existing.push_str(&lines_to_append.join("\n"));
    existing.push('\n');

    if let Some(parent) = env_path.parent() {
        super::paths::ensure_dir(parent)?;
    }
    std::fs::write(&env_path, &existing).map_err(|e| format!(".env.local yazılamadı: {e}"))?;

    Ok(InjectEnvResult {
        injected_keys: injected_keys.clone(),
        message: format!(
            "API anahtarları başarıyla .env dosyasına taşındı ({})",
            injected_keys.join(", ")
        ),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_env_lines() {
        let map = parse_env_lines("OPENAI_API_KEY=sk-test\n# comment\nSUPABASE_URL=https://x");
        assert_eq!(map.get("OPENAI_API_KEY"), Some(&"sk-test".to_string()));
        assert_eq!(map.get("SUPABASE_URL"), Some(&"https://x".to_string()));
    }
}
