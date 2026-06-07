# 🎮 Smart Room - Lobby & Room Selection Guide

📌 Panduan utama terbaru: lihat `QUICK_START_NEW_FLOW.md` untuk alur startup dan routing terkini.

## 📋 Overview

Setelah login, pengguna akan diarahkan ke halaman **Lobi/Koridor** untuk memilih ruangan yang ingin dimasuki sebelum bermain game.

---

## 🚪 Ruangan Tersedia

| Ruangan | Emoji | Deskripsi | Tingkat Kesulitan | Kebutuhan |
|---------|-------|-----------|-------------------|-----------|
| **Kipas Angin Pintar** | 🌬️ | Kontrol kipas dengan sensor suhu. Nyala otomatis jika suhu > 25°C | 🟢 Mudah | Sensor Suhu, Digital Write |
| **Board Game Otomatis** | 🎮 | Lampu papan yang responsif. Nyala jika ada gerakan AND cahaya < 50 lux | 🟡 Sedang | Sensor Gerakan, Cahaya, Digital Write |
| **Mode Demo** | 📺 | Eksplorasi bebas tanpa challenge. Cocok untuk belajar | 🟢 Mudah | Semua blok tersedia |

---

## 🎯 Alur Penggunaan

### Langkah 1: Login
```
🔐 /login → Isi username & password → Klik Login
```

### Langkah 2: Pilih Ruangan di Lobi
```
🏢 /rooms

Akan melihat 3 kartu ruangan:
- Kipas Angin Pintar
- Board Game Otomatis  
- Mode Demo

Klik "Masuk Ruangan" untuk memilih
```

### Langkah 3: Bermain Game
```
🎮 /simulation/{roomId}

Fitur-fitur:
- Header menampilkan ruangan yang dipilih
- Tombol "Kembali ke Lobi" untuk pindah ruangan
- Tombol "Logout" untuk keluar
```

### Langkah 4: Kembali atau Logout
```
← Kembali ke Lobi → Memilih ruangan lain
🚪 Logout → Kembali ke /login
```

---

## 🔄 Fitur Lobi

### Desain
- **Modern UI** dengan gradient background
- **Animasi smooth** saat halaman load
- **Responsive design** untuk mobile & desktop
- **Kartu interaktif** dengan hover effects

### Fungsionalitas
1. **Tampil User** - Menampilkan username yang login
2. **Pilih Ruangan** - 3 pilihan ruangan dengan deskripsi
3. **Difficulty Badge** - Indikator tingkat kesulitan
4. **Quick Info** - Kebutuhan blok untuk setiap ruangan
5. **Logout** - Keluar dari aplikasi

---

## 🎮 Fitur Game per Ruangan

### Mode Normal (Kipas / Board Game)
- ✅ Hanya device terpilih yang bisa diakses
- ✅ User harus submit kode yang benar
- ✅ Backend validasi jawaban
- ✅ Feedback: Benar/Coba Lagi

### Mode Demo
- ✅ Bisa akses semua device
- ✅ Kode apapun diterima tanpa validasi
- ✅ Tidak diperlukan submit ke backend
- ✅ Ideal untuk learning & exploration
- ✅ Feedback langsung: "Demo Mode - Kode Diterima!"

---

## 💾 Data di LocalStorage

```javascript
// Login data
localStorage.getItem('isLoggedIn') // 'true' atau false
localStorage.getItem('user') // JSON: {id, username}

// Room selection
localStorage.getItem('selectedRoom') // 'kipas' | 'boardgame' | 'demo'
```

---

## 🔗 URL Parameters

Game bisa diakses dengan URL parameter:

```
/simulation/kipas                    // Kipas (contoh)
/simulation/kipas        // Kipas Angin
/simulation/boardgame    // Board Game
/simulation/demo         // Mode Demo
```

---

## 🎨 Styling

