# 🆕 SETUP SUPABASE AKUN BARU

## ✅ **DATA TETAP AMAN!**

### **Penjelasan Penting:**

**Foto Lama:**
- 📸 Masih di akun Supabase lama
- 🔗 URL masih valid di Firestore
- ✅ Tetap bisa diakses/ditampilkan
- ❌ Tidak perlu migrasi!

**Foto Baru:**
- 📸 Akan ke akun Supabase baru
- 🔗 URL baru akan disimpan di Firestore
- ✅ Free 1GB lagi!

---

## 🚀 **LANGKAH SETUP SUPABASE BARU (5 MENIT):**

### **Step 1: Buat Project Supabase Baru**

1. **Buka:** https://supabase.com/dashboard

2. **Klik:** "New Project"

3. **Isi Form:**
   - **Name:** `foundshit-new` (atau nama lain)
   - **Database Password:** [Buat password kuat]
   - **Region:** Southeast Asia (Singapore) - terdekat
   - **Pricing Plan:** Free

4. **Klik:** "Create new project"

5. **Tunggu 2-3 menit** sampai project selesai dibuat

---

### **Step 2: Buat Storage Bucket**

1. Setelah project ready, klik **"Storage"** di sidebar

2. Klik **"Create a new bucket"**

3. **Isi:**
   - **Name:** `foundshit` (HARUS SAMA!)
   - **Public bucket:** ✅ **CENTANG INI!** (Penting!)
   - **File size limit:** 5MB (opsional)
   - **Allowed MIME types:** `image/*` (opsional)

4. Klik **"Create bucket"**

5. ✅ Bucket siap!

---

### **Step 2.5: DISABLE RLS (Row Level Security)** ⚠️ **SANGAT PENTING!**

**LANGSUNG SETELAH BUAT BUCKET:**

1. Masih di halaman Storage, klik bucket **"foundshit"** yang baru dibuat

2. Klik tab **"Policies"** di bagian atas (atau "Configuration")

3. **Cari toggle "RLS enabled"** atau "Enable RLS"

4. **MATIKAN** toggle tersebut (**OFF** / **DISABLE**)

5. Klik **"Save"** (jika ada tombol save)

**ATAU (jika tidak ada toggle RLS):**

Tambah policy baru:
- Klik **"New Policy"**
- Template: **"For full customization"** atau **"Custom policy"**
- Policy name: `Allow public insert`
- Allowed operations: **INSERT**, **SELECT** (centang keduanya)
- Target roles: `public` atau `anon`
- USING expression: `true`
- WITH CHECK expression: `true`
- Klik **"Review"** → **"Save policy"**

✅ **Ini mencegah error:** `"new row violates row-level security policy"`

---

### **Step 3: Get API Credentials**

1. Klik **"Settings"** (icon gear) di sidebar

2. Klik **"API"**

3. **Copy 3 info ini:**

   **A. Project URL:**
   ```
   https://[project-id].supabase.co
   ```
   Contoh: `https://abc123xyz.supabase.co`

   **B. Anon/Public Key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Copy yang panjang, mulai dari eyJ...)

   **C. Bucket Name:**
   ```
   foundshit
   ```
   (Nama bucket yang tadi dibuat)

---

### **Step 4: Update Config di App**

1. **Buka file:** `app.json`

2. **Cari bagian** `extra.supabase` (sekitar baris 53-57)

3. **Ganti dengan credentials baru:**

```json
"supabase": {
  "url": "https://[PROJECT-ID-BARU].supabase.co",
  "anonKey": "[ANON-KEY-BARU]",
  "bucket": "foundshit"
}
```

**CONTOH SEBELUM:**
```json
"supabase": {
  "url": "https://bcpwiwkchntbphonfikt.supabase.co",
  "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcHdpd2tjaG50YnBob25maWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDgzMTcsImV4cCI6MjA3MzYyNDMxN30.Pg8MgMeQjIoTHLc1u3w2G7HbansZ9YaeDWTIH8-oaJg",
  "bucket": "foundshit"
}
```

