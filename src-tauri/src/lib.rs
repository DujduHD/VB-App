mod commands;
mod models;
mod services;

use commands::{
    add_github_actions, analyze_project, check_dependencies, check_domain_availability,
    copy_to_clipboard, create_project, find_free_port, inject_env, inject_media,
    install_dependencies, load_global_env_vault, load_time_capsule, pick_logo_file,
    pick_media_files, pick_project_directory, preview_prompt, read_logo_preview,
    remove_from_capsule, remove_staged_logo, save_global_env_vault, save_share_image_png,
    setup_project_dns, wake_project,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_time_capsule,
            analyze_project,
            create_project,
            wake_project,
            find_free_port,
            preview_prompt,
            remove_from_capsule,
            pick_logo_file,
            pick_project_directory,
            read_logo_preview,
            remove_staged_logo,
            check_domain_availability,
            check_dependencies,
            install_dependencies,
            setup_project_dns,
            pick_media_files,
            inject_media,
            copy_to_clipboard,
            load_global_env_vault,
            save_global_env_vault,
            inject_env,
            add_github_actions,
            save_share_image_png,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
