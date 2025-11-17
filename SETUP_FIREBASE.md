# 🔥 Setup Firebase - WAJIB DILAKUKAN!

**PENTING:** Error `permission-denied` terjadi karena Firestore belum di-setup dengan benar!

---

## 🚨 **ERROR YANG TERJADI:**

```
❌ Error Firestore: Missing or insufficient permissions.
❌ Error lain: permission-denied Missing or insufficient permissions.
```

**Penyebab:** Firestore security rules memblokir akses read/write.

---

## ✅ **SOLUSI: Setup Firestore Rules (5 Menit)**

### **Step 1: Buka Firebase Console**

Klik link ini (atau copy-paste ke browser):
```
https://console.firebase.google.com/project/foundshit-6ebc7/firestore
```

### **Step 2: Pastikan Firestore Database Sudah Dibuat**

1. Jika belum ada database, klik **Create Database**
2. Pilih **production mode**
3. Pilih lokasi server (contoh: `asia-southeast1` atau `us-central1`)
4. Klik **Enable**

### **Step 3: Setup Security Rules**

1. Di halaman Firestore, klik tab **Rules** (di atas)
2. **HAPUS** semua isi rules yang ada
3. **COPY-PASTE** rules berikut ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Collection: users
    match /users/{userId} {
      // Semua user yang login bisa read
      allow read: if request.auth != null;
      // User hanya bisa write data miliknya sendiri
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Collection: reports (PENTING!)
    match /reports/{reportId} {
      // SEMUA ORANG bisa read reports (bahkan tanpa login)
      allow read: if true;
      
      // Hanya user yang login bisa create report
      allow create: if request.auth != null
                    && request.resource.data.uidPelapor == request.auth.uid
                    && request.resource.data.status == 'Aktif';
      
      // Update hanya bisa dilakukan oleh:
      // 1. Pelapor asli (owner)
      // 2. Admin (jika ada role admin)
      allow update: if request.auth != null && (
        // Owner bisa update
        (resource.data.uidPelapor == request.auth.uid)
        ||
        // Admin bisa update (opsional, belum diimplementasi)
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
      
      // Delete disabled (gunakan update status ke 'Selesai' saja)
      allow delete: if false;
    }
  }
}
```

4. Klik **Publish** (tombol biru di atas)
5. Tunggu sampai muncul notifikasi "Rules successfully published"

---

## 📊 **Step 4: Buat Composite Index (PENTING!)**

Query di aplikasi menggunakan filter + sort yang butuh index khusus.

### **Cara 1: Otomatis (Paling Mudah) ⭐**

1. Jalankan aplikasi sekali lagi
2. Buka tab Home (akan error dulu)
3. Cek console log di terminal
4. Cari link yang dimulai dengan:
   ```
   https://console.firebase.google.com/v1/r/project/foundshit-6ebc7/firestore/indexes?create_composite=...
   ```
5. **COPY link tersebut** dan buka di browser
6. Firebase akan otomatis buat index yang diperlukan
7. Klik **Create Index**
8. Tunggu 2-5 menit sampai status berubah jadi **Enabled** (hijau)

### **Cara 2: Manual**

1. Buka [Firestore Indexes](https://console.firebase.google.com/project/foundshit-6ebc7/firestore/indexes)
2. Klik tab **Composite** (di atas)
3. Klik **Create Index**
4. Isi form:
   - **Collection ID:** `reports`
   - Klik **Add field**
   - **Field 1:** 
     - Field path: `status`
     - Mode: **Ascending**
   - Klik **Add field** lagi
   - **Field 2:**
     - Field path: `tanggalPosting`
     - Mode: **Descending**
   - **Query scope:** Collection
5. Klik **Create Index**
6. Tunggu 2-5 menit sampai status **Enabled**

---

## 🔐 **Step 5: Aktifkan Firebase Authentication**

1. Buka [Firebase Authentication](https://console.firebase.google.com/project/foundshit-6ebc7/authentication/providers)
2. Klik **Get Started** (jika belum aktif)
3. Klik **Email/Password** di list provider
4. Toggle **Enable** menjadi ON
5. Klik **Save**

---

## ✅ **Verifikasi Setup**

Setelah semua step di atas selesai, cek:

### **1. Firestore Rules**
```
✅ Rules sudah di-publish
✅ Collection 'reports' allow read: if true;
```

### **2. Firestore Index**
```
✅ Index untuk collection 'reports' sudah dibuat
✅ Status index: Enabled (hijau)
✅ Fields: status (Ascending) + tanggalPosting (Descending)
```

### **3. Firebase Auth**
```
✅ Email/Password provider sudah enabled
```

---

## 🎯 **Test Aplikasi**

1. **Stop server** di terminal (Ctrl+C)
2. **Restart server:**
   ```bash
   npm start
   ```
3. **Reload aplikasi** (tekan `r` di terminal atau shake device)
4. **Cek console log** (tekan `j` di terminal):
   - Harus muncul: `✅ Data berhasil dimuat: X laporan`
   - TIDAK boleh ada: `❌ Error Firestore: permission-denied`

5. **Test flow lengkap:**
   - [ ] Register user baru
   - [ ] Login
   - [ ] Buat laporan di tab Lapor
   - [ ] Kembali ke Home → data muncul
   - [ ] Klik detail laporan → bisa buka
   - [ ] Tandai selesai → status berubah

---

## 🐛 **Jika Masih Error:**

### Error: `permission-denied` masih muncul

**Kemungkinan penyebab:**
- Rules belum di-publish dengan benar
- Firestore database belum dibuat
- Ada typo di rules

**Solusi:**
1. Buka Firebase Console
2. Cek tab Rules
3. Pastikan ada `allow read: if true;` untuk reports
4. Klik Publish lagi
5. Tunggu 30 detik, reload app

### Error: `failed-precondition` atau `index`

**Kemungkinan penyebab:**
- Index belum dibuat
- Index masih building (belum selesai)

**Solusi:**
1. Buka [Firestore Indexes](https://console.firebase.google.com/project/foundshit-6ebc7/firestore/indexes)
2. Cek status index untuk collection `reports`
3. Jika status "Building" → tunggu 2-5 menit
4. Jika tidak ada index → ikuti Step 4 di atas
5. Reload app setelah index status "Enabled"

---

## 📞 **Butuh Bantuan?**

Jika masih mengalami masalah:

1. Screenshot error di console log
2. Screenshot Firebase Console (Rules & Indexes)
3. Hubungi tim support

---

## 📋 **Checklist Setup (Print This!)**

```
Setup Firebase - Foundshit App

□ Step 1: Firestore Database sudah dibuat
□ Step 2: Firestore Rules sudah di-publish
          - allow read: if true; untuk reports ✓
□ Step 3: Composite Index sudah dibuat
          - Collection: reports
          - Fields: status + tanggalPosting
          - Status: Enabled (hijau)
□ Step 4: Firebase Auth Email/Password enabled
□ Step 5: Test app → data tampil tanpa error

Jika semua checklist ✓ → APP SIAP DIGUNAKAN! 🎉
```

---

**Last updated:** 2025-10-23


