# KRATOS 2026 — Inter-Collegiate Technical Festival

A modern web platform for managing a college tech fest with event registrations, team management, and admin controls.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Vercel

## Quick Start

### 1. Clone & Install

```bash
cd KRATOS
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in method → **Google**
4. Enable **Cloud Firestore** → Create database (production mode)
5. Enable **Storage** → Get started
6. Go to Project Settings → Your apps → Add web app → Copy config

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.example .env.local
```

Update these values:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_EMAILS=your_admin@gmail.com
NEXT_PUBLIC_UPI_ID=your_upi@id
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Admin Access

Add your Google account email to `NEXT_PUBLIC_ADMIN_EMAILS` in `.env.local`. Sign in with that Google account to access `/admin`.

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all env vars from `.env.local`
4. Deploy

## Features

| Feature | Status |
|---------|--------|
| Home page (hero, countdown, about, events preview, team, contact) | ✅ |
| Events listing with category filters | ✅ |
| Schedule (2-day timeline) | ✅ |
| Google Sign-In auth | ✅ |
| Team creation (6-char code) | ✅ |
| Join team by code | ✅ |
| Payment upload (screenshot + txn ID) | ✅ |
| User dashboard | ✅ |
| Admin panel (events CRUD, registrations, payment verification) | ✅ |
| CSV export | ✅ |

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Home
│   ├── events/           # Events listing
│   ├── schedule/         # 2-day schedule
│   ├── register/[id]/    # Registration wizard
│   ├── join-team/        # Join team by code
│   ├── dashboard/        # User dashboard
│   └── admin/            # Admin panel
├── components/
│   ├── home/             # Home page sections
│   └── layout/           # Navbar, Footer
├── contexts/
│   └── AuthContext.tsx    # Firebase auth provider
└── lib/
    ├── firebase.ts       # Firebase init
    ├── firestore.ts      # Firestore CRUD
    ├── types.ts          # TypeScript types
    ├── constants.ts      # Dummy data
    └── utils.ts          # Helpers
```
