# Found.it - Aplikasi Hilang & Temu ITS NU Pekalongan

Aplikasi mobile berbasis **React Native + Expo + Firebase** untuk membantu civitas akademika ITS NU Pekalongan dalam melaporkan dan menemukan barang hilang/temuan di area kampus.

---

## Fitur Utama

- **Autentikasi Pengguna** (Email/Password via Firebase Auth)
- **Feed Realtime** laporan hilang/temuan (Firestore + `onSnapshot`)
- **Tambah Laporan** dengan foto (Expo ImagePicker + Supabase Storage)
- **Detail Laporan** dengan update status (Aktif → Selesai/temu)
- **Filter & Pencarian** laporan berdasarkan kategori
- **Error Handling** yang informatif

---

## Tech Stack

- **Frontend:** React Native (Expo) + TypeScript
- **Backend:** Firebase (Auth, Firestore)
- **Storage:** Supabase Storage (untuk foto)
- **Navigasi:** Expo Router (file-based routing)
- **State Management:** React Context API

---

## Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Firebase

Konfigurasi Firebase sudah ada di `app.json` bagian `extra.firebase`. Pastikan:

1. **Firebase Authentication** sudah diaktifkan:
   - Buka [Firebase Console](https://console.firebase.google.com/)
   - Pilih project **foundshit-6ebc7**
   - Buka **Authentication** → **Sign-in method**
   - Aktifkan **Email/Password**

2. **Firestore Database** sudah dibuat:
   - Buka **Firestore Database**
   - Buat database (pilih mode **production**)
   - **PENTING:** Buat composite index untuk query:
     - Collection: `reports`
     - Fields: `status` (Ascending), `tanggalPosting` (Descending)
     - Atau tunggu error pertama kali run app, Firebase akan memberikan link untuk auto-generate index

### 3. Konfigurasi Supabase (untuk upload foto)

Konfigurasi Supabase sudah ada di `app.json` bagian `extra.supabase`. Pastikan:

1. **Bucket Storage** sudah dibuat:
   - Buka [Supabase Dashboard](https://supabase.com/dashboard)
   - Pilih project **foundshit**
   - Buka **Storage** → Create bucket bernama `foundshit`
   - Set bucket menjadi **Public**

### 4. Firebase Security Rules

Tambahkan rules ini di Firestore:

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
        (resource.data.uidPelapor == request.auth.uid)
        ||
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
      allow delete: if false;
    }
  }
}
```

### 5. Jalankan Aplikasi

```bash
npx expo start
```

Pilih platform:
- **a** - Android emulator
- **i** - iOS simulator
- **w** - Web browser
- Scan QR code dengan Expo Go app

---

## Debugging & Troubleshooting

### Data tidak tampil di Home Screen?

1. **Buka console log** dengan menekan `j` di terminal Expo
2. Cek pesan error:
   - "Data berhasil dimuat: X laporan": Data berhasil dimuat
   - "Index belum dibuat!": Klik link di console untuk membuat index
   - "Error Firestore": Cek Firebase setup dan rules

### Login gagal?

1. Pastikan Firebase Auth sudah diaktifkan (Email/Password)
2. Cek console log untuk error code
3. Error umum:
   - `auth/operation-not-allowed` → Email/Password belum diaktifkan di Firebase
   - `auth/invalid-credential` → Email atau password salah
   - `auth/user-not-found` → User belum register

### Upload foto gagal?

1. Cek Supabase bucket sudah dibuat dan public
2. Cek konfigurasi di `app.json` bagian `extra.supabase`
3. Cek console log untuk error detail

---

## Struktur Project

```
app/
├── (auth)/
│   ├── login.tsx          # Halaman login
│   └── register.tsx       # Halaman register
├── (tabs)/
│   ├── home.tsx          # Feed laporan (realtime)
│   ├── lapor.tsx         # Form buat laporan
│   ├── profil.tsx        # Profil user
│   └── riwayat.tsx       # Riwayat laporan user
├── detail/
│   └── [id].tsx          # Detail laporan
└── _layout.tsx           # Root layout + AuthProvider

