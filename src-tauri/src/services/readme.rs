use std::path::Path;

use super::code_editor::editor_label;
use super::framework::{framework_label, readme_dev_command, readme_install_command};

pub fn generate_readme(
    name: &str,
    slogan: &str,
    platform: &str,
    framework: &str,
    package_manager: &str,
    ai_tool: &str,
    port: u16,
    logo_url: &str,
) -> String {
    let logo_section = if logo_url.trim().is_empty() {
        String::new()
    } else {
        format!("![{name}]({logo_url})\n\n")
    };

    let platform_label = match platform {
        "web" => "Web Sitesi",
        "desktop" => "Masaüstü",
        "mobile" => "Mobil",
        _ => platform,
    };

    let fw_label = framework_label(framework);
    let editor = editor_label(ai_tool);
    let install = readme_install_command(package_manager, framework);
    let dev = readme_dev_command(package_manager, framework);

    format!(
        r#"{logo_section}# {name}

> {slogan}

Bu proje [**VB (Veli-Başlatıcı)**](https://github.com) ile oluşturuldu.

## Stack

| | |
|---|---|
| **Platform** | {platform_label} |
| **Framework** | {fw_label} |
| **Paket Yöneticisi** | {package_manager} |
| **Kod Editörü** | {editor} |
| **Port** | {port} |

## Başlangıç

```bash
{install}
{dev}
```

---
*Vibe coding moduna geç. Odaklan, üret, tekrarla.*
"#
    )
}

pub fn write_readme(project_path: &Path, content: &str) -> Result<(), String> {
    let readme_path = project_path.join("README.md");
    std::fs::write(&readme_path, content).map_err(|e| format!("README.md yazılamadı: {e}"))
}
