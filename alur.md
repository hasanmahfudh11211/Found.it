# Found.it – Aplikasi Hilang & Temu ITS NU Pekalongan

Aplikasi mobile berbasis **React Native + Firebase** untuk membantu civitas akademika ITS NU Pekalongan dalam melaporkan dan menemukan barang hilang/temuan di area kampus.

---

## 🚀 Fitur Utama

* ✅ **Autentikasi Pengguna** (Email/Password via Firebase Auth)
* ✅ **Feed Realtime** laporan hilang/temuan (Firestore + `onSnapshot`)
* ✅ **Tambah Laporan** dengan foto (Expo ImagePicker + Supabase Storage)
* ✅ **Detail Laporan** dengan update status (Aktif → Selesai/temu)
* ✅ **Filter & Pencarian** laporan berdasarkan kategori
* ✅ **Error Handling** yang informatif dengan logging
* 🔄 **Notifikasi Realtime** (belum diimplementasi - opsional via FCM)
* 🔄 **Role Admin** untuk moderasi laporan (belum diimplementasi)

---

## 🏗️ Arsitektur

* **Frontend:** React Native (Expo) + TypeScript
* **Backend:** Firebase (Auth, Firestore)
* **Storage:** Supabase Storage (untuk upload foto)
* **State Management:** React Context API (AuthProvider)
* **Navigasi:** Expo Router (file-based routing)

---

## 📂 Struktur Firestore

```text
users/{uid}
  displayName: string
  email: string
  role: "user" | "admin"
  avatarUrl: string
  createdAt: timestamp

reports/{reportId}
  title: string
  description: string
  location: string
  locationNote?: string
  fotoUrl?: string
  uidPelapor: string
  reporterName: string
  status: "Aktif" | "Selesai" | "temu"
  kategori: "Hilang" | "temu"
  kontakPelapor: { email: string, other?: string }
  tanggalPosting: timestamp
```

---

