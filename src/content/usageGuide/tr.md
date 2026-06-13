# Hızlı Başlangıç & Proje Dağıtımı

VB (Veli-Başlatıcı), yeni bir projeyi birkaç adımda oluşturmanı sağlar.

## Yeni proje oluşturma

1. **Ana Sayfa**'da proje adı, slogan ve logoyu gir.
2. Platform (Web, Masaüstü, Mobil) ve framework seç.
3. Paket yöneticisini ve kod editörünü belirle.
4. **Başlat** ile scaffold, Git ve deploy yapılandırması otomatik çalışır.

## Zaman Kapsülü

Oluşturulan projeler sol paneldeki **Zaman Kapsülü**'ne kaydedilir. Buradan projeyi **Uyandır** (wake) ile tekrar açabilir, terminal ve editör otomasyonunu tetikleyebilirsin.

## Deploy hedefleri

Launch bölümünden Vercel, Netlify, Cloudflare Pages veya Docker hedeflerini seçebilirsin. Proje oluşturulduktan sonra ilgili yapılandırma dosyaları otomatik eklenir.

---

# Bağımlılık Kontrolörü & Güvenli Otomatik Kurulum

VB, projeyi başlatmadan önce sisteminde gerekli araçları kontrol eder.

## Otomatik tarama

Node.js, pnpm/npm, Git, Docker ve seçtiğin kod editörü gibi bağımlılıklar taranır. Eksik araç varsa **Bağımlılık Modal**'ı açılır.

## Güvenli kurulum

- Sistem paketleri için yalnızca sen onay verdiğinde kurulum başlar.
- Kod editörleri otomatik kurulmaz; proje oluşturulduktan sonra manuel açman gerekir.
- **Yine de Başlat** ile eksik editör olsa bile devam edebilirsin.

---

# API Kasası ve Otomatik Cloudflare DNS Yapılandırması

## Merkezi .env Kasası

**Projelerim → Merkezi .env Kasası** bölümünde API anahtarlarını AES-256 ile şifreli saklayabilirsin. Kasadaki anahtarlar **API Ekle** panelinden veya enjekte akışından projeye aktarılır.

## API enjeksiyonu

**Projelerim → API Ekle** menüsünden Supabase, Stripe, OpenAI veya özel anahtarları doğrudan yazıp **Projeye Enjekte Et** ile `.env.local` dosyasına ekleyebilirsin.

## Cloudflare DNS

**Ayarlar → Domain** bölümünde Cloudflare API token'ını kaydet. Proje oluşturma sırasında domain DNS kayıtları otomatik yapılandırılabilir.

---

# Dışarıdan Proje Taşıma ve AI (.cursorrules) Kuralları

## Dış proje taşıma

Ana sayfadaki **Projeyi Taşı** butonu ile mevcut bir klasörü seç. VB; framework, paket yöneticisi ve entegrasyonları analiz eder, formu otomatik doldurur.

## Import uyarıları

Algılanamayan veya desteklenmeyen özellikler kırmızı uyarı olarak gösterilir. Kontrol edip **Başlat** ile projeyi Zaman Kapsülü'ne ekleyebilirsin.

## AI kuralları

Proje oluşturulurken seçtiğin kod editörü ve profil ayarlarındaki **global kurallar**, `.cursorrules` veya editöre özel kural dosyalarına yazılır. Böylece AI asistanın proje bağlamını hemen tanır.

## Projelerim kontrol merkezi

Zaman Kapsülü veya taslaklardan bir proje seçerek medya enjekte etme, CI/CD workflow ekleme, vitrin görseli çıkarma ve API yönetimi gibi işlemleri tek yerden yapabilirsin.
