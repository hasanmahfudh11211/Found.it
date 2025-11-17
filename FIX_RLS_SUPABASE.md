# 🔓 FIX RLS (Row Level Security) SUPABASE

## ❌ **ERROR:**
```
"message":"new row violates row-level security policy"
```

## ✅ **SOLUSI (1 MENIT):**

### **Step 1: Buka Supabase Dashboard**
👉 https://supabase.com/dashboard

- Pilih project: **foundshit-new** (atau project baru Anda)

---

### **Step 2: Buka Storage Settings**

1. Klik **"Storage"** di sidebar kiri
2. Klik bucket **"foundshit"**
3. Klik tab **"Policies"** di bagian atas

---

### **Step 3: Disable RLS atau Tambah Policy**

#### **OPSI A: DISABLE RLS (PALING MUDAH)** ⭐ **RECOMMENDED**

1. Di halaman Policies, cari toggle **"RLS enabled"**
2. **MATIKAN** toggle tersebut (OFF)
3. Klik **"Save"** atau konfirmasi

✅ **DONE!** Upload langsung works!

---

#### **OPSI B: Tambah Policy INSERT PUBLIC** (Kalau opsi A tidak ada)

1. Klik **"New Policy"**
2. Pilih **"For full customization"** atau **"Create a custom policy"**
3. **Isi form:**
   - **Policy name:** `Allow public insert`
   - **Allowed operation:** SELECT, INSERT (centang keduanya)
   - **Target roles:** `public` (atau `anon`)
   - **USING expression:** `true`
   - **WITH CHECK expression:** `true`
4. Klik **"Review"**
5. Klik **"Save policy"**

✅ **DONE!**

---

### **Step 4: Test Upload**

1. Kembali ke app
2. Tab **Lapor**
3. Pilih foto
4. Submit

**Expected log:**
```
✅ Upload berhasil!
🔗 Public URL: https://cywikprqfckebworrpcy.supabase.co/...
```

---

## 📸 **SCREENSHOT GUIDE:**

### **Cara 1: Matikan RLS (Paling Mudah)**

```
Storage → foundshit → Policies
├── RLS enabled: [OFF] ← MATIKAN INI
└── Save
```

### **Cara 2: Tambah Policy**

```
Storage → foundshit → Policies → New Policy
├── Template: Custom
├── Name: Allow public insert
├── Operations: INSERT, SELECT ✓
├── Target: public
├── USING: true
├── WITH CHECK: true
└── Save
```

---

## ⚠️ **CATATAN PENTING:**

### **Kenapa RLS Block?**
- Supabase punya **Row Level Security (RLS)** untuk protect data
- By default, RLS **BLOCK** semua public insert/upload
- Untuk development, kita **matikan RLS** atau **allow public insert**

### **Aman atau tidak?**
- ✅ **AMAN** untuk development/testing
- ⚠️ **Untuk production:** Sebaiknya buat policy yang lebih strict (authenticated users only)
- 🔄 **Nanti bisa diubah** setelah app jadi

### **Bucket harus Public?**
- ✅ **Ya**, bucket harus **public** (sudah di-set saat create bucket)
- ✅ **RLS juga harus dimatikan** atau **policy insert harus allow public**

---

## 🎯 **CHECKLIST FIX RLS:**

- [ ] Buka Supabase Dashboard
- [ ] Pilih project baru
- [ ] Storage → foundshit
- [ ] Tab Policies
- [ ] Matikan RLS atau tambah policy INSERT
- [ ] Save
- [ ] Test upload di app
- [ ] Verify success ✅

---

## 🚀 **QUICK LINK:**

👉 **Buka Dashboard:** https://supabase.com/dashboard

👉 **Pilih Project Baru:** `foundshit-new` (atau nama Anda)

👉 **Storage → foundshit → Policies**

---

## ❓ **MASIH ERROR?**

Kalau masih error, cek:
1. ✅ Bucket "foundshit" sudah dibuat?
2. ✅ Bucket di-set **PUBLIC**?
3. ✅ RLS sudah **DIMATIKAN**?
4. ✅ Config `app.json` sudah update?
5. ✅ App sudah di-restart (`npm start`)?

Screenshot error dan tanya saya! 💪


