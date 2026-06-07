# 🎮 Smart Room - Login System Documentation

📌 Panduan utama terbaru: lihat `QUICK_START_NEW_FLOW.md` untuk cara menjalankan aplikasi dan flow route terbaru.

## Overview
Fitur login telah berhasil diintegrasikan ke dalam Smart Room. Sekarang pengguna harus login terlebih dahulu sebelum dapat bermain game.

---

## 📋 Fitur-Fitur Login

### 1. Registration (Pendaftaran)
- Pengguna dapat membuat akun baru
- Validasi username dan password
- Password minimal 6 karakter
- Email opsional

### 2. Login
- Login dengan username dan password
- Session-based authentication
- Redirect otomatis ke login jika sesi expired
- User info ditampilkan di header game

### 3. Logout  
- Tombol logout di header game
- Clear session dan local storage
- Redirect ke login page

### 4. Authentication Protection
- Game endpoint (`/api/score/`) memerlukan autentikasi
- Pengguna tidak autentik akan mendapat error 401
- Redirect otomatis ke login jika sesi habis

---

## 🚀 Cara Menggunakan

### Backend Setup
1. Backend sudah dikonfigurasi untuk menerima request dari frontend
2. Django User Model digunakan untuk menyimpan data user
3. SQLite database sudah siap di `backend/db.sqlite3`

### Frontend Setup
1. **Login Page**: `/login` - Untuk login dan registrasi
2. **Rooms Page**: `/rooms` - Pilih ruangan sebelum masuk simulasi
3. **Simulation Page**: `/simulation/{roomId}` - Game utama (require login)

### Alur Pengguna

#### Pertama Kali (Registrasi)
1. Buka `/login`
2. Klik tab "Daftar"
3. Isi username, email (opsional), dan password
4. Klik "Daftar"
5. Klik tab "Login"
6. Login dengan username dan password yang baru dibuat

#### Login Reguler
1. Buka `/login`
2. Masukkan username dan password
3. Klik "Login"
4. Akan redirect otomatis ke `/rooms`

#### Bermain Game
1. Game akan ditampilkan dengan header user info
2. Header menampilkan: "Smart Room" + Username + Tombol Logout
3. Mainkan game seperti biasa

#### Logout
1. Klik tombol "Logout" di header
2. Klik "Ya" untuk konfirmasi
3. Akan redirect ke `/login`

---

## 🔧 Technical Details

### Backend API Endpoints

#### Registration
```
POST /api/register/
Content-Type: application/json

{
    "username": "user123",
    "password": "password123",
    "email": "user@example.com"  // optional
}

Response (200 OK):
{
    "status": "success",
    "message": "Registrasi berhasil. Silakan login.",
    "user_id": 1,
    "username": "user123"
}

Response (400 Bad Request):
{
    "status": "error",
    "message": "Username sudah terdaftar"
}
```

#### Login
```
POST /api/login/
Content-Type: application/json

{
    "username": "user123",
    "password": "password123"
}

Response (200 OK):
{
    "status": "success",
    "message": "Login berhasil",
    "user_id": 1,
    "username": "user123",
    "email": "user@example.com"
}

Response (401 Unauthorized):
{
    "status": "error",
    "message": "Username atau password salah"
}
```

#### Logout
```
POST /api/logout/

Response (200 OK):
{
    "status": "success",
    "message": "Logout berhasil"
}
```

#### Check Auth Status
```
GET /api/check-auth/

Response (Authenticated):
{
    "status": "success",
    "authenticated": true,
    "user_id": 1,
    "username": "user123",
    "email": "user@example.com"
}

Response (Not Authenticated):
{
    "status": "success",
    "authenticated": false
}
```

#### Submit Code (Protected)
```
POST /api/score/
Requires: Authentication

{
    "code": "..."
}

Response (401 Unauthorized - Not Logged In):
{
    "status": "error",
    "message": "Anda harus login terlebih dahulu"
}

Response (200 OK - Logged In):
{
    "status": "success",
    "message": "Evaluasi kode selesai",
    "correct": true/false,
    "code": "..."
}
```

---

## 📁 File Structure

```
smartroom/
├── backend/frontend/app/login/page.tsx                    # Login/Register page
├── backend/frontend/app/rooms/page.tsx                    # Room selection page
├── backend/frontend/app/simulation/[roomId]/page.tsx      # Game page (requires login)
├── backend/frontend/middleware.ts                          # Server-side route guard
├── backend/
│   ├── gameapi/
│   │   ├── views.py             # UPDATED - Added auth endpoints
│   │   ├── urls.py              # UPDATED - Added auth routes
│   │   └── ...
│   ├── smartroom_backend/
│   │   ├── settings.py          # UPDATED - Fixed decouple issue
│   │   └── ...
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3               # Database with users
└── ...
```

