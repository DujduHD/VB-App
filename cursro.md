# Proje Kimliği: VB (Veli-Başlatıcı) - The Ultimate Vibe Coding Spawner

## 1. Proje Vizyonu ve Mimari Hedef
- **Uygulama Tipi:** Masaüstü Uygulaması (Primary). İleride Web Uygulamasına dönüştürülebilecek modüler mimari.
- **Hedef Kitle:** Vibe Coding yapan modern geliştiriciler, açık kaynak (GitHub) topluluğu.
- **İşletim Sistemi:** Platform bağımsız (Linux/CachyOS, Windows, macOS). Terminal komutları OS-Agnostic veya conditional çalışacak.
- **Tasarım Dili:** Minimal, net butonlar, gereksiz karmaşadan uzak, "Odak" (Focus) merkezli. Modern macOS/Linux dock/launcher hissiyatı.

## 2. Teknoloji Yığını (Tech Stack)
- **Frontend Core:** React, TypeScript, Vite. (İleride web'e taşınması kolay olsun diye Next.js yerine Vite-React tercih edilecek).
- **Backend Core:** Tauri (Rust). Sistem seviyesi işlemler (port tarama, dosya yazma, terminal komutları) kesinlikle Rust üzerinden yapılacak.
- **Styling:** Tailwind CSS. Karanlık/Aydınlık mod (System Sync) entegreli.
- **State Management:** Zustand (Karmaşık veri akışları ve Dashboard state'i için).
- **Icons:** Lucide-React.

## 3. Temel Özellikler (Uygulanacak Yol Haritası)

### Faz 1: Kimlik, Şablon ve Paket Seçimi
- **Proje Kimliği:** İsim, Slogan, Logo (URL/Upload) girişi -> Otomatik `README.md` jenerasyonu.
- **Şablon (Boilerplate) Galerisi:** Boş Next.js, "Auth Eklenmiş Next.js", "Tailwind+Supabase React Native", "Boş Vite" gibi hazır şablonlar. Eğer sistemde CLI araçları yoksa arka planda sessizce indirilir.
- **Paket Yöneticisi:** `npm`, `yarn`, `pnpm`, `bun` seçim anahtarı (Dropdown).

### Faz 2: Entegrasyonlar ve Çevre Değişkenleri
- **BaaS / Veritabanı:** Supabase veya Firebase için UI üzerinden API key girişi.
- **Görsel .env Üretici:** UI'dan girilen anahtarların şifrelenip projeye `.env.local` olarak yazılması.
- **Docker Entegrasyonu:** Toggle ile aktif edilir. Seçilirse projeye `docker-compose.yml` (PostgreSQL, Redis vb.) bırakılır ve `docker-compose up -d` arka planda çalıştırılır.
- **Port Çarpışma Önleyici:** Rust, sistemdeki portları (3000, 8080) tarar, doluysa projeyi 3001 gibi ilk boş porta atar ve `.env` dosyasına yazar.

### Faz 3: Vibe Coding Otomasyonu (Tarayıcı & AI)
- **UI/UX Aracı:** Figma, Spline, Stick seçenekleri (Seçilen araç Chrome'da otomatik açılır).
- **AI Asistanı:** Gemini, ChatGPT, Claude, LLaMA seçenekleri (Seçilen AI tarayıcıda açılır).
- **Prompt Pano Otomasyonu:** Seçilen AI ve framework baz alınarak (Örn: "Ben Next.js ile [Proje Adı] adında [Slogan] için uygulama yazıyorum...") hazır bir ilk prompt oluşturulur ve Clipboard'a (kopyalama panosu) otomatik kopyalanır.
- **Müzik Entegrasyonu:** "Başlat"a basıldığında Spotify'da "Lofi / Focus" playlist'i otomatik tetiklenir (İşletim sistemi URI şeması `spotify:playlist:...` kullanılarak).

### Faz 4: Deploy, Git ve Editör
- **Deploy Seçimi:** Vercel, Netlify, Render (Seçime göre hazır ayar dosyası eklenir).
- **Git Otomasyonu:** Otomatik `git init`, `.gitignore` oluşturma ve "Initial commit from VB" mesajıyla ilk commit. GitHub sekmesi açılışı.
- **Editör Açılışı:** İşlemler bitince klasör otomatik olarak `cursor .` veya `code .` komutuyla açılır.

### Faz 5: Zaman Kapsülü (Dashboard)
- Eski başlatılan projeler ana ekranda şık kartlar halinde listelenir.
- "Uyandır" (Wake) butonuna basıldığında o projenin Cursor'ı, Docker'ı ve ilgili tarayıcı sekmeleri tek tıkla tekrar açılır.

## 4. Geliştirme Kuralları (Cursor AI İçin Kesin Talimatlar)
- **Modülerlik:** UI bileşenlerini (`/components`), iş mantığını (`/hooks`) ve Rust entegrasyonlarını (`/services/tauri.ts`) kesinlikle ayır. İleride web'e geçersek Tauri kodları izole kalmalı.
- **Asenkron İşlemler:** Terminal (Shell) komutları arka planda çalışırken ana React Thread'ini asla bloklama. UI'da her zaman "Yükleniyor..." veya "Log" akışı göster.
- **Hata Yönetimi:** Rust'tan dönen hataları sessizce geçme, UI'da şık Toast mesajlarıyla göster.
- **Kod Yazımı:** Doğrudan çözüme odaklan. Uzun açıklamalar yapma, sadece kod ve gerekli dosya yollarını ver. Türkçe dilinde yanıtla.

## 5. Geliştirme İlerlemesi (Adım Adım)

### MVP — Arayüz & State
- [x] **Adım 0:** Dashboard iskeleti (Zaman Kapsülü + Yeni Proje formu), Tailwind, Lucide, Zustand store, dark mode.

### Faz 1 — Tauri Entegrasyonu (Masaüstü, Cross-Platform)
- [x] **Adım 1:** Tauri yapılandırması (VB branding, pencere boyutu, izinler).
- [x] **Adım 2:** Rust backend modülleri — proje oluşturma, README, Zaman Kapsülü kalıcılığı.
- [x] **Adım 3:** Cross-platform shell komutları (Linux/Windows/macOS).
- [x] **Adım 4:** Port çarpışma önleyici (ilk boş port bulma + `.env.local`).
- [x] **Adım 5:** `services/tauri.ts` — frontend ↔ Rust köprüsü (Tauri kodları izole).
- [x] **Adım 6:** Zustand store Tauri komutlarına bağlandı, mock veri kaldırıldı.
- [x] **Adım 7:** Uyandır (Wake) — editör + AI aracı tarayıcıda açma.
- [x] **Adım 8:** Toast hata bildirimleri + oluşturma log akışı UI.

### Sorun Giderme (Linux / Wayland)
- [x] **Wayland EPERM (71):** `GDK_BACKEND=x11` + `WEBKIT_DISABLE_DMABUF_RENDERER=1` otomatik fallback (`main.rs`). Native Wayland için `VB_USE_WAYLAND=1`.

### Faz 2 — Entegrasyonlar ve Çevre Değişkenleri
- [x] **Adım 9:** BaaS UI — Supabase / Firebase API key girişi (`IntegrationsSection`).
- [x] **Adım 10:** Görsel `.env.local` üretici — port, BaaS, Docker değişkenleri (`services/env.rs`).
- [x] **Adım 11:** API anahtarları AES-256-GCM ile şifreli vault (`~/.config/vb/secrets/`).
- [x] **Adım 12:** Docker toggle — `docker-compose.yml` + `docker compose up -d` (cross-platform).
- [x] **Adım 13:** Uyandır akışına Docker yeniden başlatma eklendi.
- [x] **Adım 14:** Port çarpışma önleyici genişletildi (app + PostgreSQL + Redis portları).

### Faz 3 — Vibe Coding Otomasyonu
- [x] **Adım 15:** UI/UX aracı seçimi — Figma, Spline, Stick (`VibeSection`).
- [x] **Adım 16:** AI asistanı tarayıcıda otomatik açılış (`services/browser.rs`).
- [x] **Adım 17:** Prompt pano otomasyonu — framework bazlı prompt + panoya kopyalama (`arboard`).
- [x] **Adım 18:** Spotify Lofi/Focus playlist — `spotify:` URI ile cross-platform tetikleme.
- [x] **Adım 19:** Uyandır akışına vibe otomasyonu (prompt + tarayıcı + Spotify) eklendi.
- [x] **Adım 20:** Prompt önizleme UI + `preview_prompt` Tauri komutu.

### Faz 4 — Deploy, Git ve Editör
- [x] **Adım 21:** Deploy seçimi UI — Vercel, Netlify, Render (`LaunchSection`).
- [x] **Adım 22:** Deploy yapılandırma dosyaları — `vercel.json`, `netlify.toml`, `render.yaml`.
- [x] **Adım 23:** Git otomasyonu — `git init`, `.gitignore`, "Initial commit from VB".
- [x] **Adım 24:** GitHub yeni repo sayfası tarayıcıda otomatik açılış.
- [x] **Adım 25:** Editör açılışı — Başlat sonrası `cursor .` / `code .` (`services/editor.rs`).

### Faz 5 — Zaman Kapsülü (Dashboard)
- [x] **Adım 26:** Gelişmiş proje kartları — gradient, port, stack etiketleri (`ProjectCard`).
- [x] **Adım 27:** WakePreview — uyandırma önizleme ikonları (editör, Docker, AI, UI/UX, Spotify, deploy).
- [x] **Adım 28:** Tam Uyandır orkestrasyonu — Docker + editör + vibe + deploy paneli + localhost.
- [x] **Adım 29:** Proje arama filtresi + kapsül sayacı.
- [x] **Adım 30:** Kapsülden proje silme (`remove_from_capsule`) + şifreli vault temizliği.
### Faz 6 — Framework Genişletmesi
- [x] **Adım 32:** 15 framework seçeneği — Web (Next.js, Vite×3, Remix, Astro, Nuxt, SvelteKit), Masaüstü (Tauri, Electron), Mobil (Expo×2, Supabase, Flutter).
- [x] **Adım 33:** Rust `framework.rs` — etiketler, deploy profilleri, normalize (`vite-blank` → `vite-react`).
- [x] **Adım 34:** Genişletilmiş scaffold — Nuxt, SvelteKit, Astro, Remix, Tauri, Electron, Expo, Flutter.
- [x] **Adım 35:** Deploy/prompt/readme — framework modülü ile hizalandı; mobil/native'de web deploy atlanır.
- [x] **Adım 36:** UI — platform bazlı framework grid, scroll, deploy filtresi.

### Faz 7 — Menü & Taslaklar
- [x] **Adım 37:** Sol üst menü — Ana Sayfa / Taslaklar geçişi.
- [x] **Adım 38:** Çoklu taslak depolama (`localStorage`, eski tek taslak migrasyonu).
- [x] **Adım 39:** Taslaklar sayfası — arama, kart grid, Devam Et / Sil.
- [x] **Adım 40:** UI/UX araçları genişletildi — 13 araç, kategori filtreleri, kart grid, tarayıcı URL’leri.
- [x] **Adım 41:** Logo — URL veya dosyadan yükleme, önizleme, `~/.config/vb/logos/` staging, projeye kopyalama.
- [x] **Adım 42:** AI sohbet araçları kaldırıldı — yerine 8 AI kod editörü (Cursor, VS Code, Windsurf, Zed, Void, Trae, PearAI, Antigravity).
- [x] **Adım 43:** Müzik — Spotify + YouTube Music seçimi; Başlat/Uyandır'da otomatik açılış.
- [x] **Adım 44:** BaaS genişletmesi — Neon, Upstash, AWS, Turso, Convex, MongoDB Atlas ve 17 sağlayıcı.
- [x] **Adım 45:** VB Dev Stack — Docker daemon hazırlığı, healthcheck, `compose up -d --wait`, UI yeniden adlandırma.