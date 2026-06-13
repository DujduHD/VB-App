## 🚦 ADIM 6: Bağımlılık Kontrolü, Akıllı Kurulum ve UI Yükleme Durumu (Pre-flight Check)
**Sorun:** 'Başlat' butonuna basıldığında ağır işlemler sistemi donduruyor ve seçilen araçlar (pnpm, docker, git vb.) sistemde yüklü değilse proje eksik kalıyor.
**Çözüm:** İşleme başlamadan önce sistemde eksik olan araçları tespit eden, bunları şık bir Modal ile kullanıcıya sunup otomatik kuran ve bu esnada UI'ı dondurmadan Loading (Yükleniyor) animasyonu gösteren asenkron bir mekanizma.

### 1. Zustand Store Güncellemesi (`src/store/useProjectStore.ts`)
- Store'a şu state'leri ekle:
  - `missingDependencies: string[]` (Örn: `['docker', 'pnpm']`)
  - `isCheckingDeps: boolean`
  - `isInstallingDeps: boolean`

### 2. Rust Bağımlılık Kontrolcüsü (`src-tauri/src/main.rs`)
- `check_dependencies` adında bir Tauri komutu yaz.
  - Bu komut, formdan gelen verilere bakarak gereken araçların sistem (`$PATH`) üzerinde olup olmadığını kontrol etmeli (Linux için `which` komutunu `std::process::Command` ile çalıştırarak yapabilirsin).
  - Eksik olanların isimlerini bir Dizi (Array) olarak Frontend'e dönsün.

### 3. Akıllı Kurulum Komutu (Rust)
- `install_dependencies` adında bir komut yaz.
  - CachyOS/Arch sistemine uygun olarak, eğer sistem paketi eksikse (örn: docker, git) yetki isteyerek kurmalı (Örn: `pkexec pacman -S --noconfirm docker`).
  - Eğer Node paketi eksikse (örn: pnpm, yarn) `npm install -g <paket>` komutunu çalıştırmalı.

### 4. UI: Yükleniyor ve Eksik Paket Modalı
- `NewProjectForm` içindeki (veya altındaki) 'Başlat' butonunu güncelle: `isCheckingDeps` veya `isSubmitting` true olduğunda buton inaktif (disabled) olsun ve içinde şık bir Spinner (Yükleniyor ikonu) dönsün. Metin "Sistem Taranıyor..." veya "Kuruluyor..." olarak değişsin.
- `src/components/ui/DependencyModal.tsx` adında bir Modal oluştur. `missingDependencies` array'i doluysa bu modal açılsın.
  - İçerik: "Projeyi başlatmak için şu araçlar eksik: [Liste]. Bunları senin için kurmamı ister misin?"
  - Butonlar: "Vazgeç" ve "Otomatik Kur ve Başlat".

### 5. İşlem Akışı (Submit Logic)
`submitProject` aksiyonunu şu şekilde güncelle:
1. `isCheckingDeps = true` yap.
2. Rust `check_dependencies` çağır.
3. Eksik varsa Modalı aç ve süreci beklet.
4. Eksik yoksa (veya Modal'dan 'Kur' dendiğinde kurulum başarılı olursa) asıl `create_project` sürecine (Loading spinner eşliğinde) geç.

### 6. Görev Promptu (Cursor Composer için):
> "Kök dizindeki `sorun.md` dosyasını referans alarak ADIM 6'yı uyguluyoruz. Sistemi dondurmamak ve eksik araçları yakalamak için Pre-flight mekanizmasını kuracağız.
> 1. Zustand store'a missingDependencies ve loading state'lerini ekle. Başlat butonunu bu state'lere göre Spinner gösterecek şekilde (disabled olarak) refactor et.
> 2. `DependencyModal.tsx` bileşenini tasarla (Tailwind, dark mode uyumlu).
> 3. Rust tarafında Linux ortamını baz alarak (CachyOS/Arch uyumlu) `which` komutuyla çalışan `check_dependencies` ve `pkexec`/`npm` kullanarak çalışan `install_dependencies` fonksiyonlarını yaz.
> 4. Zustand'daki submit işlem sırasını (Önce Kontrol -> Gerekirse Modal -> Kurulum -> Asıl Başlatma) asenkron olarak kurgula."