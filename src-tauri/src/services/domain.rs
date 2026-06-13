use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum DomainAvailability {
    Available,
    Taken,
}

fn rdap_client() -> Result<reqwest::blocking::Client, String> {
    reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .redirect(reqwest::redirect::Policy::limited(10))
        .user_agent("VB-DomainCheck/1.0 (+https://github.com)")
        .build()
        .map_err(|e| format!("HTTP istemcisi oluşturulamadı: {e}"))
}

fn availability_from_status(status: u16) -> Result<DomainAvailability, String> {
    match status {
        404 => Ok(DomainAvailability::Available),
        200 => Ok(DomainAvailability::Taken),
        302 | 301 => Err(
            "RDAP yönlendirmesi tamamlanamadı. Lütfen tekrar deneyin.".into(),
        ),
        status => Err(format!("RDAP beklenmeyen durum kodu: {status}")),
    }
}

pub fn check_domain_availability(domain: &str) -> Result<DomainAvailability, String> {
    let domain = domain.trim().to_lowercase();
    if domain.is_empty() {
        return Err("Domain adı boş olamaz.".into());
    }
    if !domain.contains('.') || domain.starts_with('.') || domain.ends_with('.') {
        return Err("Geçerli bir domain girin (örn: focusflow.com).".into());
    }

    let client = rdap_client()?;
    let url = format!("https://rdap.org/domain/{domain}");

    let response = client
        .get(&url)
        .header(reqwest::header::ACCEPT, "application/rdap+json, application/json")
        .send()
        .map_err(|e| format!("Ağ hatası: {e}"))?;

    availability_from_status(response.status().as_u16())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[ignore = "requires network"]
    fn rdap_taken_domain_returns_taken() {
        let result = check_domain_availability("google.com").expect("query should succeed");
        assert!(matches!(result, DomainAvailability::Taken));
    }

    #[test]
    #[ignore = "requires network"]
    fn rdap_free_domain_returns_available() {
        let result =
            check_domain_availability("thisdomaindoesnotexistvb12345.com").expect("query should succeed");
        assert!(matches!(result, DomainAvailability::Available));
    }
}
