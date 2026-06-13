use std::path::Path;

use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SetupDnsResult {
    pub logs: Vec<String>,
}

#[derive(Clone, Copy)]
struct DnsRecord<'a> {
    record_type: &'a str,
    name: &'a str,
    content: &'a str,
}

fn cf_client(token: &str) -> Result<reqwest::blocking::Client, String> {
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        reqwest::header::AUTHORIZATION,
        format!("Bearer {token}")
            .parse()
            .map_err(|e| format!("Authorization header hatası: {e}"))?,
    );
    headers.insert(
        reqwest::header::CONTENT_TYPE,
        "application/json".parse().unwrap(),
    );

    reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .default_headers(headers)
        .build()
        .map_err(|e| format!("HTTP istemcisi oluşturulamadı: {e}"))
}

fn deploy_dns_records(deploy_target: &str) -> Result<Vec<DnsRecord<'static>>, String> {
    let records = match deploy_target {
        "vercel" => vec![
            DnsRecord {
                record_type: "A",
                name: "@",
                content: "76.76.21.21",
            },
            DnsRecord {
                record_type: "CNAME",
                name: "www",
                content: "cname.vercel-dns.com",
            },
        ],
        "netlify" => vec![
            DnsRecord {
                record_type: "A",
                name: "@",
                content: "75.2.60.5",
            },
            DnsRecord {
                record_type: "CNAME",
                name: "www",
                content: "apex-loadbalancer.netlify.com",
            },
        ],
        "render" => vec![DnsRecord {
            record_type: "CNAME",
            name: "www",
            content: "onrender.com",
        }],
        "cloudflare-pages" => vec![DnsRecord {
            record_type: "CNAME",
            name: "www",
            content: "pages.dev",
        }],
        "railway" => vec![DnsRecord {
            record_type: "CNAME",
            name: "www",
            content: "up.railway.app",
        }],
        "fly-io" => vec![DnsRecord {
            record_type: "A",
            name: "@",
            content: "66.241.125.94",
        }],
        "aws-amplify" => vec![DnsRecord {
            record_type: "CNAME",
            name: "www",
            content: "cloudfront.net",
        }],
        "github-pages" => vec![
            DnsRecord {
                record_type: "A",
                name: "@",
                content: "185.199.108.153",
            },
            DnsRecord {
                record_type: "CNAME",
                name: "www",
                content: "github.io",
            },
        ],
        other => {
            return Err(format!(
                "Desteklenmeyen deploy hedefi için DNS: {other}"
            ));
        }
    };

    Ok(records)
}

#[derive(Deserialize)]
struct CfZoneResponse {
    success: bool,
    result: Vec<CfZone>,
    errors: Option<Vec<CfApiError>>,
}

#[derive(Deserialize)]
struct CfZone {
    id: String,
    name: String,
}

#[derive(Deserialize)]
struct CfDnsResponse {
    success: bool,
    errors: Option<Vec<CfApiError>>,
}

#[derive(Deserialize)]
struct CfApiError {
    message: String,
}

fn fetch_zone_id(client: &reqwest::blocking::Client, domain: &str) -> Result<String, String> {
    let url = format!("https://api.cloudflare.com/client/v4/zones?name={domain}");
    let response = client
        .get(&url)
        .send()
        .map_err(|e| format!("Cloudflare zone sorgusu başarısız: {e}"))?;

    let status = response.status();
    let body: CfZoneResponse = response
        .json()
        .map_err(|e| format!("Cloudflare yanıtı okunamadı: {e}"))?;

    if !body.success {
        let msg = body
            .errors
            .and_then(|e| e.first().map(|x| x.message.clone()))
            .unwrap_or_else(|| "Zone sorgusu başarısız".into());
        return Err(format!("Cloudflare ({status}): {msg}"));
    }

    body.result
        .into_iter()
        .find(|z| z.name.eq_ignore_ascii_case(domain))
        .map(|z| z.id)
        .ok_or_else(|| {
            format!(
                "{domain} için Cloudflare zone bulunamadı. Domain'i Cloudflare hesabına ekleyin."
            )
        })
}

