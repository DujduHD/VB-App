import i18n from "../i18n";

/** Rust backend her zaman Türkçe log üretir — UI'da seçili dile çevrilir. */
const EXACT: Record<string, string> = {
  "Proje oluşturuluyor...": "logs.creatingProject",
  "Sistem taranıyor...": "logs.scanningSystem",
  "Eksik araçlar kuruluyor...": "logs.installingDeps",
  "Magic DNS başlatılıyor...": "logs.magicDnsStarting",
  ".env.local oluşturuldu.": "logs.envLocalCreated",
  "docker-compose.yml oluşturuldu.": "logs.dockerComposeCreated",
  "README.md oluşturuldu.": "logs.readmeCreated",
  "Zaman Kapsülüne kaydedildi.": "logs.savedToCapsule",
  "Vibe otomasyonu başlatılıyor...": "logs.vibeStarting",
  "Editör açılıyor...": "logs.editorOpening",
  "İlk prompt panoya kopyalandı.": "logs.promptCopied",
  "Prompt panoya kopyalandı.": "logs.promptCopiedWake",
  ".cursorrules oluşturuldu.": "logs.cursorrulesCreated",
  ".windsurfrules oluşturuldu.": "logs.windsurfrulesCreated",
  "API anahtarları şifreli olarak kaydedildi.": "logs.secretsSaved",
  "git init tamamlandı.": "logs.gitInitDone",
  "SSH anahtarı git için yapılandırıldı.": "logs.sshConfigured",
  "git remote origin eklendi.": "logs.remoteAdded",
  "✓ Tüm ortam tek tıkla uyandırıldı.": "logs.environmentWoken",
  "Git yüklü değil — GitHub push atlandı.": "logs.gitNotInstalledGithub",
  "Git yüklü değil — git adımı atlandı.": "logs.gitNotInstalledSkip",
  "Git deposu zaten mevcut.": "logs.gitRepoExists",
  "Commit atlandı — değişiklik yok.": "logs.gitCommitSkipped",
  "GitHub yeni repo sayfası tarayıcıda açıldı.": "logs.githubNewTabOpened",
  ".gitignore güncellendi (.env.local eklendi).": "logs.gitignoreUpdated",
  ".gitignore oluşturuldu.": "logs.gitignoreCreated",
  "VB Dev Stack yapılandırması bulunamadı.": "logs.devStackNotFound",
  "Tüm gerekli araçlar hazır.": "logs.allToolsReady",
  "Docker daemon hazır.": "logs.dockerDaemonReady",
  "Docker daemon başlatılıyor...": "logs.dockerDaemonStarting",
  "Docker daemon başlatıldı.": "logs.dockerDaemonStarted",
  "Docker Desktop başlatıldı.": "logs.dockerDesktopStarted",
  "Cloudflare zone aranıyor...": "logs.cloudflareZoneSearching",
  "Magic DNS tamamlandı.": "logs.magicDnsComplete",
  "npm bulunamadı — önce Node.js kuruluyor...": "logs.npmMissingInstallNode",
  "Sistem geneli npm dizini — yetki isteniyor...": "logs.npmGlobalPermission",
  "Uyarı: Bağımlılık kurulumu başarısız — manuel çalıştırabilirsiniz.":
    "logs.depsInstallManual",
  "Sistem dosya yöneticisinde açıldı (editör bulunamadı).":
    "logs.openedInFileManager",
  "vercel.json oluşturuldu.": "logs.vercelJsonCreated",
  "netlify.toml oluşturuldu.": "logs.netlifyTomlCreated",
  "render.yaml oluşturuldu.": "logs.renderYamlCreated",
  "wrangler.toml oluşturuldu.": "logs.wranglerTomlCreated",
  "fly.toml oluşturuldu.": "logs.flyTomlCreated",
  "railway.toml oluşturuldu.": "logs.railwayTomlCreated",
  "amplify.yml oluşturuldu.": "logs.amplifyYmlCreated",
  ".github/workflows/deploy.yml oluşturuldu.": "logs.githubWorkflowCreated",
  "vercel.json oluşturuldu (cleanUrls, trailingSlash).":
    "logs.vercelJsonDnsCreated",
  "Flutter iskeleti...": "logs.scaffoldFlutter",
};

