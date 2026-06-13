# VB (Veli-Başlatıcı) Çoklu Dil (i18n) Entegrasyon Planı

Bu belge, VB uygulamasına Türkçe (tr), İngilizce (en), Almanca (de) ve Yunanca (el) dil desteklerini `react-i18next` kullanarak entegre etmek için hazırlanmış eylem planıdır.

**Cursor (Composer/Agent) Kullanım Talimatı:**
Lütfen aşağıdaki adımları sırayla oku ve her adımı kusursuzca uygula. Kodları yazarken uygulamanın mevcut Zustand mimarisini ve Tailwind UI yapısını bozmamaya özen göster.

---

## 🌍 ADIM 1: Çeviri Dosyalarının (JSON) Oluşturulması
**Görev Promptu:**
> "Kök dizindeki `dil.md` dosyasını referans alarak Adım 1'i uyguluyoruz. 
> 1. `src/locales/` adında yeni bir klasör oluştur.
> 2. İçine 4 farklı JSON dosyası aç: `tr.json`, `en.json`, `de.json`, `el.json`.
> 3. Şu anki arayüzde bulunan anahtar kelimeler için temel bir sözlük yapısı kur. Örneğin: form başlıkları (Proje Adı, Slogan, Logo), butonlar ('Başlat', 'Taslak', 'Kur'), ayarlar ve profil menü metinleri.
> 4. `tr.json` içine mevcut Türkçe metinleri yerleştir, diğer 3 dil dosyasına bu anahtarların doğru İngilizce, Almanca ve Yunanca çevirilerini ekle."

---

## ⚙️ ADIM 2: i18n Konfigürasyonu ve Zustand Bağlantısı
**Görev Promptu:**
> "Kök dizindeki `dil.md` dosyasını referans alarak Adım 2'yi uyguluyoruz. 
> 1. `src/i18n.ts` adında bir yapılandırma dosyası oluştur. Bu dosyada `i18next` ve `react-i18next` modüllerini başlat (init). Varsayılan dili (fallbackLng) 'tr' olarak ayarla ve az önce oluşturduğun JSON çevirilerini buraya bağla.
> 2. `src/main.tsx` veya `src/App.tsx` dosyasının en üstünde bu `import './i18n'` dosyasını çağır.
> 3. `src/store/useProjectStore.ts` içindeki `settings` (veya `userProfile`) objesine `language: 'tr' | 'en' | 'de' | 'el'` state'i ekle.
> 4. Zustand store'da dil değiştiğinde arka planda `i18n.changeLanguage()` fonksiyonunu otomatik tetikleyecek mantığı kur."

---

## 🔤 ADIM 3: Arayüz (UI) Metinlerinin Dinamikleştirilmesi
**Görev Promptu:**
> "Kök dizindeki `dil.md` dosyasını referans alarak Adım 3'ü uyguluyoruz. 
> 1. Projedeki ana UI bileşenlerine (`NewProjectForm.tsx`, `SettingsPanel.tsx`, `SelectionCard.tsx` vb.) git.
> 2. Statik olarak yazılmış (hardcoded) tüm Türkçe metinleri `useTranslation` hook'u kullanarak dinamik hale getir (Örn: `<button>{t('buttons.start')}</button>`).
> 3. Uygulamanın Görünüm veya Ayarlar (`SettingsPanel.tsx`) sekmesine şık bir 'Dil Seçimi' (Language Switcher) dropdown'ı veya yan yana bayraklı butonlar ekle. Kullanıcı buradan dili seçtiğinde Zustand store'u güncelle."