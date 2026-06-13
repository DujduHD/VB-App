# VB (Veli-Başlatıcı) Projelerim Sekmesi (Kontrol Merkezi) Planı

Bu belge, VB uygulamasında dış projelerin ve geçmiş projelerin yönetileceği, sol menülü ve sağ içerikli "Projelerim" panelini sıfırdan inşa etmek için hazırlanmış eylem planıdır.

**Cursor (Composer/Agent) Kullanım Talimatı:**
Lütfen aşağıdaki adımları sırayla oku. Her adım, uygulamanın modüler yapısına, Zustand store mimarisine ve Tauri Rust arka planına tam uyumlu olmalıdır. Ben sana "Adım 1'i uygula" demeden kod yazmaya başlama.

---

## 🏗️ ADIM 1: Zustand Altyapısı ve İki Kolonlu Layout Tasarımı
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `projelerim.md` dosyasını referans alarak Adım 1'i uyguluyoruz. 
> 1. `src/store/useProjectStore.ts` içerisine şu state'leri ekle: `selectedProject` (Zaman kapsülü veya taslaklardan seçilen aktif proje objesi), `activeProjectMenu` ('api', 'cicd', 'env', 'vitrin', 'media'). Varsayılan değerlerini ayarla ve setter fonksiyonlarını yaz.
> 2. `src/components/projects/` adında bir klasör aç ve içine `ProjectsDashboard.tsx` bileşenini oluştur.
> 3. Bu bileşen ana ekranda ikiye bölünmüş bir grid/flex yapısında olmalı:
>    - **Sağ Taraf (Proje Seçimi):** İlk açılışta `timeCapsule` (Zaman Kapsülü) ve `drafts` (Taslaklar) listesini şık kartlar halinde göstersin. Kullanıcı bir projeye tıkladığında, o proje `selectedProject` olarak store'a kaydedilsin ve sağ taraf o projenin detaylarını, çalışma yolunu (path) ve o an aktif olan sol menü içeriğini gösterecek şekilde değişsin.
>    - **Sol Taraf (İşlem Menüsü):** Dikey bir Sidebar olsun. Sadece sağ taraftan bir `selectedProject` seçildiğinde aktif/tıklanabilir hale gelsin. Menü elemanları: 'API Ekle', 'CI/CD Pipeline', 'Merkezi .env Kasası', 'Vitrin', 'Medya/Asset Ekle'.
> 4. Tasarımda Tailwind dark mode standartlarına uy."

---

## 🖼️ ADIM 2: Medya/Asset Enjeksiyon Motoru (Dosya Taşıma ve Prompt)
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `projelerim.md` dosyasını referans alarak Adım 2'yi uyguluyoruz. 
> Sol menüden 'Medya/Asset Ekle' seçildiğinde sağ tarafta açılacak paneli yapıyoruz.
> 1. Sağ tarafa bir dosya yükleme alanı (Drag & Drop veya 'Dosya Seç' butonu) ekle. Logo, favicon, video, gif, png, svg türlerini kabul etsin.
> 2. Altına büyük bir 'Projeye Ekle' butonu yerleştir.
> 3. **Rust/Tauri Mantığı:** Butona tıklandığında Tauri `fs::copy` kullanarak seçilen dosyaları, `selectedProject.path` içindeki `public/` (veya framework'e göre `src/assets/`) klasörüne kopyalayacak `inject_media` adında bir Rust komutu (Tauri command) yaz.
> 4. **Prompt Çıktısı:** Kopyalama bittikten sonra Frontend'de şık bir Textarea veya bildirim kutusu içinde yapay zeka asistanına verilmek üzere bir prompt üret. Örnek çıktı formatı:
>    `'Aşağıdaki medya dosyaları projeye başarıyla eklendi. Lütfen kodlarda bu yolları kullan: Logo için: /public/logo.png, Video için: /public/intro.mp4'`
>    Bu metnin yanına bir 'Panoya Kopyala' butonu ekle."

---

## 🔑 ADIM 3: Merkezi .env Kasası ve API Ekleme
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `projelerim.md` dosyasını referans alarak Adım 3'ü uyguluyoruz.
> 1. **.env Kasası (Sol Menü):** Sağ tarafta şifreli bir kasa arayüzü tasarla. Kullanıcı buraya global API anahtarlarını (Örn: `OPENAI_API_KEY=sk-...`, `SUPABASE_URL=...`) kaydedebilsin. Bu veriler Zustand store'da (veya Tauri secure storage'da) `globalEnvVault` olarak tutulsun.
> 2. **API Ekle (Sol Menü):** Sağ tarafta 'Supabase, Stripe, OpenAI, Custom API' gibi seçenekler olsun. 
> 3. Kullanıcı bir API seçip 'Projeye Enjekte Et' dediğinde:
>    - Rust tarafında `inject_env` adında bir komut çalışsın.
>    - Bu komut, `globalEnvVault` içindeki ilgili anahtarı bulup, `selectedProject.path` içindeki `.env.local` dosyasının sonuna (dosya yoksa oluşturarak) otomatik yazsın.
>    - Ekranın altında 'API anahtarları başarıyla .env dosyasına taşındı' mesajı çıksın."

---

## 🚀 ADIM 4: CI/CD Pipeline ve Vitrin
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `projelerim.md` dosyasını referans alarak Adım 4'ü uyguluyoruz.
> 1. **CI/CD Pipeline (Sol Menü):** Sağ tarafta 'GitHub Actions Ekle' butonu olsun. Tıklandığında Rust arka planı `selectedProject.path` klasörü içinde `.github/workflows/main.yml` dosyasını oluştursun ve içine standart bir Node.js build/deploy YAML şablonu yazsın.
> 2. **Vitrin (Sol Menü):** Sağ tarafta projenin bir özetini gösteren şık bir görünüm oluştur. Proje adı, logoları, framework iconları olsun. Altında 'Sosyal Medyada Paylaşmak İçin Görsel Çıkar' butonu tasarla (Bu aşamada sadece arayüzünü ve placeholder'ını yap, görsel çıkarma mantığını sonraki aşamada bağlayacağız).
> Tüm işlemlerde başarılı/başarısız durumlar için Toast/Alert bildirimleri kullan."