const PATTERNS: {
  pattern: RegExp;
  key: string;
  map: (m: RegExpMatchArray) => Record<string, string | number>;
}[] = [
  {
    pattern: /^Uygulama portu: (\d+)$/,
    key: "logs.appPort",
    map: (m) => ({ port: m[1] }),
  },
  {
    pattern: /^Dev Stack portları — DB: (\d+), Cache: (\d+)$/,
    key: "logs.devStackPorts",
    map: (m) => ({ db: m[1], cache: m[2] }),
  },
  {
    pattern: /^Eksik araçlar: (.+)$/,
    key: "logs.missingTools",
    map: (m) => ({ tools: m[1] }),
  },
  {
    pattern: /^Git commit: "(.+)"$/,
    key: "logs.gitCommit",
    map: () => ({}),
  },
  {
    pattern: /^GitHub repo oluşturuldu: (.+)$/,
    key: "logs.githubRepoCreated",
    map: (m) => ({ repo: m[1] }),
  },
  {
    pattern: /^GitHub repo zaten mevcut: (.+)$/,
    key: "logs.githubRepoExistsNamed",
    map: (m) => ({ repo: m[1] }),
  },
  {
    pattern: /^GitHub'a push edildi \((.+)\)\.$/,
    key: "logs.githubPushed",
    map: (m) => ({ branch: m[1] }),
  },
  {
    pattern: /^⏳ Uyandırılıyor: (.+)$/,
    key: "logs.wakingProject",
    map: (m) => ({ name: m[1] }),
  },
  {
    pattern: /^Proje dizini hazır: (.+)$/,
    key: "logs.projectDirReady",
    map: (m) => ({ path: m[1] }),
  },
  {
    pattern: /^Kod editörü: (.+) — proje dizini açılacak\.$/,
    key: "logs.codeEditorOpenDir",
    map: (m) => ({ editor: m[1] }),
  },
  {
    pattern: /^Kod editörü: (.+)$/,
    key: "logs.codeEditorWake",
    map: (m) => ({ editor: m[1] }),
  },
  {
    pattern: /^Logo projeye eklendi: (.+)$/,
    key: "logs.logoInstalled",
    map: (m) => ({ path: m[1] }),
  },
  {
    pattern: /^Spotify açıldı: (.+)$/,
    key: "logs.spotifyOpened",
    map: (m) => ({ label: m[1] }),
  },
  {
    pattern: /^YouTube Music açıldı: (.+)$/,
    key: "logs.youtubeMusicOpened",
    map: (m) => ({ label: m[1] }),
  },
  {
    pattern: /^Deploy paneli açıldı: (.+)$/,
    key: "logs.deployPanelOpened",
    map: (m) => ({ target: m[1] }),
  },
  {
    pattern: /^Dev sunucusu tarayıcıda açıldı: (.+)$/,
    key: "logs.devServerOpened",
    map: (m) => ({ url: m[1] }),
  },
  {
    pattern: /^Deploy yapılandırması eklendi: (.+)$/,
    key: "logs.deployConfigAdded",
    map: (m) => ({ target: m[1] }),
  },
  {
    pattern: /^LICENSE \((.+)\) oluşturuldu\.$/,
    key: "logs.licenseCreated",
    map: (m) => ({ license: m[1] }),
  },
  {
    pattern: /^package\.json author: (.+)$/,
    key: "logs.packageJsonAuthor",
    map: (m) => ({ author: m[1] }),
  },
  {
    pattern: /^Zone ID bulundu: (.+)$/,
    key: "logs.zoneIdFound",
    map: (m) => ({ zoneId: m[1] }),
  },
  {
    pattern: /^\.env\.local güncellendi: (.+)$/,
    key: "logs.envLocalUpdated",
    map: (m) => ({ line: m[1] }),
  },
  {
    pattern: /^(\d+) konteyner çalışıyor \(sağlık kontrolü geçti\)\.$/,
    key: "logs.containersHealthy",
    map: (m) => ({ count: m[1] }),
  },
  {
    pattern: /^Bağımlılıklar yükleniyor: (.+)$/,
    key: "logs.installingDependencies",
    map: (m) => ({ cmd: m[1] }),
  },
  {
    pattern: /^pacman ile kuruluyor: (.+)$/,
    key: "logs.pacmanInstalling",
    map: (m) => ({ package: m[1] }),
  },
  {
    pattern: /^(.+) kuruldu\.$/,
    key: "logs.packageInstalled",
    map: (m) => ({ package: m[1] }),
  },
  {
    pattern: /^npm global kurulum: (.+) \(prefix: (.+)\)$/,
    key: "logs.npmGlobalInstall",
    map: (m) => ({ package: m[1], prefix: m[2] }),
  },
  {
    pattern: /^(.+) \(npm -g\) kuruldu\.$/,
    key: "logs.npmGlobalInstalled",
    map: (m) => ({ package: m[1] }),
  },
  {
    pattern: /^(.+) zaten yüklü\.$/,
    key: "logs.alreadyInstalled",
    map: (m) => ({ label: m[1] }),
  },
  {
    pattern: /^(.+) için otomatik kurulum tanımlı değil\.$/,
    key: "logs.noAutoInstall",
    map: (m) => ({ label: m[1] }),
  },
  {
    pattern: /^Bilinmeyen bağımlılık atlandı: (.+)$/,
    key: "logs.unknownDepSkipped",
    map: (m) => ({ id: m[1] }),
  },
];

