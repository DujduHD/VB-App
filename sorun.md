# VB (Veli-Başlatıcı) İyileştirme ve Refactor Planı

Bu belge, projemizdeki kod şişkinliklerini azaltmak, bileşenleri modülerleştirmek ve Zustand store render performansını optimize etmek için hazırlanmış adım adım bir eylem planıdır. 

**Cursor (Composer/Agent) Kullanım Talimatı:**
Lütfen aşağıdaki adımları sırayla oku. Her adımdaki promptu ayrı bir Composer görevi olarak çalıştıracağım. Ben sana "Adım 1'i uygula" demeden kesinlikle kod yazmaya başlama.

---

## 🛠️ ADIM 1: Ortak SelectionCard Bileşenini Çıkarma
**Sorun:** Uygulamadaki tüm kart (Framework, Platform, BaaS, Vibe) seçim işlemleri aynı UI yapısını (ikon + başlık + açıklama + aktif glow efekti) tekrarlıyor.
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `sorun.md` dosyasını referans alarak Adım 1'i uyguluyoruz. Lütfen `src/components/ui/` altında `SelectionCard.tsx` adında jenerik (ortak) bir bileşen oluştur. Bu bileşen; icon, title, description, isSelected, onClick ve opsiyonel badge proplarını almalı. Ardından `NewProjectForm.tsx` (Platform ve Framework seçimi) ve `LaunchSection.tsx` içindeki tekrarlayan kart HTML/Tailwind yapılarını bu yeni `SelectionCard` bileşenini kullanacak şekilde refactor et. Mevcut dark mode glow ve border efektlerini kaybetmemeye çok dikkat et."

---

## 🛠️ ADIM 2: VibeSection.tsx Parçalanması
**Sorun:** `VibeSection.tsx` dosyası ~340 satır uzunluğunda ve AI Editörü, UI/UX Aracı, Müzik ve Prompt Önizleme gibi birbirinden tamamen bağımsız 4 farklı domain'i barındırıyor.
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `sorun.md` dosyasını referans alarak Adım 2'yi uyguluyoruz. Lütfen `src/components/vibe/` adında yeni bir klasör oluştur. Mevcut `VibeSection.tsx` dosyasının içindeki mantığı şu dört küçük bileşene böl: `CodeEditorPicker.tsx`, `UiUxToolPicker.tsx`, `MusicProviderPicker.tsx` ve `PromptPreviewButton.tsx`. Ana `VibeSection.tsx` dosyasını sadece bu dört alt bileşeni yan yana veya alt alta render eden ince bir kabuk (wrapper) haline getir. Zustand store bağlantılarını sadece ilgili alt bileşenlere taşı."

---

## 🛠️ ADIM 3: IntegrationsSection.tsx Parçalanması ve Toggle Optimizasyonu
**Sorun:** `IntegrationsSection.tsx` dosyası çok büyük (421 satır). Tüm BaaS credential (Supabase, Firebase) form alanları ve Toggle mantıkları aynı dosyada şişkinlik yaratıyor. Ayrıca sistemdeki Toggle Switch yapısı tekrar ediyor.
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `sorun.md` dosyasını referans alarak Adım 3'ü uyguluyoruz. Öncelikle `src/components/ui/` altında `ToggleSwitch.tsx` adında ortak bir bileşen yarat ve mevcut toggle'ları (Docker vb.) bununla değiştir. Daha sonra `IntegrationsSection.tsx` dosyasını üçe böl: 
> 1. `BaasProviderGrid.tsx` (Seçenekler listesi)
> 2. `BaasCredentialFields.tsx` (Form giriş alanları)
> 3. `DockerToggle.tsx`. 
> Ana `IntegrationsSection.tsx` dosyasını sadece bu üçünü render eden temiz bir kabuk yap."

---

## 🛠️ ADIM 4: Zustand Performans Optimizasyonu (Kritik)
**Sorun:** React bileşenleri (özellikle form elemanları) Zustand store'a `useProjectStore((s) => s.form)` şeklinde bağlandığı için, proje adına yazılan tek bir harf (onChange) tüm uygulamanın gereksiz yere yeniden render edilmesine (re-render) sebep oluyor.
**Görev Promptu (Cursor'a Verilecek):**
> "Kök dizindeki `sorun.md` dosyasını referans alarak Adım 4'ü uyguluyoruz. React render performansını güvence altına almamız gerekiyor. Projedeki tüm bileşenleri (özellikle `NewProjectForm.tsx`, `VibeSection.tsx` ve alt bileşenleri) incele. Tüm store'a abone olmak yerine (`s.form`), sadece ilgili alanlara abone olacak şekilde (dar selector'lar) güncellemeler yap. Örneğin sadece platforma ihtiyacı olan bileşen `(s) => s.form.platform` kullanmalı. Gerekli gördüğün ağır form listelerine (grid'lere) `React.memo` veya `useShallow` ekleyerek yazım esnasındaki gereksiz re-render'ları engelle."