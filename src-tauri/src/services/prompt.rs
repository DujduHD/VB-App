use super::code_editor::editor_label;
use super::framework::framework_label;

fn platform_label(platform: &str) -> &str {
    match platform {
        "web" => "Web Sitesi",
        "desktop" => "Masaüstü Uygulaması",
        "mobile" => "Mobil Uygulama (iOS/Android)",
        _ => platform,
    }
}

use super::baas::baas_prompt_note;

pub fn generate_initial_prompt(
    name: &str,
    slogan: &str,
    platform: &str,
    framework: &str,
    package_manager: &str,
    ai_tool: &str,
    baas_provider: &str,
    port: u16,
) -> String {
    let fw = framework_label(framework);
    let plat = platform_label(platform);
    let ai = editor_label(ai_tool);
    let slogan_line = if slogan.trim().is_empty() {
        String::new()
    } else {
        format!("\nSlogan: \"{}\"", slogan.trim())
    };
    let baas = baas_prompt_note(baas_provider);
    let baas_section = if baas.is_empty() {
        String::new()
    } else {
        format!("\n\nNot: {baas}")
    };

    format!(
        "Merhaba! Ben {plat} için {fw} ile \"{name}\" adında bir uygulama geliştiriyorum.{slogan_line}\n\n\
         ## Stack\n\
         - Platform: {plat}\n\
         - Framework: {fw}\n\
         - Paket yöneticisi: {package_manager}\n\
         - Geliştirme portu: {port}\n\
         - Kod editörü: {ai}\n\n\
         ## Hedef\n\
         Modern, minimal ve odaklı bir vibe coding deneyimi. Temiz kod, iyi UX, \
         dark mode desteği ve best practice'lere uyum.{baas_section}\n\n\
         ## İlk adımlar\n\
         1. Proje yapısını gözden geçir\n\
         2. Ana layout ve routing iskeletini kur\n\
         3. İlk ekranı (landing/dashboard) tasarla\n\
         4. Bana adım adım rehberlik et — her adımda kod ver\n\n\
         Hazırım, başlayalım!"
    )
}
