## 🐳 ADIM 5: Otomatik DNS Kurulumu ve Kod Entegrasyonu (Cloudflare API & .env)
**Geliştirilecek Özellik:** Domain boşta çıkıp kullanıcı satın aldıktan sonra, seçilen deploy hedefine (Vercel, Netlify vb.) göre DNS (A ve CNAME) kayıtlarının Cloudflare API üzerinden otomatik açılması, `.env.local` ve `vercel.json` dosyalarının otomatik üretilmesi.

### 1. Frontend & Zustand Güncellemesi (`src/store/useProjectStore.ts`)
Store içerisine kullanıcının hassas API bilgilerini ve DNS kurulum durumunu yönetecek şu state'leri ekle:
- `settings.cloudflareToken`: string
- `dnsSetupStatus`: 'idle' | 'loading' | 'success' | 'error'
- `dnsLogs`: string[]

### 2. UI Entegrasyonu (`SettingsPanel.tsx` & `IdentitySection.tsx`)
- `SettingsPanel.tsx` içine "Cloudflare API Ayarları" başlığı altında şifrelenmiş bir password inputu ekle (`cloudflareToken` için).
- Domain kontrol alanında domain uygun/alınmış olduğunda görünecek şık bir "DNS Ayarlarını Otomatik Yap" (Magic DNS) butonu yerleştir. Bu buton sadece `cloudflareToken` doluysa ve deploy hedefi "Yok" (none) dışında bir şeyse aktif olsun.

### 3. Tauri/Rust Köprüsü (`src-tauri/src/main.rs`)
`src/services/tauri.ts` üzerinden çağrılacak `setup_project_dns` adında yeni bir Tauri komutu (command) tanımla. Bu komut şu parametreleri almalı:
- `domain`: string (Örn: focusflow.com)
- `token`: string (Cloudflare API Token)
- `deploy_target`: string (vercel, netlify, render vb.)
- `project_path`: string

### 4. Rust Arka Plan Mantığı (Komut Çalışma Akışı)
Rust tarafında `reqwest` veya Tauri'nin yerleşik HTTP istemcisini kullanarak şu asenkron zinciri işlet:

#### A) Hedef IP/CNAME Belirleme:
Seçilen deploy hedefine göre DNS kayıt modellerini eşleştir (Match Pattern):
- **Vercel ise:** - Tipi: `A`, İsim: `@`, Değer: `76.76.21.21` (Vercel Anycast IP)
  - Tipi: `CNAME`, İsim: `www`, Değer: `cname.vercel-dns.com`
- **Netlify ise:**
  - Tipi: `NETLIFY`, İsim: `@`, Değer: Netlify yük dengeleyici adresi.

#### B) Cloudflare API İstekleri:
1. İlk olarak domain adına göre `Zone ID` değerini çek: 
   `GET https://api.cloudflare.com/client/v4/zones?name=domain.com` (Header: `Authorization: Bearer <token>`)
2. Gelen Zone ID'yi kullanarak DNS kayıtlarını oluştur:
   `POST https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records`
   Payload: `{ "type": "A", "name": "@", "content": "76.76.21.21", "ttl": 1, "proxied": false }`

#### C) Yerel Dosya Otomasyonu (File Injection):
DNS işlemleri başarılı olursa, Rust `std::fs` modülünü kullanarak proje klasörünün içine girer:
1. `.env.local` dosyasını açar veya oluşturur, içine şunu yazar:
   `NEXT_PUBLIC_SITE_URL=https://domain.com`
2. Eğer hedef `vercel` ise, kök dizine bir `vercel.json` dosyası bırakır:
   ```json
   {
     "cleanUrls": true,
     "trailingSlash": false
   }