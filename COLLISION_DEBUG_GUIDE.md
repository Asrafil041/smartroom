# Panduan Collision Detection dan Debug Mode

## Apa yang Sudah Ditambahkan

Saya telah menambahkan sistem collision detection lengkap untuk mencegah player menembus furniture dan benda-benda di ruangan. Sistem ini mencakup:

1. **Collision boxes untuk semua furniture** (kasur, lemari, meja, dll)
2. **Collision boxes untuk semua dinding/borders**
3. **Debug mode visual** untuk melihat dan menyesuaikan posisi collision boxes
4. **Collision detection dinamis** antara player dan semua obstacle

## Cara Menggunakan Debug Mode

### Mengaktifkan Debug Mode
1. Jalankan game di browser
2. Tekan tombol **D** (huruf D besar atau kecil) untuk toggle debug mode
3. Saat debug mode aktif, Anda akan melihat:
   - **Garis merah** = kotak collision untuk furniture dan obstacle
   - **Garis hijau** = collision circle player (ukuran player)

### Membaca Debug Visualization
```
[Merah = Furniture/Obstacle]  [Hijau = Player Collision]
┌─────────────────┐            ●
│   Kasur/Table   │           ╱│╲
│   (obstacle)    │          ─ ⊙ ─
└─────────────────┘           ╲│╱
```

Ketika Anda mencoba bergerak ke furniture merah, player (hijau) akan terhenti dan tidak bisa menembus.

## Menyesuaikan Posisi Collision Boxes

Jika furniture tidak sejajar dengan collision boxes, edit file `backend/frontend/app/simulation/[roomId]/page.tsx` dan cari bagian ini:

```javascript
const furnitureData = [
    // Kasur (atas kiri)
    { x: 150, y: 120, width: 140, height: 120 },
    // Lemari/Cabinet (atas kanan)
    { x: 680, y: 130, width: 100, height: 100 },
    // ... dst
];
```

### Cara Menyesuaikan Setiap Furniture

Setiap furniture memiliki 4 parameter:
- **x**: Posisi horizontal (0 = kiri, 800 = kanan)
- **y**: Posisi vertikal (0 = atas, 600 = bawah)
- **width**: Lebar collision box
- **height**: Tinggi collision box

#### Contoh Penyesuaian Kasur
```javascript
// Sebelum (jika collision box terlalu kecil):
{ x: 150, y: 120, width: 140, height: 120 },

// Sesudah (diperluas):
{ x: 150, y: 120, width: 160, height: 140 },
```

### Langkah-Langkah Menyesuaikan

1. **Aktifkan debug mode** (tekan D)
2. **Lihat posisi collision box** yang berwarna merah
3. **Bandingkan dengan furniture visual** di background
4. **Edit parameter x, y, width, height** di `furnitureData`
5. **Refresh browser** untuk melihat perubahan
6. **Ulangi** sampai perfect alignment

## Daftar Lengkap Furniture yang Sudah Ada Collision

| No | Furniture | x, y | width × height | Keterangan |
|----|-----------|------|--------|------------|
| 1 | Kasur | 150, 120 | 140 × 120 | Atas kiri |
| 2 | Lemari/Cabinet | 680, 130 | 100 × 100 | Atas kanan |
| 3 | Meja | 350, 350 | 160 × 120 | Tengah ruangan |
| 4 | Dinding kiri | 30, 300 | 30 × 600 | Sisi kiri |
| 5 | Dinding kanan | 770, 300 | 30 × 600 | Sisi kanan |
| 6 | Dinding atas | 400, 30 | 800 × 30 | Sisi atas |
| 7 | Dinding bawah | 400, 570 | 800 × 30 | Sisi bawah |
| 8 | Pot tanaman | 750, 500 | 50 × 50 | Pojok kanan bawah |
| 9 | Mebel kecil | 650, 490 | 60 × 80 | Kanan bawah |

## Menambah Furniture Baru

Jika ada furniture yang belum memiliki collision box, tambahkan ke array `furnitureData`:

```javascript
const furnitureData = [
    // ... furniture yang sudah ada ...
    
    // Tambah furniture baru
    { x: 500, y: 450, width: 100, height: 80 },  // Furniture baru
];
```

## Tips & Trik

### 1. Menemukan Koordinat yang Tepat
- Gunakan **debug mode** untuk visualisasi real-time
- Gerakkan player ke furniture dan lihat titik intersectionnya
- Sesuaikan hingga collision terasa natural

### 2. Ukuran Collision Box
- Lebih besar = lebih susah menembus, tapi terasa "blok"
- Lebih kecil = lebih licin, tapi bisa tenembus
- Rekomendasinya sesuaikan dengan **ukuran visual furniture**

### 3. Testing
Setelah edit, test dengan:
1. Berjalan ke setiap furniture dari 4 arah (atas, bawah, kiri, kanan)
2. Coba diagonal untuk memastikan smooth collision
3. Gunakan debug mode untuk verifikasi visual

## Contoh Workflow Lengkap

```
1. Buka browser → game terbuka
   ↓
2. Tekan D → debug mode ON
   ↓
3. Lihat lokasi furniture vs collision box
   ↓
4. Jika tidak sejajar → Edit `backend/frontend/app/simulation/[roomId]/page.tsx` (furnitureData)
   ↓
5. Refresh browser → Lihat perubahan
   ↓
6. Tekan D lagi → toggle debug mode OFF
   ↓
7. Test berjalan ke furniture → verifikasi collision bekerja
   ↓
8. Done! Collision realistis ✓
```

## Troubleshooting

### Player masih bisa menembus furniture
- **Penyebab**: Collision box terlalu kecil atau posisi salah
- **Solusi**: Aktivkan debug mode, perbesar width/height, atau adjust x/y

### Player tidak bisa bergerak ke area tertentu
- **Penyebab**: Collision box overlap atau cakupannya terlalu luas
- **Solusi**: Kurangi width/height atau ubah posisinya

### Debug mode tidak muncul
- **Penyebab**: Tombol D mungkin tidak terdaftar atau browser cache
- **Solusi**: Press F12 → Console, cek error message. Atau refresh dengan Ctrl+F5

### Furniture terlihat bagus tapi collision tidak sejajar
- **Penyebab**: Background image dan physics world punya scale berbeda
- **Solusi**: Sesuaikan parameter scale di `setDisplaySize()`

## Performa & Optimasi

Sistem collision ini menggunakan:
- **Physics Arcade Engine** dari Phaser (ringan & cepat)
- **Static bodies** untuk obstacle (tidak perlu update posisi)
- **Dynamic body** untuk player (bisa bergerak & collision resolve)

Dengan 9 furniture, performa tetap smooth (~60 FPS).

---

**Dibuat dengan** ❤️ **untuk Smart Room Learning Game**

