use std::path::Path;

use open;

use super::code_editor::{editor_label, fallback_order, spec_for};
use super::shell::{command_exists, spawn_detached};

fn try_spawn(program: &str, path: &Path) -> Result<(), String> {
    spawn_detached(program, &["."], Some(path))
}

pub fn open_editor(path: &Path, editor: &str, logs: &mut Vec<String>) -> Result<(), String> {
    let preferred = spec_for(editor);

    if let Some(spec) = preferred {
        for program in spec.programs {
            if command_exists(program) {
                try_spawn(program, path)?;
                logs.push(format!(
                    "{} editöründe açıldı.",
                    editor_label(spec.id)
                ));
                return Ok(());
            }
        }
        logs.push(format!(
            "{} bulunamadı — yedek editör deneniyor...",
            editor_label(spec.id)
        ));
    }

    for fallback_id in fallback_order(editor) {
        if let Some(spec) = spec_for(fallback_id) {
            for program in spec.programs {
                if command_exists(program) {
                    try_spawn(program, path)?;
                    logs.push(format!(
                        "Yedek editör: {} ({program})",
                        editor_label(spec.id)
                    ));
                    return Ok(());
                }
            }
        }
    }

    open::that(path).map_err(|e| format!("Dizin açılamadı: {e}"))?;
    logs.push("Sistem dosya yöneticisinde açıldı (editör bulunamadı).".into());
    Ok(())
}
