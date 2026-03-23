# 📱 DEPLOYMENT GUIDE - Smart Room Project

Panduan lengkap untuk deploy project ke Render (Backend) dan Vercel (Frontend).

---

## 🚀 STEP 1: Setup GitHub Repository

### Langkah 1.1: Inisialisasi Git di Local
```bash
# Di root folder project
git init
git config user.name "Your Name"
git config user.email "your.email@gmail.com"

# Tambah semua file
git add .

# Commit pertama
git commit -m "Initial commit - Smart Room project"
```

### Langkah 1.2: Buat GitHub Repository
1. Buka https://github.com/new
2. Nama repo: `smartroom` (atau nama pilihan Anda)
3. Jangan initialize dengan README/gitignore/license (kita punya file ini)
4. Klik "Create repository"

### Langkah 1.3: Push ke GitHub
```bash
# Copy-paste commands dari GitHub (sesuaikan dengan URL repo Anda)
git remote add origin https://github.com/YOUR_USERNAME/smartroom.git
git branch -M main
git push -u origin main
```

Verifikasi: Refresh halaman GitHub repo Anda, semua file harus ter-upload.

---

## 🔧 STEP 2: Deploy Backend ke Render

### Langkah 2.1: Buat Akun Render
1. Buka https://render.com
2. Sign up dengan GitHub account (recommended)
3. Authorize Render untuk akses repository

### Langkah 2.2: Buat Web Service Baru
1. Di dashboard Render, klik "+ New +" → "Web Service"
2. Pilih repository `smartroom`
3. Klik "Connect"

### Langkah 2.3: Konfigurasi Service
**Name:** `smartroom-backend`

**Environment:** `Python 3`

**Build Command:**
```
pip install -r backend/requirements.txt
```

**Start Command:**
```
cd backend && gunicorn smartroom_backend.wsgi:application --bind 0.0.0.0:$PORT
```

**Plan:** Pilih "Free" (atau Starter tergantung budget)

### Langkah 2.4: Environment Variables
Klik "Advanced" → "Add Environment Variable"

| Key | Value |
|-----|-------|
| `DEBUG` | `False` |
| `SECRET_KEY` | Isi dengan string random panjang (minimal 50 karakter) |

**Contoh SECRET_KEY:**
```
django-insecure-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z
```

### Langkah 2.5: Deploy
Klik "Create Web Service" dan tunggu hingga selesai (biasanya 5-10 menit)

**Catat URL Backend:** Akan berupa `https://smartroom-backend.onrender.com`

### ✅ Test Backend
```bash
curl https://smartroom-backend.onrender.com/api/score
```

Harusnya return JSON dengan `{"high_score": 12345}`

---

## 🌐 STEP 3: Update Backend URL di Frontend

### Langkah 3.1: Update Environment Variable Vercel
Setelah tahu URL Render backend, update file `.env.production`:

**File:** `backend/frontend/.env.production`
```
NEXT_PUBLIC_API_URL=https://smartroom-backend.onrender.com
```

### Langkah 3.2: Update CORS di Django
**File:** `backend/smartroom_backend/settings.py`

Di bagian `CORS_ALLOWED_ORIGINS` dan `CSRF_TRUSTED_ORIGINS`, tambahkan:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://smartroom.vercel.app",  # Ganti dengan nama Vercel Anda
    "https://smartroom-backend.onrender.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://smartroom.vercel.app",
    "https://smartroom-backend.onrender.com",
]
```

### Langkah 3.3: Push Perubahan ke GitHub
```bash
git add .
git commit -m "Update API URLs for production deployment"
git push
```

---

## 🎯 STEP 4: Deploy Frontend ke Vercel

### Langkah 4.1: Buat Akun Vercel
1. Buka https://vercel.com
2. Sign up dengan GitHub
3. Authorize Vercel

### Langkah 4.2: Import Project
1. Di dashboard Vercel, klik "Add New +" → "Project"
2. Pilih repository `smartroom`
3. Klik "Import"

### Langkah 4.3: Konfigurasi Frontend
**Project Name:** `smartroom` (atau nama pilihan)

**Framework Preset:** "Next.js"

**Root Directory:** Klik "Edit" → Ganti dengan `backend/frontend`

**Build and Output Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm ci`

**Environment Variables:**
Tambahkan untuk production:
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://smartroom-backend.onrender.com` |

### Langkah 4.4: Deploy
Klik "Deploy" dan tunggu prosesnya (biasanya 3-5 menit)

**Catat URL Frontend:** Akan berupa `https://smartroom.vercel.app`

### Langkah 4.5: Update Vercel Domain di Backend
Kembali ke Render → `smartroom-backend` → Environment Variables

Update `ALLOWED_HOSTS` dengan menambahkan ini di Backend:

**File:** `backend/smartroom_backend/settings.py`
```python
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'smartroom-backend.onrender.com',
    '*.vercel.app'
]
```

Commit dan push ke GitHub:
```bash
git add .
git commit -m "Add Vercel domain to allowed hosts"
git push
```

Render akan auto-redeploy dalam 1-2 menit.

---

## ✨ Selesai! Links Publik Anda:

| Aplikasi | URL |
|----------|-----|
| **Frontend** | `https://smartroom.vercel.app` |
| **Backend API** | `https://smartroom-backend.onrender.com` |

---

## 🔍 Testing Production

### Test Frontend
```
https://smartroom.vercel.app
```
Aplikasi harus berjalan dengan normal.

### Test API Connection
```bash
curl https://smartroom-backend.onrender.com/api/score
```

### Troubleshooting

#### ❌ Frontend tidak konek ke Backend
- Cek `.env.production` sudah benar
- Cek CORS settings di Django settings.py
- Cek Network tab di Developer Tools browser

#### ❌ Backend error saat di-deploy
- Lihat logs di Render Dashboard
- Pastikan `requirements.txt` sudah di-commit

#### ❌ "Deploy stalled" di Vercel
- Cek Root Directory sesuai dengan `backend/frontend`
- Cek `package.json` exists di folder tersebut

---

## 📝 Notes

- **Free tier limitations:**
  - Render: Spins down setelah 15 menit inaktif (bisa spin back up)
  - Vercel: Tidak ada limitasi untuk traffic

- **Environment Variables:**
  - `.env.local` untuk development (tidak di-commit)
  - `.env.production` untuk production (bisa di-commit)

- **Custom Domain (Optional):**
  - Render: Go to "Settings" → "Custom Domain"
  - Vercel: Domains → Add Domain

---

## 🆘 Bantuan Lebih Lanjut

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Django Deployment: https://docs.djangoproject.com/en/6.0/howto/deployment/