**SETELAH (dengan credentials baru):**
```json
"supabase": {
  "url": "https://xyz789abc.supabase.co",
  "anonKey": "eyJ[YOUR-NEW-KEY]",
  "bucket": "foundshit"
}
```

4. **Save file** `app.json`

---

### **Step 5: Restart App**

```bash
# Stop server (Ctrl+C)
npm start
```

---

### **Step 6: Test Upload**

1. Buka tab **Lapor**
2. Pilih foto
3. Isi form
4. Submit
5. **Cek console log:**
   ```
   🔗 URL: https://[PROJECT-ID-BARU].supabase.co
   ✅ Upload berhasil!
   ```

---

## 📊 **HASIL AKHIR:**

### **Database (Firestore):**
```
Laporan 1 (lama):
  title: "kdk"
  fotoUrl: "https://bcpwiwkchntbphonfikt.supabase.co/..." ← Akun lama
  status: "Aktif"

Laporan 2 (baru):
  title: "Laptop Hilang"
  fotoUrl: "https://xyz789abc.supabase.co/..." ← Akun baru
  status: "Aktif"
```

**KEDUA FOTO TETAP BISA DIAKSES!** ✅

---

## ❓ **FAQ:**

### **Q: Foto lama masih bisa ditampilkan?**
**A:** ✅ Ya! URL foto lama masih valid. App akan fetch dari akun Supabase lama via URL.

### **Q: Harus migrasi foto lama?**
**A:** ❌ Tidak perlu! Biarkan foto lama di akun lama. Hemat waktu!

### **Q: Kalau akun lama expired?**
**A:** 🔄 Foto lama tidak akan tampil. Tapi data laporan tetap ada di Firestore.

### **Q: Bisa pakai 2 Supabase sekaligus?**
**A:** ❌ App hanya bisa konek ke 1 Supabase. Tapi foto lama tetap accessible via URL direct.

### **Q: Bucket name harus sama?**
**A:** ✅ Ya! Atau update di `app.json` juga.

---

## ⚠️ **PENTING - BACKUP CONFIG LAMA:**

Sebelum ganti, **copy config lama** untuk jaga-jaga:

```json
// CONFIG LAMA - BACKUP INI:
"supabase": {
  "url": "https://bcpwiwkchntbphonfikt.supabase.co",
  "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcHdpd2tjaG50YnBob25maWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDgzMTcsImV4cCI6MjA3MzYyNDMxN30.Pg8MgMeQjIoTHLc1u3w2G7HbansZ9YaeDWTIH8-oaJg",
  "bucket": "foundshit"
}
```

Simpan di notepad untuk backup!

---

## ✅ **CHECKLIST:**

- [ ] Buat project Supabase baru
- [ ] Buat bucket "foundshit" + set PUBLIC
- [ ] **DISABLE RLS di bucket** ⚠️ **PENTING!**
- [ ] Copy Project URL
- [ ] Copy Anon Key
- [ ] Backup config lama di `app.json`
- [ ] Update config baru di `app.json`
- [ ] Save file
- [ ] Restart app (`npm start`)
- [ ] Test upload foto baru
- [ ] Verify foto baru muncul
- [ ] Verify foto lama masih tampil ✅

---

## 🎯 **SUMMARY:**

| Aspect | Status |
|--------|--------|
| Foto lama | ✅ Tetap accessible |
| Foto baru | ✅ Ke Supabase baru |
| Data Firestore | ✅ 100% aman |
| Free storage | ✅ +1GB lagi |
| Setup time | ⏱️ 5 menit |

---

## 🚀 **MULAI SEKARANG:**

1. Buka: https://supabase.com/dashboard
2. Klik "New Project"
3. Ikuti Step 1-6 di atas
4. Done! 🎉

---

**Good luck! Kalau ada masalah, screenshot dan tanya saya!** 💪

