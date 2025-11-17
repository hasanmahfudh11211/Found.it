# 🔧 Troubleshooting Guide - Found.it

Panduan lengkap untuk mengatasi masalah umum yang sering terjadi pada aplikasi Found.it.

---

## 🚨 Data Tidak Tampil di Home Screen

### Kemungkinan Penyebab & Solusi:

#### 1. **Firestore Composite Index Belum Dibuat** ⚠️

**Gejala:**
- Console menampilkan: `⚠️ Index belum dibuat!`
- Muncul pesan kuning: "Index Firestore belum dibuat..."

**Penyebab:**
Query di home screen menggunakan kombinasi `where()` + `orderBy()` yang membutuhkan composite index.

**Solusi:**
1. Cek console log di terminal Expo (tekan `j` untuk membuka)
2. Cari link yang berisi `https://console.firebase.google.com/v1/r/project/foundshit-6ebc7/firestore/indexes?create_composite=...`
3. Klik link tersebut (akan membuka browser)
4. Firebase akan otomatis membuat index
5. Tunggu 2-5 menit sampai index selesai dibuat
6. Refresh aplikasi (shake device → Reload)

**Atau buat manual:**
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **foundshit-6ebc7**
3. Buka **Firestore Database** → **Indexes** tab
4. Klik **Create Index**
5. Set:
   - Collection ID: `reports`
   - Field 1: `status` (Ascending)
   - Field 2: `tanggalPosting` (Descending)
6. Klik **Create**

---

#### 2. **Belum Ada Data di Firestore**

**Gejala:**
- Console menampilkan: `✅ Data berhasil dimuat: 0 laporan`
- Home screen kosong dengan pesan "Belum ada laporan"

**Penyebab:**
Belum ada laporan yang dibuat atau user belum login.

**Solusi:**
1. Pastikan user sudah login
2. Buat laporan baru:
   - Buka tab **Lapor**
   - Isi form: judul, deskripsi, lokasi
   - Upload foto (opsional)
   - Klik **Simpan Laporan**
3. Kembali ke tab **Home**, data seharusnya muncul otomatis

---

#### 3. **Firebase Rules Memblokir Read Access**

**Gejala:**
- Console menampilkan: `❌ Error Firestore: permission-denied`

**Penyebab:**
Firestore security rules terlalu ketat atau salah konfigurasi.

**Solusi:**
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **foundshit-6ebc7**
3. Buka **Firestore Database** → **Rules** tab
4. Pastikan rules untuk collection `reports` memiliki `allow read: if true;`:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      allow read: if true;  // ← Pastikan ini ada
      allow create: if request.auth != null
                    && request.resource.data.uidPelapor == request.auth.uid
                    && request.resource.data.status == 'Aktif';
      allow update: if request.auth != null && (
        (resource.data.uidPelapor == request.auth.uid)
      );
    }
  }
}
```

5. Klik **Publish**

---

#### 4. **Firebase Belum Terkoneksi dengan Benar**

**Gejala:**
- Console menampilkan: `❌ Error Firestore: app/no-app` atau sejenisnya

**Penyebab:**
Firebase config tidak valid atau belum diinisialisasi.

**Solusi:**
1. Cek file `app.json` di bagian `extra.firebase`
2. Pastikan semua field terisi dengan benar:
   ```json
   "firebase": {
     "apiKey": "AIzaSy...",
     "authDomain": "foundshit-6ebc7.firebaseapp.com",
     "projectId": "foundshit-6ebc7",
     "storageBucket": "foundshit-6ebc7.appspot.com",
     "messagingSenderId": "...",
     "appId": "1:...",
     "measurementId": "G-..."
   }
   ```
3. Restart development server:
   ```bash
   # Stop dengan Ctrl+C
   npm start
   ```

---

## 🔐 Login Gagal

### Error: `auth/operation-not-allowed`

**Penyebab:**
Email/Password authentication belum diaktifkan di Firebase.

**Solusi:**
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **foundshit-6ebc7**
3. Buka **Authentication** → **Sign-in method**
4. Klik **Email/Password**
5. Toggle **Enable** → **Save**

### Error: `auth/invalid-credential`

**Penyebab:**
Email atau password salah.

**Solusi:**
- Cek ejaan email dan password
- Pastikan sudah register terlebih dahulu
- Coba reset password jika lupa

### Error: `auth/user-not-found`

**Penyebab:**
User belum terdaftar.

**Solusi:**
1. Klik link **Daftar** di halaman login
2. Register dengan email dan password baru
3. Coba login lagi

---

## 📷 Upload Foto Gagal

### Error: `Upload gagal: 401` atau `403`

**Penyebab:**
Supabase bucket belum dibuat atau belum public.

**Solusi:**
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project (URL: `bcpwiwkchntbphonfikt.supabase.co`)
3. Buka **Storage** di sidebar kiri
4. Cek apakah bucket **foundshit** sudah ada:
   - Jika belum: Klik **New bucket** → Nama: `foundshit` → **Create**
   - Jika sudah ada: Klik bucket → **Settings**
5. Set **Public bucket**: ON
6. Klik **Save**

### Error: `Upload gagal: 404`

**Penyebab:**
Nama bucket tidak sesuai dengan konfigurasi di `app.json`.

**Solusi:**
1. Cek `app.json` di bagian `extra.supabase.bucket`
2. Pastikan namanya sama dengan bucket di Supabase
3. Default: `foundshit`

---

## 📱 Aplikasi Crash / Freeze

### Force Reload

1. **Android emulator:**
   - Tekan `R` 2x di terminal Expo
   - Atau shake device → Reload

2. **iOS simulator:**
   - Tekan `Command + R` di simulator
   - Atau shake device → Reload

### Clear Cache

```bash
# Stop server
Ctrl + C

