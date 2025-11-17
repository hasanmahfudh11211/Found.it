# 🚀 Deploy Firestore Rules - Quick Guide

## ⚡ CARA CEPAT (Copy-Paste)

### 1. Buka Firebase Console
```
https://console.firebase.google.com/project/foundshit-6ebc7/firestore/rules
```

### 2. Copy Rules Berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // USERS COLLECTION
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // REPORTS COLLECTION
    match /reports/{reportId} {
      // ALLOW READ: Semua orang (penting!)
      allow read: if true;
      
      // ALLOW CREATE: User yang login
      allow create: if request.auth != null
                    && request.resource.data.uidPelapor == request.auth.uid;
      
      // ALLOW UPDATE: Owner
      allow update: if request.auth != null 
                    && resource.data.uidPelapor == request.auth.uid;
      
      // DENY DELETE: Gunakan soft delete
      allow delete: if false;
    }
  }
}
```

### 3. Klik **Publish**

### 4. Tunggu 10-30 detik

### 5. ✅ DONE! Error permission-denied akan hilang!

---

## 🔧 Deploy via Firebase CLI (Advanced)

### Install Firebase CLI:
```bash
npm install -g firebase-tools
```

### Login:
```bash
firebase login
```

### Init Project:
```bash
firebase init firestore
```

### Deploy Rules:
```bash
firebase deploy --only firestore:rules
```

---

## ✅ Verifikasi Rules Sudah Aktif

1. Buka Firebase Console → Firestore → Rules
2. Cek timestamp "Last updated"
3. Pastikan ada `allow read: if true` untuk reports collection
4. Restart app dan test

---

## 🐛 Troubleshooting

### Error: "Permission denied"
- ✅ Cek rules sudah di-publish
- ✅ Wait 30 detik setelah publish
- ✅ Hard reload app (stop server → npm start)
- ✅ Clear app cache

### Rules tidak berubah:
- ✅ Refresh halaman Firebase Console
- ✅ Deploy ulang via CLI
- ✅ Cek project ID benar

---

## 📝 Notes

- Rules ini **production-ready**
- Allow read tanpa auth untuk public access
- Update & create dilindungi dengan auth check
- Delete disabled untuk safety (gunakan soft delete)

---

**Last updated:** 2025-10-23