---

## 🔐 Security Notes

### Current Implementation
- ✅ Session-based authentication using Django built-in auth
- ✅ CSRF protection
- ✅ CORS configured
- ✅ Password validation (min 6 chars)
- ✅ Username uniqueness check

### For Production Use
- 🔒 Set `DEBUG = False` in settings
- 🔒 Use environment variables for `SECRET_KEY`
- 🔒 Use HTTPS/SSL
- 🔒 Configure allowed hosts properly
- 🔒 Consider adding rate limiting for login attempts
- 🔒 Use password hashing (Django does this automatically)
- 🔒 Consider two-factor authentication

---

## 🧪 Testing

### Test Registration
1. Open `/login`
2. Switch to "Daftar" tab
3. Enter:
   - Username: `testuser`
   - Email: `test@example.com` (optional)
   - Password: `password123`
   - Confirm: `password123`
4. Click "Daftar"
5. ✅ Should see "Registrasi berhasil!"

### Test Login
1. Switch to "Login" tab
2. Enter credentials from above
3. Click "Login"
4. ✅ Should redirect to game
5. ✅ Username should appear in header

### Test Authentication Protection
1. Logout
2. Open browser DevTools
3. Go to Console
4. Try fetching game API:
   ```javascript
   fetch('http://localhost:8000/api/score/', {
       method: 'POST',
       credentials: 'include',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ code: 'test' })
   }).then(r => r.json()).then(console.log)
   ```
5. ✅ Should get 401 error "Anda harus login terlebih dahulu"
6. Login first, then try again
7. ✅ Should work (accepted or evaluated)

---

## 🚢 Deployment

### For Vercel (Frontend)
1. Update `.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

### For Render (Backend)
1. No additional setup needed
2. Database (SQLite) is created automatically
3. User data persists across deployments

---

## 📝 Implementation Notes

### What Was Changed

#### Backend (`backend/gameapi/views.py`)
- Added `register()` function - User registration endpoint
- Added `login()` function - User login endpoint  
- Added `logout()` function - User logout endpoint
- Added `check_auth()` function - Check authentication status
- Modified `score()` function - Require authentication before submitting code
- Added helper function `get_user_from_token()` for potential token auth

#### Backend (`backend/gameapi/urls.py`)
- Added new routes: `/api/register/`, `/api/login/`, `/api/logout/`, `/api/check-auth/`

#### Backend (`backend/smartroom_backend/settings.py`)
- Removed `decouple` dependency
- Using environment variables with fallback defaults

#### Frontend (`backend/frontend/app/simulation/[roomId]/page.tsx`)
- Added user info bar at top
- Authentication check on page load
- Logout function
- Updated fetch calls to include `credentials: 'include'`
- Handle 401 errors and redirect to login

#### Frontend (`/login`) - NEW
- Complete login/register UI
- Form validation
- API integration
- Local storage for session tracking
- Tab-based interface (Login/Register)

---

## 🔄 Database

### SQLite Database Schema
```
User Table (from Django):
- id (Primary Key)
- username (Unique)
- password (Hashed)
- email
- first_name
- last_name
- is_active
- date_joined
- ... (other Django fields)
```

User data is stored locally in `backend/db.sqlite3`.

---

## 📞 Troubleshooting

### "Koneksi gagal" saat login
- ✅ Pastikan backend server berjalan
- ✅ Cek URL API di `backend/frontend/.env.local`
- ✅ Cek CORS settings di `settings.py`

### "Sesi telah berakhir" di game
- ✅ Buka console dan clear localStorage: `localStorage.clear()`
- ✅ Login kembali

### Username sudah terdaftar tapi lupa password
- ✅ Untuk development: Edit database manual atau reset
- ✅ Untuk production: Implementasikan "Forgot Password" feature

### Game tidak load setelah login
- ✅ Cek console untuk error
- ✅ Pastikan route `/rooms` dan `/simulation/kipas|boardgame|demo` dapat diakses
- ✅ Pastikan user info tersimpan di localStorage

---

## 🎯 Next Steps (Optional Features)

Fitur yang bisa ditambahkan di masa depan:
1. Forgot Password / Reset Password
2. Email Verification
3. User Profile Page
4. Leaderboard (High Scores per User)
5. Two-Factor Authentication (2FA)
6. OAuth2 Integration (Google, Facebook Login)
7. User Roles & Permissions
8. Activity Logging

---

## 📜 License & Credits

Smart Room Login System - Educational Project
Untuk mata kuliah Web Framework Semester 6

---

Generated: April 17, 2026