# Clear cache
npx expo start --clear
```

### Reinstall Dependencies

```bash
# Hapus node_modules
rm -rf node_modules

# Reinstall
npm install

# Start ulang
npm start
```

---

## 🔍 Cara Debug dengan Console Log

Aplikasi sudah dilengkapi dengan console logging yang informatif. Untuk melihat log:

### 1. Buka Console di Terminal Expo
```bash
# Tekan 'j' di terminal setelah npx expo start
j
```

### 2. Baca Log Messages

**Home Screen:**
- `🔄 HomeScreen: Memulai listener Firestore...` → Mulai fetch data
- `✅ Data berhasil dimuat: X laporan` → Berhasil load data
- `📦 Data laporan: [...]` → Isi data yang dimuat
- `⚠️ Index belum dibuat!` → Perlu buat index
- `❌ Error Firestore: ...` → Ada error

**Lapor Screen:**
- `⚠️ User belum login` → Perlu login dulu
- `⚠️ Form tidak lengkap` → Isi semua field required
- `📝 Memulai submit laporan...` → Proses submit
- `📷 Mengupload foto...` → Upload foto
- `✅ Foto berhasil diupload: ...` → URL foto
- `💾 Menyimpan laporan ke Firestore: ...` → Data yang disimpan
- `✅ Laporan berhasil dibuat dengan ID: ...` → Sukses
- `❌ Error menyimpan laporan: ...` → Ada error

---

## 🆘 Masih Bermasalah?

Jika masih mengalami masalah setelah mengikuti panduan di atas:

1. **Cek Console Log** - Log sangat informatif dan menunjukkan error detail
2. **Screenshot Error** - Ambil screenshot console log dan error message
3. **Cek Firebase Console** - Pastikan Firestore, Auth, dan Rules sudah benar
4. **Cek Supabase Dashboard** - Pastikan bucket sudah dibuat dan public
5. **Restart Everything** - Stop server, clear cache, reinstall, restart

### Checklist Lengkap:

- [ ] Firebase Auth Email/Password sudah diaktifkan
- [ ] Firestore database sudah dibuat
- [ ] Firestore composite index sudah dibuat
- [ ] Firestore security rules sudah benar
- [ ] Supabase bucket "foundshit" sudah dibuat
- [ ] Supabase bucket sudah di-set public
- [ ] Config di app.json sudah benar
- [ ] User sudah register dan login
- [ ] Console log tidak menampilkan error

---

## 📞 Kontak Support

Jika masih ada masalah, hubungi:
- Email: support@itsnupk.ac.id
- GitHub Issues: [github.com/itsnupek/foundit/issues](https://github.com/itsnupek/foundit/issues)

---

**Last updated:** 2025-10-23


