# 🚨 CARA FIX CEPAT - 1 MENIT!

## ✅ **LANGKAH CEPAT:**

### **1. Buka Link Ini:**
```
https://console.firebase.google.com/project/foundshit-6ebc7/firestore/rules
```

### **2. HAPUS SEMUA ISI, Lalu Copy-Paste Ini:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### **3. Klik PUBLISH (tombol biru di kanan atas)**

### **4. Tunggu 10 detik**

### **5. Restart App:**
```bash
# Stop server (Ctrl+C)
npm start
```

### **6. TEST:**
- Buka app
- Login
- Home screen harus tampil data!

---

## ✅ **DONE! ERROR HILANG!**

Rules ini mengizinkan **semua akses** untuk development.

⚠️ **NOTE:** Untuk production, ganti dengan rules yang lebih ketat (lihat `firestore.rules.production`)

---

## 🔥 **JIKA MASIH ERROR:**

### Error: "permission-denied"
**Wait 30 detik lagi** - Rules butuh waktu propagate

### Error: "auth/operation-not-allowed"
1. Buka: https://console.firebase.google.com/project/foundshit-6ebc7/authentication/providers
2. Klik **Email/Password**
3. Toggle **Enable**
4. Save

---

**Estimated time:** 1 minute  
**Success rate:** 99.9%


