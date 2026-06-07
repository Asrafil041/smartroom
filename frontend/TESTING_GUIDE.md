# 🚀 Smart Room - Frontend Setup & Testing Guide

## ✅ What's Been Implemented

### Pages
- ✅ **Login Page** (`/login`) - Beautiful gradient UI with demo credentials
- ✅ **Rooms Page** (`/rooms`) - Room selection with cards, progress bars, and lock system
- ✅ **Simulation Page** (`/simulation/[roomId]`) - Placeholder for game integration

### Components
- ✅ **RoomSelection** - Interactive room card grid with:
  - Lock/unlock state indicators
  - Difficulty badges with star ratings
  - Completion progress bars
  - Requirement text for locked rooms
  - Responsive layout (1/2/3 columns)

### Assets
- ✅ **Dummy Images** - 4 SVG room images:
  - `room-kipas.svg` - Fan controller UI
  - `room-boardgame.svg` - Board game UI
  - `room-lighting.svg` - Light system UI
  - `room-door.svg` - Smart door lock UI

---

## 🎯 How to Test the Flow

### 1. Start the Next.js Development Server

```bash
cd backend/frontend
npm install  # if not done yet
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 2. Login Page (`/login`)

**URL:** `http://localhost:3000/login`

**Demo Credentials:**
- Username: `testuser`
- Password: `testpass`

Atau masukkan username/password apa saja (validasi minimal untuk demo)

**Expected behavior:**
- Form yang menarik dengan gradient ungu
- Pesan error jika field kosong
- Redirect ke `/rooms` setelah login sukses

### 3. Rooms Page (`/rooms`)

**URL:** Auto-redirect setelah login atau langsung ke `http://localhost:3000/rooms`

**Expected behavior:**
- 4 room cards ditampilkan dengan gambar dummy SVG
- Rooms dengan `is_accessible: true` → bisa diklik
- Rooms dengan `is_accessible: false` → ada lock icon & disabled
- Semua cards responsive di mobile/tablet/desktop

### 4. Room Selection (Click Room Card)

**Klika room yang accessible:**
- Button "Mulai Simulasi" aktif
- Loading state saat navigating
- Redirect ke `/simulation/[roomId]`

**Klik room yang locked:**
- Button "Terkunci" disabled
- Pesan persyaratan ditampilkan
- Tidak bisa diklik


### 5. Simulation Page

**URL:** `http://localhost:3000/simulation/kipas` (contoh)

**Expected behavior:**
- Header dengan room ID
- Placeholder game area
- Score & timer display
- Exit button ke rooms page
- "Back to Rooms" button

### 6. Logout

**Di rooms page:**
- Klik button "Logout" di top-right
- Session token dihapus dari localStorage
- Redirect ke `/login`

---

## 📁 File Structure

```
frontend/
├── app/
│   ├── page.tsx _________________ Redirect ke /login
│   ├── layout.tsx _______________ Root layout (updated metadata)
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx _____________ Login page
│   ├── rooms/
│   │   └── page.tsx _____________ Room selection page
│   └── simulation/
│       └── [roomId]/
│           └── page.tsx _________ Simulation placeholder
├── components/
│   └── RoomSelection.tsx ________ Room cards component
├── public/
│   ├── room-kipas.svg __________ Fan room image
│   ├── room-boardgame.svg ______ Board game image
│   ├── room-lighting.svg _______ Lighting room image
│   └── room-door.svg __________ Door lock image
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## 🎨 UI Features

### Login Page
- Gradient background (purple)
- Animated background circles
- Frosted glass card (backdrop blur)
- Smooth form inputs
- Demo credentials displayed
- Error message handling
- Loading state on submit button

### Room Cards
- Responsive grid layout
- SVG placeholder images
- Difficulty badges (Easy/Medium/Hard)
- Completion progress bars
- Lock icon overlay
- Requirement text for locked rooms
- Hover effects
- Button states (active/disabled/loading)
- Smooth transitions

### Colors
- **Primary:** Purple (#7c3aed, #6366f1)
- **Success:** Green (#10b981)
- **Warning:** Yellow (#fbbf24)
- **Danger:** Red (#ef4444)
- **Backgrounds:** Gradients with opacity

---

## 📊 Mock Data (Rooms)

```json
[
  {
    "id": "kipas",
    "title": "Kipas Angin Pintar",
    "difficulty": "easy",
    "is_accessible": true,
    "completion_rate": 0.5
  },
  {
    "id": "boardgame",
    "title": "Board Game IoT",
    "difficulty": "medium",
    "is_accessible": true,
    "completion_rate": 0
  },
  {
    "id": "lighting",
    "title": "Smart Lighting System",
    "difficulty": "hard",
    "is_accessible": false,
    "requirement": "Selesaikan Kipas Angin Pintar terlebih dahulu"
  },
  {
    "id": "door",
    "title": "Smart Door Lock",
    "difficulty": "hard",
    "is_accessible": false,
    "requirement": "Selesaikan Board Game IoT terlebih dahulu"
  }
]
```

---

## 🔧 Next Steps (TODO)

1. **Integrate with Django Backend**
   - Update login to call `/api/auth/login` endpoint
   - Fetch rooms from `/api/rooms/` endpoint
   - Implement proper authentication flow

2. **Add Game Simulation**
   - Integrate Phaser 3 game logic into `/simulation/[roomId]`
   - Connect Blockly visual programming
   - Add game state management

3. **Database Integration**
   - Persist user scores
   - Track completion percentage
   - Save user progress

4. **Error Handling**
   - Add error boundaries
   - Toast notifications for user feedback
   - Proper error pages (404, 500)

5. **Animations**
   - Page transitions
   - Loading skeletons
   - Success/error animations

---

## 🛠️ Troubleshooting

### Issue: Can't access /rooms after login
**Solution:** Check localStorage has `session_token`. Open DevTools → Application → localStorage

### Issue: Images not showing
**Solution:** Ensure SVG files are in `public/` folder with correct filenames

### Issue: Tailwind styles not applying
**Solution:** Make sure `npm run dev` is used (not `npm run build`), and wait for Tailwind compilation

### Issue: Redirect loop on /login
**Solution:** Clear localStorage from DevTools, then refresh page

---

## 📱 Responsive Design Testing

- **Mobile** (375px): 1 column grid
- **Tablet** (768px): 2 column grid
- **Desktop** (1024px+): 3 column grid

Test with DevTools device emulation or actual devices!

---

## 🎮 Quick Test Script

```javascript
// Open browser console (F12) at http://localhost:3000 and paste:

// 1. Simulate login
localStorage.setItem('session_token', 'test-token');
window.location.href = '/rooms';

// 2. Check stored data
console.log(localStorage.getItem('session_token'));
console.log(localStorage.getItem('user_data'));

// 3. Clear all data
localStorage.clear();
window.location.href = '/login';
```

---

## 📝 Notes for Future Development

- Current auth uses localStorage (client-side) - will be replaced with server-side sessions
- Room data is mock JSON - will be fetched from Django API
- Simulation page is placeholder - needs Phaser game integration
- Tailwind CSS configured for dark mode support (can be enabled later)

**Last Updated:** Today
**Status:** Frontend UI Complete ✅ | Awaiting Backend Integration ⏳