## 🔒 Firestore Security Rules (contoh minimal)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.uidPelapor == request.auth.uid
                    && request.resource.data.status == 'Aktif';
      allow update: if request.auth != null && (
        // Pelapor boleh update miliknya
        (resource.data.uidPelapor == request.auth.uid)
        ||
        // Admin boleh update apa saja
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
      allow delete: if false; // hanya admin jika perlu
    }
  }
}
```

---

## 📱 Alur Teknis Aplikasi

### 1. Inisialisasi & Autentikasi

* **Entry Point:** `app/_layout.tsx` membungkus app dengan `<AuthProvider>`
* **Root Index:** `app/index.tsx` cek status auth dengan `useAuth()`
* Jika **user null** → redirect ke `/(auth)/login`
* Jika **user ada** → redirect ke `/(tabs)/home`
* **AuthProvider** (`providers/AuthProvider.tsx`) menggunakan `onAuthStateChanged` dari Firebase
* Login dengan `signInWithEmailAndPassword` → state otomatis update via context

### 2. Feed Laporan (Home)

* File: `app/(tabs)/home.tsx`
* Gunakan `onSnapshot` pada collection `reports` dengan:
  - Filter: `where("status", "==", "Aktif")`
  - Sort: `orderBy("tanggalPosting", "desc")`
  - **Butuh composite index di Firestore!**
* Jika index belum ada → fallback ke query tanpa filter
* Data otomatis ter-update realtime jika ada laporan baru/diubah
* Tampilkan dengan `FlatList` → render card dengan foto, judul, deskripsi
* Fitur tambahan:
  - Search bar untuk filter lokal
  - Filter kategori (Semua/Hilang/temu)
  - Statistik jumlah laporan
  - Error handling visual

### 3. Membuat Laporan Baru

* File: `app/(tabs)/lapor.tsx`
* Form input: judul, deskripsi, lokasi, kategori, kontak tambahan, foto
* Ambil foto via `expo-image-picker` (media library)
* Foto di-compress dengan `expo-image-manipulator` (max width 1280px, quality 0.7)
* Upload foto ke **Supabase Storage** (bucket: `foundshit`) → dapatkan public URL
* Simpan data laporan ke **Firestore** dengan `addDoc()`:
  - Field wajib: title, description, location, uidPelapor, reporterName, kategori, status, tanggalPosting
  - Field opsional: fotoUrl, kontakPelapor, locationNote
* Logging lengkap di setiap step untuk debugging
* Toast notification untuk feedback user

### 4. Detail & Update Laporan

* File: `app/detail/[id].tsx` (dynamic route)
* Navigasi dengan `router.push({ pathname: "/detail/[id]", params: { id: reportId } })`
* Ambil data realtime dengan `onSnapshot(doc(firestoreDb, "reports", id))`
* Tampilkan: foto full, judul, deskripsi, lokasi, status, kategori, pelapor
* Fitur:
  - **Bagikan** → Share laporan via native share
  - **Pesan Reporter** → Buka email/kontak reporter
  - **Tandai Selesai** (hanya untuk owner) → Update `status = 'Selesai'`
* Setelah ditandai selesai → laporan otomatis hilang dari feed Home (karena filter status)

### 5. Riwayat Laporan User

* File: `app/(tabs)/riwayat.tsx`
* Menampilkan semua laporan yang dibuat oleh user yang login
* Filter berdasarkan `uidPelapor == user.uid`
* Menampilkan status: Aktif, Selesai, atau temu

### 6. Profil User

* File: `app/(tabs)/profil.tsx`
* Menampilkan informasi user (email, display name)
* Tombol logout → `signOut(firebaseAuth)` → redirect ke login

### 7. Admin Panel (belum diimplementasi)

* Role `admin` bisa ubah status/hapus laporan
* Fitur moderasi untuk spam/konten tidak pantas
* Dashboard statistik lengkap

---

## 📋 Checklist MVP (Minimum Viable Product)

* ✅ Setup Firebase Project (Auth, Firestore)
* ✅ Setup Supabase Storage (untuk foto)
* ✅ Implementasi Auth (Login/Register dengan Firebase Auth)
* ✅ AuthProvider dengan Context API
* ✅ HomeScreen dengan feed realtime (`onSnapshot`)
* ✅ Filter & pencarian laporan
* ✅ ReportForm dengan upload foto ke Supabase
* ✅ Image compression sebelum upload
* ✅ DetailScreen + update status laporan
* ✅ Riwayat laporan user
* ✅ Profil user dengan logout
* ✅ Aturan security dasar Firestore
* ✅ UI components reusable (Card, Button, Input, Badge, dll)
* ✅ Error handling & logging untuk debugging
* ⚠️ Composite index Firestore (butuh setup manual di Firebase Console)
* 🔄 Notifikasi push (belum diimplementasi)
* 🔄 Role admin & moderasi (belum diimplementasi)

---

## 🌟 Rekomendasi Fitur Lanjutan

* ✅ Filter & pencarian laporan (sudah diimplementasi)
* ✅ Compress foto client-side (sudah diimplementasi dengan expo-image-manipulator)
* 🔄 Notifikasi Push (FCM) saat laporan baru muncul
* 🔄 Filter berdasarkan tanggal kejadian
* 🔄 Verifikasi email kampus (`@itsnupk.ac.id`)
* 🔄 Moderasi laporan spam (admin panel)
* 🔄 Edit laporan yang sudah dibuat
* 🔄 Upload multiple foto per laporan
* 🔄 Lokasi GPS otomatis (current location)
* 🔄 Chat/komentar di detail laporan
* 🔄 Rating & review untuk laporan yang diselesaikan
* 🔄 Export laporan ke PDF
* 🔄 Dark mode support
* 🔄 Backup rutin Firestore/Storage
* 🔄 Offline mode dengan cache

---

## 📦 Instalasi & Setup Dev

```bash
# Install dependencies
npm install

# Jalankan dengan Expo
npm start
```

### Konfigurasi:

**Firebase:** Konfigurasi ada di `app.json` bagian `extra.firebase`
- Project ID: `foundshit-6ebc7`
- Sudah include API keys dan credentials

**Supabase:** Konfigurasi ada di `app.json` bagian `extra.supabase`
- URL: `https://bcpwiwkchntbphonfikt.supabase.co`
- Bucket: `foundshit` (harus dibuat manual dan set public)

**Setup Firebase:**
1. Aktifkan Firebase Auth Email/Password
2. Buat Firestore composite index untuk query
3. Update Firestore security rules

Lihat file `SETUP_FIREBASE.md` untuk panduan lengkap.

---

## 👥 Kontributor

* Mahasiswa ITS NU Pekalongan
* Dosen Pembimbing
* Komunitas Kampus

---

## 📜 Lisensi

MIT License © 2025 ITS NU Pekalongan

