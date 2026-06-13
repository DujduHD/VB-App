/// Framework metadata & deploy profilleri (cross-module)

pub fn framework_label(framework: &str) -> &str {
    match normalize(framework) {
        "nextjs-blank" => "Next.js",
        "nextjs-auth" => "Next.js + Auth",
        "vite-react" => "Vite + React",
        "vite-vue" => "Vite + Vue",
        "vite-svelte" => "Vite + Svelte",
        "remix" => "Remix",
        "astro" => "Astro",
        "nuxt" => "Nuxt 3",
        "sveltekit" => "SvelteKit",
        "tauri-vite" => "Tauri + Vite",
        "electron-vite" => "Electron + Vite",
        "expo-blank" => "Expo (Blank)",
        "expo-router" => "Expo Router",
        "react-native-supabase" => "Expo + Supabase",
        "flutter" => "Flutter",
        other => other,
    }
}

pub fn normalize(framework: &str) -> &str {
    if framework == "vite-blank" {
        "vite-react"
    } else {
        framework
    }
}

pub fn is_mobile(framework: &str) -> bool {
    matches!(
        normalize(framework),
        "expo-blank" | "expo-router" | "react-native-supabase" | "flutter"
    )
}

pub fn is_desktop_native(framework: &str) -> bool {
    matches!(normalize(framework), "tauri-vite" | "electron-vite")
}

pub fn vercel_framework(framework: &str) -> &str {
    match normalize(framework) {
        "nextjs-blank" | "nextjs-auth" => "nextjs",
        "nuxt" => "nuxtjs",
        "sveltekit" => "sveltekit",
        "astro" => "astro",
        "remix" => "remix",
        _ => "vite",
    }
}

pub fn publish_dir(framework: &str) -> &str {
    match normalize(framework) {
        "nextjs-blank" | "nextjs-auth" => ".next",
        "nuxt" => ".output/public",
        "astro" => "dist",
        "sveltekit" => "build",
        "remix" => "build/client",
        _ => "dist",
    }
}

pub fn build_script(framework: &str) -> &str {
    match normalize(framework) {
        "flutter" => "build",
        _ => "build",
    }
}

pub fn start_script(framework: &str) -> &str {
    match normalize(framework) {
        "nextjs-blank" | "nextjs-auth" => "start",
        "tauri-vite" => "tauri dev",
        "electron-vite" => "dev",
        "expo-blank" | "expo-router" | "react-native-supabase" => "start",
        "flutter" => "run",
        _ => "preview",
    }
}

pub fn dev_script(framework: &str) -> &str {
    match normalize(framework) {
        "tauri-vite" => "tauri dev",
        "electron-vite" => "dev",
        "expo-blank" | "expo-router" | "react-native-supabase" => "start",
        "flutter" => "run",
        _ => "dev",
    }
}

pub fn supports_web_deploy(framework: &str) -> bool {
    !is_mobile(framework) && !is_desktop_native(framework)
}

pub fn readme_dev_command(package_manager: &str, framework: &str) -> String {
    match normalize(framework) {
        "tauri-vite" => format!("{package_manager} tauri dev"),
        "flutter" => "flutter run".into(),
        "expo-blank" | "expo-router" | "react-native-supabase" => {
            format!("{package_manager} start")
        }
        "electron-vite" => format!("{package_manager} dev"),
        _ => match package_manager {
            "yarn" => format!("yarn {}", dev_script(framework)),
            _ => format!("{package_manager} run {}", dev_script(framework)),
        },
    }
}

pub fn readme_install_command(package_manager: &str, framework: &str) -> String {
    if normalize(framework) == "flutter" {
        "flutter pub get".into()
    } else {
        match package_manager {
            "pnpm" => "pnpm install".into(),
            "yarn" => "yarn install".into(),
            "bun" => "bun install".into(),
            _ => "npm install".into(),
        }
    }
}
