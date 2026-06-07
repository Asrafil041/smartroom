# Smart Room

Smart Room adalah platform pembelajaran interaktif berbasis web untuk memahami konsep Smart Home dan Internet of Things melalui simulasi ruangan dan aktivitas perangkat.

## Deskripsi Proyek

Aplikasi ini menyediakan:
- Halaman login dan pendaftaran pengguna
- Pilihan ruang belajar dan simulasi interaktif
- Mode permainan berbasis skenario perangkat pintar
- Pelacakan skor dan kemajuan pengguna

Proyek ini terbagi menjadi dua bagian utama:
1. `frontend/` untuk antarmuka pengguna
2. `backend/` untuk layanan API dan autentikasi

## Teknologi dan Framework

### Frontend
- Next.js
- React
- Tailwind CSS
- Phaser (untuk simulasi permainan)

### Backend
- Django
- Django CORS Headers
- Gunicorn
- Whitenoise
- Python Decouple

## Struktur Proyek

- `backend/` - kode backend Django, konfigurasi, database SQLite
- `frontend/` - aplikasi Next.js untuk tampilan UI
- `start-smartroom.bat` - skrip Windows untuk menjalankan aplikasi
- `start-smartroom.ps1` - skrip PowerShell untuk menjalankan aplikasi

## Persyaratan

- Node.js v16+ / npm
- Python 3.11+ (direkomendasikan)
- Virtual environment Python

## Cara Menjalankan Aplikasi

### 1. Siapkan Backend

1. Buka terminal di folder `backend/`
2. Buat virtual environment Python dan aktifkan:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
   ```
3. Instal dependensi:
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan migrasi database:
   ```bash
   python manage.py migrate
   ```
5. Jalankan server Django:
   ```bash
   python manage.py runserver
   ```

Backend akan berjalan di `http://localhost:8000` secara default.

### 2. Siapkan Frontend

1. Buka terminal di folder `frontend/`
2. Instal dependensi npm:
   ```bash
   npm install
   ```
3. Jalankan aplikasi Next.js:
   ```bash
   npm run dev
   ```

Frontend akan berjalan di `http://localhost:3000` secara default.

### 3. Akses Aplikasi

Buka browser dan akses:
- `http://localhost:3000` untuk UI aplikasi

### 4. Link Deployment

Buka browser dan akses:
- `https://zip-repl--2313025041.replit.app` berlaku 1 bulan

## Catatan Tambahan

- Jika backend dijalankan di alamat atau port berbeda, periksa konfigurasi `NEXT_PUBLIC_API_URL` di file frontend.
- Database backend menggunakan `db.sqlite3` di folder `backend/`.

---

Jika ingin menjalankan keduanya sekaligus, Anda dapat membuka dua terminal terpisah: satu untuk backend dan satu lagi untuk frontend.
