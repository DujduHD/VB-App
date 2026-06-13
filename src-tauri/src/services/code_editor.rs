/// AI destekli kod editörleri — CLI ile proje açma

pub fn normalize(editor: &str) -> &str {
    match editor {
        "claude" | "chatgpt" | "gemini" | "llama" | "code" => "vscode",
        other => other,
    }
}

pub fn editor_label(editor: &str) -> &str {
    match normalize(editor) {
        "cursor" => "Cursor",
        "vscode" => "VS Code",
        "windsurf" => "Windsurf",
        "zed" => "Zed",
        "void" => "Void",
        "trae" => "Trae",
        "pearai" => "PearAI",
        "antigravity" => "Antigravity",
        other => other,
    }
}

pub struct EditorSpec {
    pub id: &'static str,
    pub programs: &'static [&'static str],
}

const EDITORS: &[EditorSpec] = &[
    EditorSpec {
        id: "cursor",
        programs: &["cursor"],
    },
    EditorSpec {
        id: "vscode",
        programs: &["code", "codium", "code-oss"],
    },
    EditorSpec {
        id: "windsurf",
        programs: &["windsurf"],
    },
    EditorSpec {
        id: "zed",
        programs: &["zed", "zeditor"],
    },
    EditorSpec {
        id: "void",
        programs: &["void", "void-editor"],
    },
    EditorSpec {
        id: "trae",
        programs: &["trae"],
    },
    EditorSpec {
        id: "pearai",
        programs: &["pearai", "pear"],
    },
    EditorSpec {
        id: "antigravity",
        programs: &["antigravity"],
    },
];

pub fn spec_for(editor: &str) -> Option<&'static EditorSpec> {
    let id = normalize(editor);
    EDITORS.iter().find(|e| e.id == id)
}

pub fn fallback_order(preferred: &str) -> Vec<&'static str> {
    match normalize(preferred) {
        "cursor" => vec!["cursor", "vscode"],
        "vscode" => vec!["vscode", "cursor"],
        "windsurf" => vec!["windsurf", "cursor", "vscode"],
        "zed" => vec!["zed", "cursor", "vscode"],
        "void" => vec!["void", "cursor", "vscode"],
        "trae" => vec!["trae", "cursor", "vscode"],
        "pearai" => vec!["pearai", "cursor", "vscode"],
        "antigravity" => vec!["antigravity", "cursor", "vscode"],
        _ => vec!["cursor", "vscode"],
    }
}
