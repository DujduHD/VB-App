use std::path::Path;
use std::process::{Command, Output, Stdio};

/// Masaüstü uygulamasının dar PATH'i yüzünden yeni kurulan araçlar görünmeyebilir.
fn enriched_path() -> String {
    let mut segments: Vec<String> = Vec::new();

    for dir in ["/usr/local/sbin", "/usr/local/bin", "/usr/bin", "/bin", "/sbin"] {
        segments.push(dir.to_string());
    }

    if let Ok(home) = std::env::var("HOME") {
        for suffix in [
            ".local/bin",
            ".npm-global/bin",
            ".pnpm",
            ".cargo/bin",
            ".fnm/current/bin",
            ".nvm/versions/node/current/bin",
        ] {
            segments.push(format!("{home}/{suffix}"));
        }
    }

    if let Ok(existing) = std::env::var("PATH") {
        for part in existing.split(':').filter(|p| !p.is_empty()) {
            segments.push(part.to_string());
        }
    }

    segments.join(":")
}

fn apply_path(cmd: &mut Command) {
    cmd.env("PATH", enriched_path());
}

pub fn run_command(program: &str, args: &[&str], cwd: Option<&Path>) -> Result<Output, String> {
    let mut cmd = Command::new(program);
    cmd.args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    apply_path(&mut cmd);

    if let Some(dir) = cwd {
        cmd.current_dir(dir);
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    cmd.output()
        .map_err(|e| format!("'{program}' çalıştırılamadı: {e}. PATH'te yüklü olduğundan emin olun."))
}

pub fn run_shell_command(command: &str, cwd: Option<&Path>) -> Result<Output, String> {
    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new("cmd");
        cmd.args(["/C", command])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        if let Some(dir) = cwd {
            cmd.current_dir(dir);
        }
        return cmd
            .output()
            .map_err(|e| format!("Komut çalıştırılamadı: {e}"));
    }

    #[cfg(not(target_os = "windows"))]
    {
        let mut cmd = Command::new("sh");
        cmd.args(["-c", command])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        apply_path(&mut cmd);
        if let Some(dir) = cwd {
            cmd.current_dir(dir);
        }
        return cmd
            .output()
            .map_err(|e| format!("Komut çalıştırılamadı: {e}"));
    }
}

pub fn output_to_log(output: &Output) -> String {
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    format!("{stdout}{stderr}").trim().to_string()
}

pub fn command_exists(program: &str) -> bool {
    #[cfg(target_os = "windows")]
    {
        run_command("where", &[program], None)
            .map(|o| o.status.success())
            .unwrap_or(false)
    }

    #[cfg(not(target_os = "windows"))]
    {
        run_command("sh", &["-c", &format!("command -v {program}")], None)
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
}

pub fn spawn_detached(program: &str, args: &[&str], cwd: Option<&Path>) -> Result<(), String> {
    let mut cmd = Command::new(program);
    cmd.args(args);
    apply_path(&mut cmd);

    if let Some(dir) = cwd {
        cmd.current_dir(dir);
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000 | 0x00000008); // CREATE_NO_WINDOW | DETACHED_PROCESS
    }

    cmd.spawn()
        .map(|_| ())
        .map_err(|e| format!("'{program}' başlatılamadı: {e}"))
}