components/ui/            # Reusable UI components
lib/
├── firebase.ts          # Firebase config & init
├── supabase.ts          # Supabase upload helper
├── upload.ts            # Image compress & upload
└── toast.ts             # Toast notification helper
providers/
└── AuthProvider.tsx     # Auth context provider
```

---

## Struktur Data Firestore

### Collection: `reports`

```typescript
{
  id: string,
  title: string,
  description: string,
  location: string,
  fotoUrl?: string,
  kategori: "Hilang" | "temu",
  status: "Aktif" | "Selesai" | "temu",
  uidPelapor: string,
  reporterName: string,
  kontakPelapor: {
    email: string,
    other?: string
  },
  locationNote?: string,
  tanggalPosting: Timestamp
}
```

### Collection: `users`

```typescript
{
  displayName: string,
  email: string,
  role: "user" | "admin",
  avatarUrl?: string,
  createdAt: Timestamp
}
```

---

## Development

### Install new packages

```bash
npm install <package-name>
```

### Run tests

```bash
npm test
```

### Build for production

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

---

## TODO / Fitur Lanjutan

- [ ] Notifikasi Push (FCM) saat laporan baru
- [ ] Filter laporan berdasarkan tanggal
- [ ] Role admin untuk moderasi
- [ ] Export laporan ke PDF
- [ ] Dark mode support
- [ ] Offline mode dengan AsyncStorage

---

## Contributors

- Mahasiswa ITS NU Pekalongan
- Dosen Pembimbing

---

## License

MIT License © 2025 ITS NU Pekalongan

## Architecture

- Frontend: React Native (Expo) + TypeScript
- Backend: Firebase (Auth, Firestore)
- Storage: Supabase Storage untuk upload foto
- State Management: React Context API (AuthProvider)
- Navigation: Expo Router (file-based routing)

## Setup Firebase 

1. Buka Firebase Console dan buat Firestore Database dalam production mode
2. Atur Security Rules:

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
        (resource.data.uidPelapor == request.auth.uid)
        || (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
      allow delete: if false;
    }
  }
}
```

3. Buat Composite Index untuk collection `reports`:
- Field 1: `status` Ascending
- Field 2: `tanggalPosting` Descending
- Buat otomatis dari link di console atau lewat Firestore Indexes

4. Aktifkan Firebase Authentication Email/Password di Sign-in method

## Setup Supabase Storage & RLS

1. Buat bucket `foundshit` dan set Public
2. Kebijakan RLS:
- Opsi A (Rekomendasi dev): matikan RLS di Policies
- Opsi B: tambah policy custom untuk role `public/anon` dengan USING: true dan WITH CHECK: true untuk INSERT/SELECT
3. Test upload dari layar Lapor; pastikan URL publik di-log

## Troubleshooting 

- Index belum dibuat: buat composite index untuk `reports` (status asc, tanggalPosting desc); tunggu hingga Enabled
- Tidak ada data: login dan buat laporan baru dari tab Lapor; cek log "Data berhasil dimuat"
- Rules memblokir read: pastikan `allow read: if true;` pada `match /reports/{reportId}`; publish rules
- Config Firebase tidak valid: cek `app.json` bagian `extra.firebase` (apiKey, projectId, dll) lalu restart server
- Upload 401/403/404: pastikan bucket public dan nama bucket cocok dengan `app.json`; perbaiki RLS atau policy
- Crash/freeze: reload app, clear cache `npx expo start --clear`, reinstall dependencies jika perlu
- Debugging: tekan `j` di terminal untuk melihat log; gunakan pesan proses/berhasil/error di setiap screen

## Development & Build

- Install: `npm install`
- Start: `npx expo start`
- Test: `npm test`
- Build Android: `eas build --platform android`
- Build iOS: `eas build --platform ios`

## Changelog (Ringkas)

Version 1.0.0 — Initial Release
- Perbaikan komponen UI dan konsistensi wrapper layar
- Panduan setup Firebase (rules, index, auth) ditambahkan
- Panduan Supabase upload dan RLS
