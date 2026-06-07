# Quick Start - Smart Room (New Unified Flow)

Dokumen ini adalah acuan cepat tunggal untuk menjalankan Smart Room pada arsitektur terbaru:

- Frontend: Next.js (`http://localhost:3000`)
- Backend: Django API (`http://localhost:8000/api`)
- Entry utama aplikasi: `/login`

## 1) Prasyarat

- Windows + PowerShell
- Python venv backend sudah tersedia di `backend/.venv`
- Node.js + npm terpasang

## 2) Jalankan Project

Paling cepat (recommended):

```powershell
./start-smartroom.ps1
```

Alternatif (double click):

```text
start-smartroom.bat
```

Script akan membuka 2 terminal:

- Backend Django di port `8000`
- Frontend Next.js di port `3000`

## 3) URL yang Dipakai

- Login: `http://localhost:3000/login`
- Rooms/Lobby: `http://localhost:3000/rooms`
- Simulation: `http://localhost:3000/simulation/kipas`

Catatan:

- File HTML lama sudah tidak dipakai sebagai entry runtime.
- API base frontend ada di `backend/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 4) Verifikasi Cepat

1. Buka `http://localhost:3000/login`.
2. Login dengan user valid.
3. Pastikan otomatis masuk ke `/rooms`.
4. Coba akses route protected langsung (misalnya `/simulation/kipas`) saat belum login, harus redirect ke `/login`.

## 5) Verifikasi Middleware (Server-side Guard)

Perilaku yang benar:

- Belum login + akses `/rooms` atau `/simulation/*` -> redirect ke `/login?next=...`
- Sudah login + akses `/` atau `/login` -> redirect ke `/rooms`

Implementasi guard ada di:

- `backend/frontend/middleware.ts`

## 6) Troubleshooting Singkat

Jika backend gagal start:

```powershell
Set-Location .\backend
.\.venv\Scripts\python manage.py runserver 0.0.0.0:8000
```

Jika frontend gagal start:

```powershell
Set-Location .\backend\frontend
npm run dev
```

Jika port bentrok, cek proses:

```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :3000
```

## 7) Ringkasan Alur Baru

`/login` -> `/rooms` -> `/simulation/{roomId}`

Semua akses game sekarang lewat Next.js frontend + Django API.
