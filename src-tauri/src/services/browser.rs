use open;

pub fn open_url(url: &str) -> Result<(), String> {
    open::that(url).map_err(|e| format!("URL açılamadı ({url}): {e}"))
}

pub fn ui_ux_url(tool: &str) -> Option<&'static str> {
    match tool {
        "figma" => Some("https://www.figma.com/files/recent"),
        "framer" => Some("https://framer.com/projects/"),
        "penpot" => Some("https://app.penpot.app/"),
        "canva" => Some("https://www.canva.com/"),
        "spline" => Some("https://app.spline.design/"),
        "stick" => Some("https://stick.ai/"),
        "v0" => Some("https://v0.dev/"),
        "uizard" => Some("https://app.uizard.io/"),
        "relume" => Some("https://www.relume.io/"),
        "miro" => Some("https://miro.com/app/dashboard/"),
        "excalidraw" => Some("https://excalidraw.com/"),
        "dribbble" => Some("https://dribbble.com/"),
        "mobbin" => Some("https://mobbin.com/"),
        _ => None,
    }
}

pub fn ui_ux_label(tool: &str) -> &str {
    match tool {
        "figma" => "Figma",
        "framer" => "Framer",
        "penpot" => "Penpot",
        "canva" => "Canva",
        "spline" => "Spline",
        "stick" => "Stick",
        "v0" => "v0",
        "uizard" => "Uizard",
        "relume" => "Relume",
        "miro" => "Miro",
        "excalidraw" => "Excalidraw",
        "dribbble" => "Dribbble",
        "mobbin" => "Mobbin",
        "none" => "UI/UX yok",
        other => other,
    }
}

pub fn open_ui_ux_tool(tool: &str, logs: &mut Vec<String>) -> Result<(), String> {
    let Some(url) = ui_ux_url(tool) else {
        return Ok(());
    };
    open_url(url)?;
    logs.push(format!(
        "UI/UX aracı tarayıcıda açıldı: {}",
        ui_ux_label(tool)
    ));
    Ok(())
}

/// Lofi Girl — beats to relax/study to
pub const SPOTIFY_LOFI_PLAYLIST: &str = "spotify:playlist:0vvXsWfq9tJ0ujHaibFSDP";

/// YouTube Music — odak / lofi araması
pub const YOUTUBE_MUSIC_FOCUS: &str =
    "https://music.youtube.com/search?q=lofi+focus+study+beats";

pub fn music_provider_label(provider: &str) -> &str {
    match provider {
        "spotify" => "Spotify",
        "youtube-music" => "YouTube Music",
        _ => "Yok",
    }
}

pub fn resolve_music_provider(music_provider: &str, spotify_enabled: bool) -> &str {
    if music_provider != "none" && !music_provider.is_empty() {
        return music_provider;
    }
    if spotify_enabled {
        "spotify"
    } else {
        "none"
    }
}

fn encode_query_component(input: &str) -> String {
    let mut out = String::new();
    for byte in input.trim().bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(byte as char);
            }
            b' ' => out.push('+'),
            _ => out.push_str(&format!("%{byte:02X}")),
        }
    }
    out
}

fn build_spotify_url(query: &str) -> String {
    let q = query.trim();
    if q.is_empty() {
        return SPOTIFY_LOFI_PLAYLIST.into();
    }
    if q.starts_with("spotify:") {
        return q.into();
    }
    if q.contains("open.spotify.com") {
        return if q.starts_with("http") {
            q.into()
        } else {
            format!("https://{q}")
        };
    }
    format!(
        "https://open.spotify.com/search/{}",
        encode_query_component(q)
    )
}

fn build_youtube_music_url(query: &str) -> String {
    let q = query.trim();
    if q.is_empty() {
        return YOUTUBE_MUSIC_FOCUS.into();
    }
    if q.starts_with("http://") || q.starts_with("https://") {
        return q.into();
    }
    format!(
        "https://music.youtube.com/search?q={}",
        encode_query_component(q)
    )
}

pub fn open_spotify(query: &str, logs: &mut Vec<String>) -> Result<(), String> {
    let url = build_spotify_url(query);
    open_url(&url)?;
    let label = if query.trim().is_empty() {
        "varsayılan Lofi / Focus".to_string()
    } else {
        query.trim().to_string()
    };
    logs.push(format!("Spotify açıldı: {label}"));
    Ok(())
}

pub fn open_youtube_music(query: &str, logs: &mut Vec<String>) -> Result<(), String> {
    let url = build_youtube_music_url(query);
    open_url(&url)?;
    let label = if query.trim().is_empty() {
        "varsayılan odak araması".to_string()
    } else {
        query.trim().to_string()
    };
    logs.push(format!("YouTube Music açıldı: {label}"));
    Ok(())
}

pub fn open_music(provider: &str, query: &str, logs: &mut Vec<String>) -> Result<(), String> {
    match provider {
        "spotify" => open_spotify(query, logs),
        "youtube-music" => open_youtube_music(query, logs),
        _ => Ok(()),
    }
}

pub fn deploy_dashboard_url(target: &str) -> Option<&'static str> {
    match target {
        "vercel" => Some("https://vercel.com/dashboard"),
        "netlify" => Some("https://app.netlify.com/"),
        "render" => Some("https://dashboard.render.com/"),
        "cloudflare-pages" => Some("https://dash.cloudflare.com/"),
        "fly-io" => Some("https://fly.io/dashboard"),
        "railway" => Some("https://railway.app/dashboard"),
        "aws-amplify" => Some("https://console.aws.amazon.com/amplify/home"),
        "github-pages" => Some("https://github.com/settings/pages"),
        _ => None,
    }
}

pub fn open_deploy_dashboard(target: &str, logs: &mut Vec<String>) -> Result<(), String> {
    let Some(url) = deploy_dashboard_url(target) else {
        return Ok(());
    };
    open_url(url)?;
    logs.push(format!("Deploy paneli açıldı: {target}"));
    Ok(())
}

pub fn open_dev_server(port: u16, logs: &mut Vec<String>) -> Result<(), String> {
    let url = format!("http://localhost:{port}");
    open_url(&url)?;
    logs.push(format!("Dev sunucusu tarayıcıda açıldı: {url}"));
    Ok(())
}
