use std::path::Path;

use crate::models::IntegrationsConfig;

use super::baas::append_baas_env;

pub struct EnvPorts {
    pub app_port: u16,
    pub postgres_port: u16,
    pub redis_port: u16,
}

pub fn resolve_env_ports(app_port: u16, docker_enabled: bool) -> EnvPorts {
    use super::port::find_available_port;

    EnvPorts {
        app_port,
        postgres_port: if docker_enabled {
            find_available_port(5432)
        } else {
            5432
        },
        redis_port: if docker_enabled {
            find_available_port(6379)
        } else {
            6379
        },
    }
}

pub fn build_env_content(ports: &EnvPorts, integrations: &IntegrationsConfig) -> String {
    let mut lines = vec![
        "# VB tarafından otomatik oluşturuldu".to_string(),
        format!("PORT={}", ports.app_port),
        format!("NEXT_PUBLIC_PORT={}", ports.app_port),
        format!("VITE_PORT={}", ports.app_port),
    ];

    append_baas_env(&mut lines, integrations);

    if integrations.docker_enabled {
        lines.push(format!("POSTGRES_PORT={}", ports.postgres_port));
        lines.push(format!("REDIS_PORT={}", ports.redis_port));
        if integrations.baas_provider == "none" {
            lines.push(format!(
                "DATABASE_URL=postgresql://vb:vb@localhost:{}/vb",
                ports.postgres_port
            ));
        }
        lines.push(format!(
            "REDIS_URL=redis://localhost:{}",
            ports.redis_port
        ));
    }

    lines.join("\n") + "\n"
}

pub fn write_env_local(
    project_path: &Path,
    ports: &EnvPorts,
    integrations: &IntegrationsConfig,
) -> Result<(), String> {
    let content = build_env_content(ports, integrations);
    let env_path = project_path.join(".env.local");
    std::fs::write(&env_path, content).map_err(|e| format!(".env.local yazılamadı: {e}"))
}
