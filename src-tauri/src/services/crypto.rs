use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD, Engine};
use rand::RngCore;

use crate::models::IntegrationsConfig;
use super::paths::{ensure_dir, vb_config_dir};

const NONCE_LEN: usize = 12;

fn master_key_path() -> Result<std::path::PathBuf, String> {
    Ok(vb_config_dir()?.join(".masterkey"))
}

fn secrets_dir() -> Result<std::path::PathBuf, String> {
    Ok(vb_config_dir()?.join("secrets"))
}

fn load_or_create_master_key() -> Result<[u8; 32], String> {
    let path = master_key_path()?;
    if path.exists() {
        let raw = std::fs::read(&path).map_err(|e| format!("Anahtar okunamadı: {e}"))?;
        if raw.len() == 32 {
            let mut key = [0u8; 32];
            key.copy_from_slice(&raw);
            return Ok(key);
        }
    }

    ensure_dir(&vb_config_dir()?)?;
    let mut key = [0u8; 32];
    OsRng.fill_bytes(&mut key);
    std::fs::write(&path, key).map_err(|e| format!("Anahtar yazılamadı: {e}"))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o600));
    }

    Ok(key)
}

pub fn encrypt_integrations(
    project_id: &str,
    integrations: &IntegrationsConfig,
) -> Result<(), String> {
    let json = serde_json::to_vec(integrations)
        .map_err(|e| format!("Entegrasyon serileştirilemedi: {e}"))?;

    let key = load_or_create_master_key()?;
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Şifreleme hatası: {e}"))?;

    let mut nonce_bytes = [0u8; NONCE_LEN];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, json.as_ref())
        .map_err(|e| format!("Şifreleme başarısız: {e}"))?;

    let mut payload = nonce_bytes.to_vec();
    payload.extend(ciphertext);

    let dir = secrets_dir()?;
    ensure_dir(&dir)?;
    let path = dir.join(format!("{project_id}.enc"));
    std::fs::write(&path, STANDARD.encode(&payload))
        .map_err(|e| format!("Şifreli secret kaydedilemedi: {e}"))?;

    Ok(())
}

pub fn delete_secrets(project_id: &str) -> Result<(), String> {
    let path = secrets_dir()?.join(format!("{project_id}.enc"));
    if path.exists() {
        std::fs::remove_file(&path).map_err(|e| format!("Secret silinemedi: {e}"))?;
    }
    Ok(())
}

fn env_vault_path() -> Result<std::path::PathBuf, String> {
    Ok(vb_config_dir()?.join("env-vault.enc"))
}

fn encrypt_blob(plaintext: &[u8]) -> Result<String, String> {
    let key = load_or_create_master_key()?;
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Şifreleme hatası: {e}"))?;

    let mut nonce_bytes = [0u8; NONCE_LEN];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| format!("Şifreleme başarısız: {e}"))?;

    let mut payload = nonce_bytes.to_vec();
    payload.extend(ciphertext);
    Ok(STANDARD.encode(&payload))
}

fn decrypt_blob(encoded: &str) -> Result<Vec<u8>, String> {
    let raw = STANDARD
        .decode(encoded.trim())
        .map_err(|e| format!("Kasa dosyası bozuk: {e}"))?;
    if raw.len() <= NONCE_LEN {
        return Err("Kasa dosyası geçersiz.".into());
    }

    let key = load_or_create_master_key()?;
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Şifre çözme hatası: {e}"))?;
    let (nonce_bytes, ciphertext) = raw.split_at(NONCE_LEN);
    let nonce = Nonce::from_slice(nonce_bytes);

    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Kasa şifresi çözülemedi: {e}"))
}

pub fn save_env_vault(content: &str) -> Result<(), String> {
    ensure_dir(&vb_config_dir()?)?;
    let encoded = encrypt_blob(content.as_bytes())?;
    std::fs::write(env_vault_path()?, encoded).map_err(|e| format!("Kasa kaydedilemedi: {e}"))
}

pub fn load_env_vault() -> Result<String, String> {
    let path = env_vault_path()?;
    if !path.exists() {
        return Ok(String::new());
    }
    let encoded = std::fs::read_to_string(&path).map_err(|e| format!("Kasa okunamadı: {e}"))?;
    let bytes = decrypt_blob(&encoded)?;
    String::from_utf8(bytes).map_err(|e| format!("Kasa içeriği geçersiz: {e}"))
}