const SCAFFOLD_PATTERNS: { pattern: RegExp; key: string }[] = [
  { pattern: /^Next\.js iskeleti \((.+)\)\.\.\.$/, key: "logs.scaffoldNextjs" },
  { pattern: /^Vite \+ React \((.+)\)\.\.\.$/, key: "logs.scaffoldViteReact" },
  { pattern: /^Vite \+ Vue \((.+)\)\.\.\.$/, key: "logs.scaffoldViteVue" },
  { pattern: /^Vite \+ Svelte \((.+)\)\.\.\.$/, key: "logs.scaffoldViteSvelte" },
  { pattern: /^Remix \((.+)\)\.\.\.$/, key: "logs.scaffoldRemix" },
  { pattern: /^Astro \((.+)\)\.\.\.$/, key: "logs.scaffoldAstro" },
  { pattern: /^Nuxt \((.+)\)\.\.\.$/, key: "logs.scaffoldNuxt" },
  { pattern: /^SvelteKit \((.+)\)\.\.\.$/, key: "logs.scaffoldSvelteKit" },
  { pattern: /^Tauri \+ Vite \((.+)\)\.\.\.$/, key: "logs.scaffoldTauri" },
  { pattern: /^Electron \+ Vite \((.+)\)\.\.\.$/, key: "logs.scaffoldElectron" },
  { pattern: /^Expo Blank \((.+)\)\.\.\.$/, key: "logs.scaffoldExpoBlank" },
  { pattern: /^Expo Router \((.+)\)\.\.\.$/, key: "logs.scaffoldExpoRouter" },
  {
    pattern: /^Expo \+ Supabase \((.+)\)\.\.\.$/,
    key: "logs.scaffoldExpoSupabase",
  },
];

const WARNING_PATTERNS: { prefix: string; key: string }[] = [
  { prefix: "Docker uyarısı", key: "logs.warnings.docker" },
  { prefix: "Logo uyarısı", key: "logs.warnings.logo" },
  { prefix: "Deploy uyarısı", key: "logs.warnings.deploy" },
  { prefix: "Git uyarısı", key: "logs.warnings.git" },
  { prefix: "GitHub uyarısı", key: "logs.warnings.github" },
  { prefix: "Editör uyarısı", key: "logs.warnings.editor" },
  { prefix: "Pano uyarısı", key: "logs.warnings.clipboard" },
  { prefix: "UI/UX uyarısı", key: "logs.warnings.uiUx" },
  { prefix: "Müzik uyarısı", key: "logs.warnings.music" },
  { prefix: "Dev sunucu uyarısı", key: "logs.warnings.devServer" },
  { prefix: ".cursorrules uyarısı", key: "logs.warnings.cursorrules" },
  { prefix: ".windsurfrules uyarısı", key: "logs.warnings.windsurfrules" },
  { prefix: "package.json uyarısı", key: "logs.warnings.packageJson" },
  { prefix: "package.json parse uyarısı", key: "logs.warnings.packageJsonParse" },
  { prefix: "package.json yazma uyarısı", key: "logs.warnings.packageJsonWrite" },
  {
    prefix: "package.json serialize uyarısı",
    key: "logs.warnings.packageJsonSerialize",
  },
  { prefix: "LICENSE uyarısı", key: "logs.warnings.license" },
  { prefix: "git add uyarısı", key: "logs.warnings.gitAdd" },
  { prefix: "Git commit uyarısı", key: "logs.warnings.gitCommit" },
  { prefix: "git remote set-url uyarısı", key: "logs.warnings.gitRemoteSetUrl" },
  { prefix: "Git push uyarısı", key: "logs.warnings.gitPush" },
];

export function translateLogLine(line: string): string {
  const exactKey = EXACT[line];
  if (exactKey) return i18n.t(exactKey);

  for (const { pattern, key, map } of PATTERNS) {
    const match = line.match(pattern);
    if (match) return i18n.t(key, map(match));
  }

  for (const { pattern, key } of SCAFFOLD_PATTERNS) {
    const match = line.match(pattern);
    if (match) return i18n.t(key, { pm: match[1] });
  }

  for (const { prefix, key } of WARNING_PATTERNS) {
    const match = line.match(new RegExp(`^${escapeRegExp(prefix)}: (.+)$`));
    if (match) return i18n.t(key, { message: match[1] });
  }

  return line;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
