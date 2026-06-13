# VB (Veli-Başlatıcı) Görünüm ve Tema Motoru (Appearance Engine) Planı

Bu belge, VB uygulamasının "Ayarlar > Görünüm" sekmesini inşa etmek ve uygulamaya Vurgu Rengi, Pencere Şeffaflığı, Sıkışıklık (Density), Log Fontu ve Animasyon kontrolü eklemek için hazırlanmış adım adım bir eylem planıdır.

**Cursor (Composer/Agent) Kullanım Talimatı:**
Lütfen aşağıdaki adımları sırayla oku. Ben sana "Adım 1'i uygula" demeden kod yazmaya başlama.

---

## 🎨 ADIM 1: Zustand Store ve CSS Değişkenleri (Theme Altyapısı)
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `görünüm.md` dosyasını referans alarak Adım 1'i uyguluyoruz. 
> 1. `src/store/useProjectStore.ts` (veya ilgili settings store) içine şu state'leri ekle: `accentColor` ('blue'|'green'|'purple'|'orange' vb.), `vibrancy` ('none'|'blur'|'transparent'), `density` ('comfortable'|'compact'), `terminalFont` ('system'|'fira'|'jetbrains'), `animationLevel` ('full'|'none'). Varsayılan değerlerini belirle.
> 2. `src/index.css` (veya global CSS) dosyasında seçilen vurgu rengini (`--color-primary`) değiştirecek data-theme niteliklerini (attribute) ayarla. Tailwind config dosyasını (`tailwind.config.js`) bu CSS değişkenlerini okuyacak şekilde güncelle.
> 3. Uygulamanın ana `App.tsx` kapsayıcısına (wrapper) Zustand'dan gelen bu state'leri class veya data-* niteliği olarak enjekte et (Örn: `data-density={density}` veya dinamik Tailwind gap/padding class'ları)."

---

## ⚙️ ADIM 2: Görünüm Ayarları UI (Settings Panel)
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `görünüm.md` dosyasını referans alarak Adım 2'yi uyguluyoruz. 
> Lütfen `SettingsPanel.tsx` (veya Görünüm sekmesi bileşeni) içerisine şu ayar kontrollerini ekle:
> 1. **Vurgu Rengi:** Yan yana duran yuvarlak renk paleti butonları (Seçileni belirgin yap).
> 2. **Pencere Arka Planı:** Şeffaflık Kapalı, Hafif Bulanık, Tam Şeffaf seçenekleri (Dropdown veya Radio Cards).
> 3. **Arayüz Sıkışıklığı:** Rahat (Büyük boşluklar) ve Sıkı (Minimal boşluklar).
> 4. **Terminal Log Fontu:** Sistem Varsayılanı, Fira Code, JetBrains Mono.
> 5. **Animasyonlar:** Açık / Kapalı anahtarı (Toggle).
> Tüm bu girdileri Zustand store'daki ilgili state'ler ile çift yönlü (two-way binding) bağla."

---

## 🪄 ADIM 3: Dinamik Sıkışıklık, Font ve Animasyon Entegrasyonu
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `görünüm.md` dosyasını referans alarak Adım 3'ü uyguluyoruz. 
> 1. Form bileşenlerindeki (`NewProjectForm`, `SelectionCard` vb.) sabit padding/gap değerlerini, store'dan gelen `density` değerine göre dinamik hale getir (Örn: `density === 'compact' ? 'p-2 gap-2' : 'p-4 gap-4'`).
> 2. `LogPanel` bileşenindeki log metinlerinin fontunu `terminalFont` state'ine göre değiştir (Gerekirse Google Fonts'tan dinamik import et veya CSS font-family ayarla).
> 3. Uygulamadaki `transition-all`, `animate-*` gibi Tailwind class'larını `animationLevel === 'none'` durumunda ezecek global bir CSS kuralı veya koşullu class yaz."

---

## 🪟 ADIM 4: Tauri Window Vibrancy (Şeffaflık Arka Planı - Rust)
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `görünüm.md` dosyasını referans alarak Adım 4'ü uyguluyoruz. (Dikkat: Bu adım Tauri Rust entegrasyonu gerektirir).
> 1. `src-tauri/tauri.conf.json` dosyasında `windows` altındaki `transparent` değerini `true` yap.
> 2. Terminalde `cargo add window-vibrancy` komutunu çalıştırarak (veya doğrudan `Cargo.toml` dosyasına ekleyerek) eklentiyi kur.
> 3. `main.rs` dosyasında `window-vibrancy` modülünü kullanarak, frontend'den gelen `vibrancy` state'ine göre pencere efektini uygulayacak bir Tauri komutu (`set_window_vibrancy`) yaz (Linux/macOS/Windows desteklerine dikkat ederek, özellikle Linux için GTK şeffaflığını etkinleştir).
> 4. React tarafında `vibrancy` state'i değiştiğinde bu Tauri komutunu çağıracak bir `useEffect` kancası ekle. (Eğer vibrancy 'blur' veya 'transparent' seçildiyse, React'taki ana `body` ve arka plan `bg-` class'larının `bg-transparent` veya saydam bir rgba değerine geçmesini sağla)."