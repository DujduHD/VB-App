# VB (Veli-Başlatıcı) Dış Proje İçe Aktarma (Import Project) Planı

Bu belge, VB uygulamasına dışarıdan bir proje klasörü seçilerek içeri aktarılmasını (import), projenin analiz edilmesini ve tanınmayan özelliklerin arayüzde kırmızıyla vurgulanmasını sağlayacak sistemin eylem planıdır.

**Cursor (Composer/Agent) Kullanım Talimatı:**
Lütfen aşağıdaki adımları sırayla oku. Her adımı kusursuzca uygula. Kodları yazarken mevcut `NewProjectForm` ve Zustand yapısını bozmamaya özen göster.

---

## 🕵️‍♂️ ADIM 1: Rust/Tauri Proje Analizcisi (Backend)
**Görev Promptu:**
> "Kök dizindeki `tasi.md` dosyasını referans alarak Adım 1'i uyguluyoruz. 
> 1. `src-tauri/src/main.rs` içine `analyze_project` adında yeni bir Tauri komutu yaz. Bu komut parametre olarak bir klasör yolu (`path: String`) alacak.
> 2. Rust `std::fs` kullanarak klasörde şu taramaları yapıp bir JSON dönecek:
>    - **packageManager:** `package-lock.json` (npm), `yarn.lock` (yarn), `pnpm-lock.yaml` (pnpm), `bun.lockb` (bun) kontrolü.
>    - **framework:** `package.json` içindeki `dependencies`'i okuyarak 'next', 'vite', 'react', 'nuxt' vb. eşleştirmesi yap.
>    - **deployTarget:** `vercel.json`, `netlify.toml`, `render.yaml` veya `wrangler.toml` var mı kontrol et.
>    - **git:** `.git` klasörü var mı?
>    - **docker:** `docker-compose.yml` var mı?
> 3. Bulduğu verileri ve 'Bilinmeyen/Eşleşmeyen' (Örn: package.json'da desteklenmeyen bir framework varsa) kısımları `unknownFields: string[]` (Örn: `['framework', 'deployTarget']`) dizisi olarak Frontend'e dönecek güvenli bir veri yapısı (Struct) oluştur."

---

## 🧠 ADIM 2: Zustand Store ve Dialog Entegrasyonu
**Görev Promptu:**
> "Kök dizindeki `tasi.md` dosyasını referans alarak Adım 2'yi uyguluyoruz. 
> 1. `src/store/useProjectStore.ts` içerisine `importWarnings: string[]` adında yeni bir state ekle.
> 2. Store içine `importExternalProject` adında asenkron bir aksiyon yaz.
> 3. Bu aksiyon, Tauri'nin `@tauri-apps/api/dialog` modülündeki `open()` metodunu kullanarak kullanıcıya bir klasör seçtirecek (`directory: true`).
> 4. Klasör seçilirse, Rust tarafındaki `analyze_project` komutuna bu yolu gönderecek.
> 5. Gelen yanıtla `form` state'ini (proje adı, framework vb.) otomatik dolduracak ve eğer tanınmayan/eşleşmeyen kısımlar varsa bunları `importWarnings` dizisine yazacak."

---

## 🛑 ADIM 3: Arayüz (UI) ve Kırmızı Uyarıların Gösterimi
**Görev Promptu:**
> "Kök dizindeki `tasi.md` dosyasını referans alarak Adım 3'ü uyguluyoruz. 
> 1. Dashboard'da (veya sol menüde) şık bir 'Projeyi Taşı' (Import Project) butonu oluştur ve `importExternalProject` aksiyonuna bağla.
> 2. `NewProjectForm.tsx` (ve alt bileşenlerindeki) alanları güncelle: Eğer bir alanın anahtarı (Örn: 'framework') Zustand'daki `importWarnings` dizisinde varsa, o bölümün etrafına kırmızı bir sınır çizgisi (border-red-500) ve altına 'Bu özellik projede algılanamadı veya VB tarafından desteklenmiyor' yazan küçük, şık bir kırmızı uyarı metni ekle.
> 3. Formun üst kısmına, eğer proje dışarıdan aktarıldıysa '📦 Dış Proje Modu: Ayarlar otomatik algılandı. Kırmızı alanları lütfen kontrol edin.' yazan bilgilendirici bir uyarı (Alert) barı yerleştir."