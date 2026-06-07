# 🚀 REPLIT DEPLOYMENT - FRONTEND + BACKEND

Panduan lengkap untuk deploy Smart Room di 2 Replit Projects terpisah.

---

## 📌 Overview

| Component | Replit Project | URL |
|-----------|---|---|
| **Frontend** (Next.js) | `smartroom-frontend` | `https://smartroom-frontend.replit.dev` |
| **Backend** (Django) | `smartroom-backend` | `https://smartroom-backend.replit.dev` |

---

## ✅ STEP 1: Setup Frontend Replit (Existing Project)

### 1.1 `.replit` Configuration untuk Frontend

Di Replit project Frontend Anda, pastikan file `.replit` berisi:

```
run = "cd backend/frontend && npm run dev"
build = "cd backend/frontend && npm install && npm run build"

[nix]
channel = "stable-23_11"

[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx}"

[env]
NEXT_PUBLIC_API_URL = "https://smartroom-backend.replit.dev"
NODE_ENV = "development"
```

### 1.2 Environment File untuk Frontend

File: `backend/frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
