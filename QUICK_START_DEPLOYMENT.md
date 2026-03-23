# 🚀 QUICK START DEPLOYMENT

Semua file sudah disiapkan untuk deployment. Ikuti 4 langkah dibawah:

---

## ⚡ 4 Langkah Singkat

### 1️⃣ Siapkan GitHub (5 menit)
```bash
cd d:\Perkuliahan S6\Web Framework\smartroom
git init
git add .
git commit -m "Initial commit - Smart Room"
# Buat repo di https://github.com/new, lalu:
git remote add origin https://github.com/YOUR_USERNAME/smartroom.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy Backend ke Render (10 menit)
1. Buka https://render.com, sign up dengan GitHub
2. Klik "+ New" → "Web Service"
3. Pilih repository `smartroom`
4. Atur:
   - **Name:** smartroom-backend
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && gunicorn smartroom_backend.wsgi:application --bind 0.0.0.0:$PORT`
5. Environment Variables:
   - `DEBUG` = `False`
   - `SECRET_KEY` = (auto-generate)
6. Deploy! (tunggu 5-10 menit)
7. **Catat URL:** https://smartroom-backend.onrender.com (atau custom Anda)

### 3️⃣ Update URL Backend (2 menit)
Edit `backend/frontend/.env.production`:
```
NEXT_PUBLIC_API_URL=https://smartroom-backend.onrender.com
```

Push ke GitHub:
```bash
git add .
git commit -m "Update backend URL for production"
git push
```

### 4️⃣ Deploy Frontend ke Vercel (5 menit)
1. Buka https://vercel.com, sign up dengan GitHub
2. Klik "Import Project"
3. Pilih repository `smartroom`
4. Atur:
   - **Root Directory:** `backend/frontend` (penting!)
   - **Build Command:** `npm run build`
5. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://smartroom-backend.onrender.com`
6. Deploy!
7. **Catat URL:** https://smartroom.vercel.app (atau custom Anda)

---

## ✅ Selesai!

Your app is now LIVE:
- **Frontend:** https://smartroom.vercel.app
- **Backend API:** https://smartroom-backend.onrender.com

---

## 📚 Referensi

Lihat `DEPLOYMENT_GUIDE.md` untuk panduan lengkap dengan troubleshooting.

---

## 🎯 File-file yang sudah disiapkan:

✅ `backend/requirements.txt` - Python dependencies  
✅ `backend/render.yaml` - Render configuration  
✅ `backend/smartroom_backend/settings.py` - Production-ready Django settings  
✅ `backend/frontend/next.config.ts` - Environment variable support  
✅ `backend/frontend/.env.local` - Local development  
✅ `backend/frontend/.env.production` - Production environment  
✅ `.gitignore` - Exclude sensitive files  
✅ `DEPLOYMENT_GUIDE.md` - Detailed step-by-step guide  

Enjoy! 🎉
