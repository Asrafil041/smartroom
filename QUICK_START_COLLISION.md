# 🎮 Quick Start - Collision Detection Fix

## Masalah yang Diselesaikan
✅ Player tidak bisa menembus furniture lagi (kasur, lemari, meja, tembok, dll)
✅ Collision detection yang realistis dan smooth

## Cara Menggunakan

### 1. Test Game
```
Buka `/simulation/kipas` (atau `/simulation/boardgame`, `/simulation/demo`) di browser
↓
Coba berjalan ke furniture (kasur, lemari, meja)
↓
Player akan berhenti (collision detection bekerja!)
```

### 2. Jika Collision Box Tidak Sejajar dengan Furniture

**Aktifkan Debug Mode:**
- Tekan tombol **D** di keyboard
- **Garis MERAH** = collision box furniture
- **Garis HIJAU** = player collision radius

**Sesuaikan Posisi:**
- Edit `backend/frontend/app/simulation/[roomId]/page.tsx`
- Cari section `const furnitureData = [`
- Ubah parameter `x`, `y`, `width`, `height`
- Refresh browser

### 3. Contoh Penyesuaian

Jika kasur collision box posisinya salah:

```javascript
// SEBELUM (kurang tepat):
{ x: 150, y: 120, width: 140, height: 120 }

// SESUDAH (diposisikan ulang):
{ x: 160, y: 130, width: 150, height: 130 }
```

## Furniture yang Sudah Ada Collision

1. **Kasur** - Atas kiri
2. **Lemari** - Atas kanan  
3. **Meja** - Tengah
4. **Dinding** - Semua sisi
5. **Pot tanaman** - Kanan bawah
6. **Mebel kecil** - Kanan bawah

## File Penting

- `backend/frontend/app/simulation/[roomId]/page.tsx` → Source game utama (edit `furnitureData` untuk adjust position)
- `COLLISION_DEBUG_GUIDE.md` → Dokumentasi lengkap
- Debug Mode → Tekan D untuk toggle visualisasi

## Testing Checklist

- [ ] Berjalan ke kasur → collision bekerja
- [ ] Berjalan ke lemari → collision bekerja  
- [ ] Berjalan ke meja → collision bekerja
- [ ] Berjalan ke dinding → collision bekerja
- [ ] Collision smooth, tidak ada jitter
- [ ] Perangkat (komputer/kipas) masih bisa diakses

---
**Need help?** Lihat `COLLISION_DEBUG_GUIDE.md` untuk panduan lengkap

