# VB (Veli-Başlatıcı) Profil ve Geliştirici Kimliği (Profile Engine) Planı

Bu belge, VB uygulamasının "Ayarlar > Profil" sekmesini inşa etmek ve geliştiricinin kişisel imzasını, GitHub otomasyonlarını, AI kurallarını ve terminal kimliğini projelere otomatik entegre etmek için hazırlanmış eylem planıdır.

**Cursor (Composer/Agent) Kullanım Talimatı:**
Lütfen aşağıdaki adımları sırayla oku ve ben sana "Adım 1'i uygula" demeden kod yazmaya başlama. Kodları yazarken modülerliği ve dark mode/Tailwind standartlarını koru.

---

## 🧠 ADIM 1: Zustand Store ve Profil Tiplerinin Tanımlanması
**Görev Promptu:**
> "Kök dizindeki `profil.md` dosyasını referans alarak Adım 1'i uyguluyoruz. 
> 1. `src/store/useProjectStore.ts` içerisine `userProfile` adında yeni bir obje state'i ekle.
> 2. Bu obje şu alt kategorileri içermeli:
>    - `identity`: avatarUrl, name (Örn: VeliDevo), website, role (Dropdown: Full-Stack, AI Destekli vb.)
>    - `branding`: defaultLicense ('MIT', 'Proprietary' vb.), copyrightText
>    - `workspace`: defaultPath (Örn: ~/Projects), terminalCommand (alacritty, fish), sshKeyPath (~/.ssh/id_rsa)
>    - `gitCloud`: githubUsername, githubPAT (şifreli input), gistSyncId
>    - `aiPreferences`: globalRules (Textarea - .cursorrules için), customPromptContext (Textarea - Pano için)
>    - `metrics`: totalSpawns (number), topFramework (string), totalFocusTime (number)
> 3. Bu state'leri güncelleyecek aksiyonları (`setProfileField`, `incrementSpawnCount` vb.) tanımla."

---

## 🖼️ ADIM 2: Profil Arayüzünün (UI) Kodlanması
**Görev Promptu:**
> "Kök dizindeki `profil.md` dosyasını referans alarak Adım 2'yi uyguluyoruz. 
> `SettingsPanel.tsx` (veya yeni bir `ProfileTab.tsx`) içerisine şık bir Profil sekmesi inşa et.
> 1. **En Üst (Header):** Seçilen Avatar, İsim ve Rol gösterimi. Yanında 'Geliştirici Metrikleri' (Toplam Spawn, Favori Framework) için şık istatistik kartları.
> 2. **Kimlik & Marka:** İsim/Şirket, Web Sitesi ve Varsayılan Lisans seçimi.
> 3. **Çalışma Alanı & Terminal:** Varsayılan proje dizini seçici, Terminal yolu ve SSH Anahtarı yolu girdileri.
> 4. **Git & Bulut:** GitHub Kullanıcı Adı, PAT (Personal Access Token) için şifreli alan ve 'Ayarları Gist ile Senkronize Et' butonu.
> 5. **Yapay Zeka (Vibe):** 'Evrensel AI Kuralları (.cursorrules)' ve 'Kişisel Prompt Yönergesi' için iki geniş Textarea.
> Tüm bu form elemanlarını Zustand store ile bağla. Tailwind ile modern, kategori kategori ayrılmış (Card'lar içinde) bir görünüm sağla."

---

## 🐙 ADIM 3: GitHub Gist Senkronizasyonu (Frontend Logic)
**Görev Promptu:**
> "Kök dizindeki `profil.md` dosyasını referans alarak Adım 3'ü uyguluyoruz. 
> Profil ekranındaki 'Gist ile Senkronize Et' butonu için bir işlev yaz. 
> 1. `src/services/githubSync.ts` adında bir dosya oluştur.
> 2. Eğer `githubPAT` doluysa, Zustand store'daki `userProfile` ve `settings` (şifreler hariç) verilerini JSON'a çevirip GitHub API kullanarak gizli (secret) bir Gist olarak kaydetsin (veya mevcut Gist'i güncellesin).
> 3. Başarı/Hata durumlarını UI'da Toast mesajlarıyla göster."

---

## ⚙️ ADIM 4: Rust/Tauri Arka Plan Entegrasyonları (Dosya ve Git Büyüsü)
**Görev Promptu:**
> "Kök dizindeki `profil.md` dosyasını referans alarak Adım 4'ü uyguluyoruz. (En kritik adım).
> `submitProject` (Frontend) ve `create_project` (Rust/Tauri) mantığını profil verilerini kullanacak şekilde güncelle:
> 1. **Dosya Enjeksiyonları (Rust):** Proje klasörü açıldığında, eğer `globalRules` doluysa kök dizine `.cursorrules` (ve `.windsurfrules`) dosyası oluşturup içine yazsın. `package.json` yazar kısmına `identity.name` değerini, `README.md` sonuna `branding.copyrightText` bilgisini ve klasöre `branding.defaultLicense` içeriğini eklesin.
> 2. **Git Otomasyonu (Rust):** Eğer `githubPAT` varsa, GitHub API'sine istek atıp repoyu otomatik oluştursun (`sshKeyPath` kullanarak `git remote add` ve `push` işlemlerini yapsun).
> 3. **Prompt Pano Büyüsü (Frontend):** Pano (Clipboard) kopyalaması yapılırken, asıl promptun sonuna `customPromptContext` alanındaki kişisel yönergeyi iliştirsin.
> 4. **Metrik Güncelleme:** Proje başarıyla başlatıldığında `totalSpawns` değerini 1 artırıp `topFramework` istatistiğini güncellesin."