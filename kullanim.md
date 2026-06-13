# VB (Veli-Başlatıcı) Kullanım Kılavuzu & Onboarding Sistemi Planı

Bu belge, VB uygulamasına Ayarlar menüsü altında çalışacak bir Markdown Dokümantasyon Sayfası, arayüz genelinde akıllı Tooltip'ler ve yeni kullanıcılar için interaktif bir Onboarding Turu entegre etmek amacıyla hazırlanmıştır.

**Cursor (Composer/Agent) Kullanım Talimatı:**
Lütfen aşağıdaki adımları sırayla takip et. Her adımdaki görev, arayüzün akıcılığını ve mevcut Zustand mimarisini koruyarak modüler bir şekilde yazılmalıdır. Ben sana "Adım 1'i uygula" demeden kesinlikle kod yazmaya başlama.

---

## 📖 ADIM 1: Arayüz Genelinde Bağlamsal İpuçları (Akıllı Tooltips)
**Sorun:** Kullanıcılar 'Zaman Kapsülü', 'Vibe Modu', '.env Kasası' veya 'RDAP Domain Kontrolü' gibi uygulamaya özel premium özelliklerin ne işe yaradığını ilk bakışta anlamayabilir.
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `kullanim.md` dosyasını referans alarak Adım 1'i uyguluyoruz. 
> 1. `src/components/ui/` altında `Tooltip.tsx` adında, üzerine mouse ile gelindiğinde (hover) açılan, gecikme (delay) ayarı olan şık bir Tailwind/Radix UI tabanlı ipucu bileşeni oluştur.
> 2. Şu kritik alanların başlıklarının hemen yanına küçük ve zarif bir bilgi (`i`) ikonu yerleştir ve bu Tooltip bileşeni ile sarmala:
>    - **Zaman Kapsülü:** 'Geçmişte oluşturduğun veya sisteme taşıdığın projelerin güvenli yerel hafızası.'
>    - **.env Kasası:** 'Sık kullandığın API anahtarlarını şifreli saklayan ve projelere otomatik enjekte eden merkez.'
>    - **RDAP Domain Kontrolü:** 'Domainin web üzerindeki sahiplik durumunu RDAP protokolü ile canlı sorgular.'
>    - **Vibe Modu:** 'Yapay zeka editörün, müzik sağlayıcın ve prompt otomasyonların için çalışma ortamı kiti.'"

---

## 🗺️ ADIM 2: İlk Açılış İçin İnteraktif Tur (Onboarding Tour)
**Sorun:** Uygulamayı ilk kez yükleyen bir geliştirici, iki kolonlu layout yapısında nereye tıklayacağını bilemeyebilir. Ekranı dondurmadan şık bir karşılama turu gerekiyor.
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `kullanim.md` dosyasını referans alarak Adım 2'yi uyguluyoruz.
> 1. Projeye hafif ve popüler bir tur kütüphanesi olan `driver.js` veya `react-joyride` kütüphanesini kur (veya Tailwind ile özel bir asenkron overlay mekanizması yaz).
> 2. Zustand store içerisine `settings.hasSeenTour: boolean` state'i ekle (localStorage'a kaydolmalı).
> 3. Eğer `hasSeenTour` false ise, uygulama ilk açıldığında tetiklenecek 4 adımlık interaktif bir tur başlat:
>    - **Adım 1:** `NewProjectForm` alanını hedefle -> 'Hızlı Başlatıcı: Proje detaylarını gir ve saniyeler içinde scaffold yap.'
>    - **Adım 2:** Sol Panel (`timeCapsule`) alanını hedefle -> 'Zaman Kapsülü: Eski projelerine eriş ve onları buradan yönet.'
>    - **Adım 3:** Sağ alt Log Paneli alanını hedefle -> 'Canlı Loglar: Arka planda Rust ve Docker tarafından yürütülen işlemleri izle.'
>    - **Adım 4:** Ayarlar Dişli Çark butonunu hedefle -> 'Komuta Merkezi: Profilini, dilini, Cloudflare API anahtarlarını ve görünümü özelleştir.'
> 4. Tur bittiğinde veya 'Atla' denildiğinde `hasSeenTour` true olarak güncellensin."

---

## 📑 ADIM 3: Ayarlar Menüsüne "Kullanım Kılavuzu" (Docs) Sekmesi Ekleme
**Sorun:** Uygulamanın kapsamlı bir dokümantasyona ihtiyacı var. Bu sekme Ayarlar menüsünde 'Hakkında' (About) sekmesinin hemen üstünde konumlanmalı.
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `kullanim.md` dosyasını referans alarak Adım 3'ü uyguluyoruz.
> 1. `SettingsPanel.tsx` içindeki sekmeler listesini incele. 'Hakkında' (About) sekmesinin hemen üzerine gelecek şekilde **'Kullanım Kılavuzu' (Documentation)** adında yeni bir sekme ekle.
> 2. Bu sekme seçildiğinde sağ tarafta açılacak iki bölümlü (Sol taraf içindekiler linkleri, sağ taraf dikey kaydırılabilir metin alanı) modern bir dökümantasyon layout'u tasarla.
> 3. Dokümantasyon içeriğini dinamik olarak render edebilmek için arayüze bir Markdown işlemci (Örn: `react-markdown`) kur veya metinleri şık Tailwind kurgularıyla (`prose` class'ları kullanarak) manuel formatla.
> 4. İçerik başlıkları şunları içermelidir:
>    - 🚀 Hızlı Başlangıç & Proje Dağıtımı
>    - 🛡️ Bağımlılık Kontrolörü & Güvenli Otomatik Kurulum
>    - 🔑 API Kasası ve Otomatik Cloudflare DNS Yapılandırması
>    - 📦 Dışarıdan Proje Taşıma ve AI (.cursorrules) Kuralları"