# 🔧 Backend Connection Troubleshooting Guide

📌 Panduan utama terbaru: lihat `QUICK_START_NEW_FLOW.md` untuk alur runtime yang paling up-to-date.

## Status Backend Server

✅ **Backend server sudah diperbaiki dan berjalan di `http://localhost:8000`**

---

## 🚀 Quick Start - Jalankan Backend

Jika backend belum berjalan, jalankan command ini di terminal:

```powershell
cd "d:\Perkuliahan S6\Web Framework\smartroom\backend"
& ".\.venv\Scripts\python" manage.py runserver 0.0.0.0:8000
```

Pesan sukses:
```
April 17, 2026 - 13:44:48
Django version 6.0.3, using settings 'smartroom_backend.settings'
Starting development server at http://0.0.0.0:8000/
Quit the server with CTRL-BREAK.
```

---

## 🧪 Test Koneksi

### Opsi 1: Gunakan Route Frontend
1. Jalankan frontend Next.js di `http://localhost:3000`
2. Buka halaman `http://localhost:3000/login`
3. Coba login/register untuk memastikan koneksi API backend
4. Jika gagal: cek troubleshooting di bawah

### Opsi 2: Gunakan Browser Developer Tools

Buka browser, tekan `F12`, kemudian ketik di Console:

```javascript
// Test jika backend berjalan
fetch('http://localhost:8000/api/check-auth/', {
    credentials: 'include'
})
.then(r => r.json())
.then(console.log)
```

Respons yang diharapkan:
```json
{
    "status": "success",
    "authenticated": false
}
```

---

## ❌ Troubleshooting

### Error 1: "Koneksi gagal. Pastikan backend berjalan"

**Kemungkinan Penyebab:**
1. Server Django tidak berjalan
2. Port 8000 sudah dipakai aplikasi lain
3. Firewall memblokir port 8000

**Solusi:**

```bash
# 1. Cek apakah port 8000 dipakai
netstat -ano | findstr :8000

# Jika sudah dipakai, kill process:
taskkill /PID <PID> /F

# 2. Jalankan server di port berbeda
cd backend
.\.venv\Scripts\python manage.py runserver 0.0.0.0:9000

# Update API_URL di .env.local frontend:
# Ganti http://localhost:8000/api
# Dengan http://localhost:9000/api
```

### Error 2: "ModuleNotFoundError: No module named 'whitenoise'"

**Status:** ✅ **SUDAH DIPERBAIKI**

Settings.py sudah diupdate untuk development tanpa whitenoise.

### Error 3: "ModuleNotFoundError: No module named 'decouple'"

**Status:** ✅ **SUDAH DIPERBAIKI**

settings.py sudah diupdate untuk menggunakan `os.environ` bukan `decouple`.

### Error 4: CORS Error di Browser Console

**Kemungkinan Penyebab:**
- URL frontend tidak ada di CORS_ALLOWED_ORIGINS di settings.py

**Solusi:**
```python
# Di backend/smartroom_backend/settings.py

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",      # Next.js port
    "http://localhost:5500",      # Live Server port
    "http://localhost:8000",      # Backend (jika frontend di sini)
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8000",
    # Tambahkan port frontend Anda di sini jika berbeda
]

CORS_ALLOW_CREDENTIALS = True
```

---

## 📝 File-File Penting

| File | Deskripsi |
|------|-----------|
| `backend/manage.py` | Django command line tool |
| `backend/smartroom_backend/settings.py` | Konfigurasi Django (CORS, Database, dll) |
| `backend/gameapi/views.py` | API endpoints (register, login, score) |
| `backend/gameapi/urls.py` | URL routing |
| `backend/frontend/app/login/page.tsx` | Halaman login/register Next.js |
| `backend/frontend/app/rooms/page.tsx` | Halaman lobby/pemilihan ruangan |
| `backend/frontend/app/simulation/[roomId]/page.tsx` | Halaman simulasi/game |
| `backend/frontend/.env.local` | Konfigurasi URL backend untuk frontend |

---

## 🔍 Debug: Cek API Endpoints

### Register User
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@example.com"}'
```

### Login User
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  -c cookies.txt
```

### Check Auth (dengan cookies)
```bash
curl -X GET http://localhost:8000/api/check-auth/ \
  -b cookies.txt
```

---

## 📊 Database Info

SQLite Database: `backend/db.sqlite3`

User data tersimpan di table `auth_user`.

### Lihat Users via Django Shell

```bash
cd backend
.\.venv\Scripts\python manage.py shell

# Di Django shell:
from django.contrib.auth.models import User
for user in User.objects.all():
    print(f"{user.id}: {user.username} ({user.email})")
```

---

## ⚡ Performance Tips

### 1. Jalankan Server dengan Threading (Lebih Cepat)
```bash
python manage.py runserver --nothreading
```

### 2. Disable StatReloader jika Lambat
```bash
python manage.py runserver --noreload 0.0.0.0:8000
```

### 3. Gunakan Gunicorn untuk Production
```bash
pip install gunicorn
gunicorn smartroom_backend.wsgi:application --bind 0.0.0.0:8000
```

---

## 🎯 Next Steps

1. ✅ Backend server berjalan
2. ✅ CORS sudah dikonfigurasi
3. ✅ API check-auth siap untuk testing
4. 📋 Next: Test registration dan login di `http://localhost:3000/login`
5. 📋 Jika berhasil: masuk ke `http://localhost:3000/rooms` lalu mulai simulasi

---

## 📞 Support

Jika masih ada masalah:

1. Lihat pesan error di browser console (`F12` → Console)
2. Lihat pesan error di terminal backend
3. Cek network tab di DevTools untuk melihat request/response
4. Gunakan request `GET /api/check-auth/` untuk isolasi masalah

---

## ▶️ Menjalankan Project Sekali Klik (Windows)

Gunakan script di root project:

```powershell
./start-smartroom.ps1
```

Atau double-click:

```text
start-smartroom.bat
```

Script akan membuka dua terminal terpisah untuk backend Django dan frontend Next.js.

---

**Last Updated:** April 17, 2026
**Status:** ✅ Operational

