use std::path::Path;
use std::thread;
use std::time::Duration;

use super::shell::{command_exists, output_to_log, run_command, run_shell_command};
use crate::services::env::EnvPorts;

const COMPOSE_TEMPLATE: &str = r#"# VB tarafından otomatik oluşturuldu
name: vb-dev-stack

services:
  postgres:
    image: postgres:16-alpine
    container_name: vb-postgres
    restart: unless-stopped
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    environment:
      POSTGRES_USER: vb
      POSTGRES_PASSWORD: vb
      POSTGRES_DB: vb
    volumes:
      - vb_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vb -d vb"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s

  redis:
    image: redis:7-alpine
    container_name: vb-redis
    restart: unless-stopped
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - vb_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 5s

volumes:
  vb_postgres_data:
  vb_redis_data:
"#;

pub fn write_docker_compose(project_path: &Path) -> Result<(), String> {
    let compose_path = project_path.join("docker-compose.yml");
    std::fs::write(&compose_path, COMPOSE_TEMPLATE)
        .map_err(|e| format!("docker-compose.yml yazılamadı: {e}"))
}

fn uses_compose_plugin() -> bool {
    run_command("docker", &["compose", "version"], None)
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn compose_invocation() -> Result<&'static str, String> {
    if uses_compose_plugin() {
        Ok("docker compose")
    } else if command_exists("docker-compose") {
        Ok("docker-compose")
    } else {
        Err(
            "Docker Compose bulunamadı. Docker Desktop veya docker-compose-plugin kurun.".into(),
        )
    }
}

/// Daemon kapalıysa Linux'ta systemctl ile başlatmayı dener.
pub fn ensure_docker_daemon(logs: &mut Vec<String>) -> Result<(), String> {
    if !command_exists("docker") {
        return Err(
            "Docker yüklü değil. https://docs.docker.com/get-docker/ adresinden kurun.".into(),
        );
    }

    if docker_info_ok() {
        logs.push("Docker daemon hazır.".into());
        return Ok(());
    }

    logs.push("Docker daemon başlatılıyor...".into());

    #[cfg(target_os = "linux")]
    {
        let _ = run_command("systemctl", &["start", "docker"], None);
        for _ in 0..6 {
            thread::sleep(Duration::from_secs(2));
            if docker_info_ok() {
                logs.push("Docker daemon başlatıldı.".into());
                return Ok(());
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        let _ = run_command("open", &["-a", "Docker"], None);
        for _ in 0..15 {
            thread::sleep(Duration::from_secs(2));
            if docker_info_ok() {
                logs.push("Docker Desktop başlatıldı.".into());
                return Ok(());
            }
        }
    }

    if docker_info_ok() {
        logs.push("Docker daemon hazır.".into());
        return Ok(());
    }

    Err(
        "Docker daemon çalışmıyor. Docker Desktop'ı açın veya 'sudo systemctl start docker' deneyin."
            .into(),
    )
}

fn docker_info_ok() -> bool {
    run_command("docker", &["info"], None)
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn run_compose(
    project_path: &Path,
    env_ports: &EnvPorts,
    args: &str,
    logs: &mut Vec<String>,
    step: &str,
) -> Result<(), String> {
    let compose = compose_invocation()?;
    let env = format!(
        "POSTGRES_PORT={} REDIS_PORT={}",
        env_ports.postgres_port, env_ports.redis_port
    );
    let env_file = project_path.join(".env.local");
    let env_file_flag = if env_file.exists() {
        format!(" --env-file .env.local")
    } else {
        String::new()
    };

    let cmd = format!("{env} {compose}{env_file_flag} {args}");
    logs.push(format!("{step}..."));

    let output = run_shell_command(&cmd, Some(project_path))?;
    let log = output_to_log(&output);
    if !log.is_empty() {
        logs.push(log);
    }

    if !output.status.success() {
        return Err(format!(
            "{step} başarısız (kod: {:?})",
            output.status.code()
        ));
    }

    Ok(())
}

fn verify_stack(project_path: &Path, logs: &mut Vec<String>) -> Result<(), String> {
    let compose = compose_invocation()?;
    let cmd = format!("{compose} ps --status running --format json");
    let output = run_shell_command(&cmd, Some(project_path))?;
    let log = output_to_log(&output);

    if !output.status.success() {
        return Err("Konteyner durumu doğrulanamadı.".into());
    }

    let running = log.lines().filter(|l| !l.trim().is_empty()).count();
    if running >= 2 {
        logs.push(format!("{running} konteyner çalışıyor (sağlık kontrolü geçti)."));
        Ok(())
    } else {
        Err(format!(
            "Beklenen konteynerler ayakta değil (çalışan: {running})."
        ))
    }
}

pub fn docker_up(project_path: &Path, ports: &EnvPorts) -> Result<Vec<String>, String> {
    let mut logs = vec!["VB Dev Stack kuruluyor...".to_string()];

    ensure_docker_daemon(&mut logs)?;

    run_compose(
        project_path,
        ports,
        "pull -q",
        &mut logs,
        "Docker imajları indiriliyor",
    )?;

    run_compose(
        project_path,
        ports,
        "up -d --remove-orphans --wait --wait-timeout 120",
        &mut logs,
        "Konteynerler arka planda başlatılıyor",
    )?;

    verify_stack(project_path, &mut logs)?;

    logs.push(format!(
        "VB Dev Stack hazır — DB :{} | Cache :{}",
        ports.postgres_port, ports.redis_port
    ));

    Ok(logs)
}

pub fn docker_up_if_exists(project_path: &Path) -> Result<Vec<String>, String> {
    let compose_path = project_path.join("docker-compose.yml");
    if !compose_path.exists() {
        return Ok(vec![]);
    }

    let (postgres_port, redis_port) = read_docker_ports_from_env(project_path);
    let ports = EnvPorts {
        app_port: 3000,
        postgres_port,
        redis_port,
    };

    docker_up(project_path, &ports)
}

fn read_docker_ports_from_env(project_path: &Path) -> (u16, u16) {
    let env_path = project_path.join(".env.local");
    let Ok(content) = std::fs::read_to_string(&env_path) else {
        return (5432, 6379);
    };

    let mut postgres = 5432u16;
    let mut redis = 6379u16;

    for line in content.lines() {
        if let Some(val) = line.strip_prefix("POSTGRES_PORT=") {
            if let Ok(p) = val.trim().parse() {
                postgres = p;
            }
        }
        if let Some(val) = line.strip_prefix("REDIS_PORT=") {
            if let Ok(p) = val.trim().parse() {
                redis = p;
            }
        }
    }

    (postgres, redis)
}
