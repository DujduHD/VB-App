pub fn set_clipboard(text: &str) -> Result<(), String> {
    arboard::Clipboard::new()
        .map_err(|e| format!("Pano erişilemedi: {e}"))?
        .set_text(text)
        .map_err(|e| format!("Panoya kopyalanamadı: {e}"))
}
