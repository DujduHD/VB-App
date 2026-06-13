// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// WebKit2GTK + Wayland compositor uyumsuzluğunda EPERM (71) protokol hatasını önler.
/// XWayland üzerinden X11 backend kullanır; Windows/macOS etkilenmez.
/// Native Wayland isteyenler: VB_USE_WAYLAND=1 npm run tauri dev
#[cfg(target_os = "linux")]
fn prepare_linux_display() {
    let use_wayland = std::env::var("VB_USE_WAYLAND")
        .map(|v| v == "1" || v.eq_ignore_ascii_case("true"))
        .unwrap_or(false);

    if use_wayland {
        return;
    }

    std::env::set_var("GDK_BACKEND", "x11");

    if std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }
}

fn main() {
    #[cfg(target_os = "linux")]
    prepare_linux_display();

    tauri_app_lib::run()
}
