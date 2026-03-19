# KRATOS 2026 — Inter-Collegiate Technical Festival

A modern web platform for managing a college tech fest with event registrations, team management, and admin controls.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons
- **Backend API**: Next.js Server Actions & API Routes
- **Database**: PostgreSQL (Neon recommended) via Prisma ORM v6
- **Authentication**: NextAuth.js v5 (Google OAuth)
- **Storage**: Cloudinary (for payment proofs and QR codes)
- **Hosting**: Vercel

## Quick Start

### 1. Clone & Install

```bash
cd KRATOS
npm install
```

### 2. Infrastructure Setup

1. **PostgreSQL Database**:
   - Create a database (e.g., using [Neon.tech](https://neon.tech/)).
   - Get the connection string.
2. **NextAuth**:
   - Generate secure secrets using `openssl rand -base64 32`.
3. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com).
   - Create OAuth 2.0 Client IDs.
   - Set the Authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
4. **Cloudinary**:
   - Create a [Cloudinary](https://cloudinary.com/) account.
   - Get your Cloud Name, API Key, and API Secret.

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your configuration:

```bash
cp .env.example .env.local
```

Update these values in `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/kratos?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your_generated_secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your_generated_secret"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Application Settings
NEXT_PUBLIC_ADMIN_EMAILS="your_admin_account@gmail.com"
NEXT_PUBLIC_UPI_ID="your_upi_id@paytm"
NEXT_PUBLIC_FEE_PER_PERSON=69
```

### 4. Database Initialization

Run Prisma to push the schema and generate the client:

```bash
npx prisma db push
npx prisma generate
```

### 5. Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Admin Access & Mock Data

1. Sign in with the Google account corresponding to the email set in `NEXT_PUBLIC_ADMIN_EMAILS`. 
2. You will automatically receive the `admin` role.
3. Call `POST /api/seed` or use the Admin Panel to seed the initial events and default configuration settings.
4. Access the admin dashboard at `/admin`.

## Deploy to Vercel

1. Push the code to GitHub.
2. Go to [vercel.com](https://vercel.com) → Import project.
3. Add all environment variables from your `.env.local`.
4. Deploy the application (Vercel will automatically run `prisma generate` and `npm run build`).

## Features

| Feature | Status |
|---------|--------|
| Home page (hero, countdown, about, events preview, team, contact) | ✅ |
| Events listing with category filters | ✅ |
| Schedule (2-day timeline) | ✅ |
| Authentication (NextAuth Google OAuth) | ✅ |
| Team creation (6-char code) | ✅ |
| Join team by code | ✅ |
| Payment upload directly to Cloudinary | ✅ |
| User dashboard with ticket status | ✅ |
| Admin panel (events CRUD, registrations, payment verification) | ✅ |
| Secure API Routes with Role-based Access Control | ✅ |

## Project Structure

```text
src/
├── app/
│   ├── api/                  # Next.js API Routes (auth, events, teams, etc.)
│   ├── page.tsx              # Home
│   ├── events/               # Events listing
│   ├── schedule/             # 2-day schedule
│   ├── register/[eventId]/   # Registration wizard
│   ├── join-team/            # Join team by code
│   ├── dashboard/            # User dashboard
│   └── admin/                # Admin panel
├── components/
│   ├── home/                 # Home page sections
│   └── layout/               # Navbar, Footer, ThemeToggle
├── contexts/
│   ├── AuthContext.tsx       # NextAuth wrapper and hooks
│   └── SettingsContext.tsx   # Global settings API fetcher
└── lib/
    ├── auth.ts               # NextAuth v5 Configuration
    ├── prisma.ts             # Prisma Client instance
    ├── cloudinary.ts         # Cloudinary upload utilities
    ├── types.ts              # TypeScript models and schemas
    ├── constants.ts          # Dummy data definitions
    └── utils.ts              # Helpers (Tailwind class merging, etc.)
```

## Scripts

| Command   | Description                    |
|-----------|--------------------------------|
| `npm run dev`  | Start development server       |
| `npm run build`| Production Next.js build       |
| `npm run start`| Start production server        |
| `npx prisma...`| Run database migrations/schema updates |