### Lobi Page
- Gradient background: Purple → Pink
- Card layout: 3 columns (responsive)
- Icons: Emoji-based untuk simple & cute
- Colors:
  - Header: Gradient #667eea → #764ba2
  - Cards: White with shadow
  - Buttons: Gradient purple
  - Text: Dark gray & white

### Game Page
- Header shows room name
- Room badge: 📍 + Emoji + Name
- Back button next to logout
- Same color scheme as login

---

## 📱 Responsive Breakpoints

```css
/* Desktop: 3 columns */
@media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
}

/* Mobile: 1 column */
@media (max-width: 768px) {
    grid-template-columns: 1fr;
}
```

---

## 🔐 Security Features

1. ✅ Auth check on both lobby & game
2. ✅ Redirect to login if not authenticated
3. ✅ Prevent back button to login (history.pushState)
4. ✅ Clear selectedRoom on logout
5. ✅ Session validation before API calls

---

## 🚀 File Structure

```
smartroom/
├── backend/frontend/app/login/page.tsx
├── backend/frontend/app/rooms/page.tsx
├── backend/frontend/app/simulation/[roomId]/page.tsx
├── backend/frontend/middleware.ts
├── LOGIN_SYSTEM_GUIDE.md
└── BACKEND_TROUBLESHOOTING.md
```

---

## 🧪 Testing

### Test Lobby Flow
1. Open `/login`
2. Register & login
3. ✅ Should redirect to `/rooms`
4. See 3 door cards
5. Click each card to see descriptions
6. Click "Masuk Ruangan"

### Test Room Selection
1. Click "Masuk Ruangan" for Kipas
2. ✅ Header shows "🌬️ Kipas Angin Pintar"
3. ✅ Can only interact with kipas device
4. Close modal near boardgame
5. ✅ Should show "tidak ada interaksi"
6. Click "Kembali ke Lobi"
7. ✅ Back to lobby

### Test Demo Mode
1. Select Mode Demo
2. ✅ Can interact with both kipas & boardgame
3. ✅ Code tidak perlu validasi
4. ✅ Message: "Demo Mode - Kode Diterima!"
5. Device hidup dengan animasi

### Test Navigation
1. From game → "Kembali ke Lobi" → Select other room
2. From lobby → Logout → Login → Check room selection reset

---

## 📊 User Experience

### Before Login
```
/login ← register/login form
```

### After Login
```
/login → [redirect] → /rooms ← room selection
                                ↓
                            /simulation/kipas|boardgame|demo ← game play

                                ↓
                         [Kembali ke Lobi/Logout]
```

---

## 🛠️ Development Notes

### Code Changes Made
1. Created `/rooms` with room selection UI
2. Updated `/login` to redirect to `/rooms`
3. Updated `/simulation/[roomId]` to:
   - Load room from URL/localStorage
   - Show room name in header
   - Add "Back to Lobby" button
   - Handle room-specific interactions
   - Support demo mode with auto-acceptance

### Key Functions
- `loadSelectedRoom()` - Load room from URL/storage
- `backToLobby()` - Navigate back to lobby
- `enterRoom(roomId)` - Select room and navigate to game
- Updated `submitCode()` - Handle demo mode

---

## 📝 Future Enhancements

1. **Progress Tracking** - Save scores per room
2. **Room Difficulty Selection** - Easy/Medium/Hard
3. **Achievements** - Badges for completing rooms
4. **Leaderboard** - Top scores per room
5. **Multiple Rooms** - Add more scenarios
6. **Custom Challenges** - Teacher-created rooms
7. **Team Mode** - Collaborative room solving
8. **Time Limits** - Speed challenges per room

---

## 🙋 Support

Jika ada issue dengan lobi/room selection:

1. Check browser console (`F12`)  
2. Check localStorage di DevTools
3. Ensure `/rooms` ada di root folder
4. Backend harus berjalan untuk login validation
5. CORS harus allow localhost

---

**Last Updated:** April 17, 2026  
**Status:** ✅ Implemented & Tested