fn create_dns_record(
    client: &reqwest::blocking::Client,
    zone_id: &str,
    domain: &str,
    record: DnsRecord,
    logs: &mut Vec<String>,
) -> Result<(), String> {
    let record_name = if record.name == "@" {
        domain.to_string()
    } else {
        format!("{}.{}", record.name, domain)
    };

    #[derive(Serialize)]
    struct CreateRecord<'a> {
        #[serde(rename = "type")]
        record_type: &'a str,
        name: String,
        content: &'a str,
        ttl: u32,
        proxied: bool,
    }

    let payload = CreateRecord {
        record_type: record.record_type,
        name: record_name.clone(),
        content: record.content,
        ttl: 1,
        proxied: false,
    };

    let url = format!("https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records");
    let response = client
        .post(&url)
        .json(&payload)
        .send()
        .map_err(|e| format!("DNS kaydı oluşturulamadı ({record_name}): {e}"))?;

    let status = response.status();
    let body: CfDnsResponse = response
        .json()
        .map_err(|e| format!("DNS yanıtı okunamadı: {e}"))?;

    if !body.success {
        let msg = body
            .errors
            .and_then(|e| e.first().map(|x| x.message.clone()))
            .unwrap_or_else(|| "Kayıt oluşturulamadı".into());
        return Err(format!("DNS {record_name} ({status}): {msg}"));
    }

    logs.push(format!(
        "DNS kaydı eklendi: {} {} → {}",
        record.record_type, record_name, record.content
    ));
    Ok(())
}

fn upsert_env_site_url(project_path: &Path, domain: &str, logs: &mut Vec<String>) -> Result<(), String> {
    let env_path = project_path.join(".env.local");
    let line = format!("NEXT_PUBLIC_SITE_URL=https://{domain}");

    let mut lines: Vec<String> = if env_path.exists() {
        std::fs::read_to_string(&env_path)
            .map_err(|e| format!(".env.local okunamadı: {e}"))?
            .lines()
            .map(str::to_string)
            .collect()
    } else {
        Vec::new()
    };

    let key = "NEXT_PUBLIC_SITE_URL=";
    if let Some(idx) = lines.iter().position(|l| l.starts_with(key)) {
        lines[idx] = line.clone();
    } else {
        if !lines.is_empty() && !lines.last().unwrap().is_empty() {
            lines.push(String::new());
        }
        lines.push(line.clone());
    }

    std::fs::write(&env_path, format!("{}\n", lines.join("\n")))
        .map_err(|e| format!(".env.local yazılamadı: {e}"))?;
    logs.push(format!(".env.local güncellendi: {line}"));
    Ok(())
}

fn write_vercel_dns_json(project_path: &Path, logs: &mut Vec<String>) -> Result<(), String> {
    let path = project_path.join("vercel.json");
    let content = r#"{
  "cleanUrls": true,
  "trailingSlash": false
}
"#;
    std::fs::write(&path, content).map_err(|e| format!("vercel.json yazılamadı: {e}"))?;
    logs.push("vercel.json oluşturuldu (cleanUrls, trailingSlash).".into());
    Ok(())
}

pub fn setup_project_dns(
    domain: &str,
    token: &str,
    deploy_target: &str,
    project_path: &str,
) -> Result<SetupDnsResult, String> {
    let domain = domain.trim().to_lowercase();
    if domain.is_empty() {
        return Err("Domain boş olamaz.".into());
    }
    if token.trim().is_empty() {
        return Err("Cloudflare API token gerekli.".into());
    }
    if deploy_target == "none" {
        return Err("Deploy hedefi seçilmedi.".into());
    }

    let project_path = Path::new(project_path.trim());
    if !project_path.is_dir() {
        return Err(format!(
            "Proje klasörü bulunamadı: {}",
            project_path.display()
        ));
    }

    let mut logs = vec![format!("Magic DNS başlatıldı: {domain} → {deploy_target}")];

    let records = deploy_dns_records(deploy_target)?;
    let client = cf_client(token.trim())?;

    logs.push("Cloudflare zone aranıyor...".into());
    let zone_id = fetch_zone_id(&client, &domain)?;
    logs.push(format!("Zone ID bulundu: {zone_id}"));

    for record in records {
        create_dns_record(&client, &zone_id, &domain, record, &mut logs)?;
    }

    upsert_env_site_url(project_path, &domain, &mut logs)?;

    if deploy_target == "vercel" {
        write_vercel_dns_json(project_path, &mut logs)?;
    }

    logs.push("Magic DNS tamamlandı.".into());
    Ok(SetupDnsResult { logs })
}
