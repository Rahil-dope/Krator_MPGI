# KRATOS 2026 — Technical Fest Management Platform
*Complete Documentation & Organizer Handbook*

---

## 1. 📘 PROJECT OVERVIEW

**What is the KRATOS 2026 system?**
KRATOS 2026 is a dynamic, end-to-end event management platform designed specifically for college tech festivals. It bridges the gap between students looking to participate and organizers needing strict control over registrations, payments, and event-day operations.

**Key Features:**
*   **Public Event Catalog:** View dynamic listings across Tech, Gaming, Hardware, and Creative categories.
*   **Registration & Team Management:** Users can register individually, create teams, generate secure team codes, invite members, and officially "lock" their teams.
*   **Payment Verification Workflow:** Teams pay via UPI, upload screenshot proofs to Cloudinary, and enter Transaction IDs for manual organizer approval.
*   **Powerful Admin Portal:** Real-time analytics, expected vs. verified revenue tracking, bulk action processing (Approve/Check-In), and single-click full CSV generation.
*   **Dynamic CMS (Content Management System):** Adjust registration deadlines, update UPI details (including dynamic QR uploads), and edit event rules/venues without requesting developer deployment.

**Tech Stack Summary:**
*   **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4.
*   **Backend API:** Next.js Server API Routes.
*   **Database:** PostgreSQL (Neon) accessed via Prisma ORM v6.
*   **Authentication:** NextAuth.js v5 using Google OAuth.
*   **Storage:** Cloudinary (for image/payment uploads).

**System Architecture:**
The platform leverages a full-stack architecture where the Next.js frontend securely communicates with Next.js Server API routes. These routes validate user sessions securely on the server with NextAuth, interact with the PostgreSQL database via Prisma, and manage cloud asset uploads via Cloudinary.

---

## 2. ⚙️ LOCAL SETUP GUIDE (STEP-BY-STEP)

### A. Prerequisites
Ensure you have the following installed on your machine before starting:
*   **Node.js:** v20.x or newer
*   **Package Manager:** npm (comes with Node) or yarn
*   **Database:** Access to a PostgreSQL instance (e.g., Neon.tech)

### B. Clone Project
Open your terminal and clone the repository:
```bash
git clone <your-github-repo-url>
cd KRATOS
npm install
```

### C. Environment Variables (`.env.local`)
Create `.env.local` and populate it:

```env
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/kratos?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="use_openssl_rand_base64_32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# App Settings
NEXT_PUBLIC_ADMIN_EMAILS="admin@example.com,anotheradmin@example.com"
NEXT_PUBLIC_UPI_ID="kratos2026@sbi"
NEXT_PUBLIC_FEE_PER_PERSON="69"
```

### D. Database Initialization
Run Prisma to push the schema and generate the client:
```bash
npx prisma db push
npx prisma generate
```

### E. Run Locally
Start the development server:
```bash
npm run dev
```
Open `http://localhost:3000`.

---

## 3. 🔥 INTEGRATION SETUP (VERY DETAILED)

### A. Setup PostgreSQL (Neon)
1.  Go to [Neon.tech](https://neon.tech/).
2.  Create a project and copy the standard PostgreSQL connection string.
3.  Paste it as `DATABASE_URL` in `.env.local`.

### B. Setup Google OAuth
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a project and navigate to **APIs & Services > Credentials**.
3.  Create an **OAuth 2.0 Client ID** (Web Application).
4.  Add `http://localhost:3000` to Authorized JavaScript origins.
5.  Add `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs. (For production, add the Vercel URL too).
6.  Copy the Client ID and Secret to your `.env.local`.

### C. Setup Cloudinary
1.  Go to [Cloudinary.com](https://cloudinary.com/) and sign up.
2.  From your Dashboard, copy the Cloud Name, API Key, and API Secret to your `.env.local`.
3.  The app uses these paths automatically: `kratos/payments/` for proofs and `kratos/system/` for UPI QR.

### D. Setup Admin Access
If your Google email matches exactly as defined in `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated), NextAuth will automatically assign you the `admin` role in the database upon your first sign in.

---

## 4. 🧑💼 ADMIN SETUP GUIDE

**Using the Platform (Non-Technical Staff):**
1.  **Access the Dashboard:** Go to `yourwebsite.com/admin` (You must be logged in as an Admin).
2.  **Seed Initial Data:** Upon first load, you can hit the `/api/seed` route or add events manually to populate the database.
3.  **Add Events:** Navigate to `Events` on the sidebar. Click "Add Event". Fill out the form (Prize, Rules, Coordinator details) and click Save. It's instantly live!
4.  **Manage Teams & Verify Payments:**
    *   Navigate to the `Registrations` tab. You will see a list of teams. Click a row to expand it.
    *   Click "View Screenshot" to verify the payment proof against your bank statements.
    *   If valid, click **Approve**. If fraudulent, click **Reject**.
5.  **Use Filters:** Use the dropdowns at the top of the Registrations table to isolate just "Pending" payments or filter by a specific "Event".
6.  **Export CSV:** Click the "Export CSV" button. It will instantly download an Excel-ready spreadsheet.

---

## 5. 🚀 DEPLOYMENT GUIDE (VERCEL)

1.  **Push to GitHub:** Ensure your local repository is updated.
2.  **Connect to Vercel:** Go to [Vercel.com](https://vercel.com/) and create a new project. Link your GitHub account.
3.  **Framework Preset:** Vercel will automatically detect `Next.js`.
4.  **Environment Variables:** Copy every single variable from your `.env.local` file and paste them into Vercel.
5.  **Build Command:** Vercel automatically runs `prisma generate` and `next build`.
6.  **Fixing Auth:** Update your Google Cloud Console OAuth Authorized redirect URIs to include `https://your-vercel-domain.vercel.app/api/auth/callback/google`.

---

## 6. 📊 DATA MANAGEMENT GUIDE (FOR ORGANIZERS)

*This section exists to train non-technical Student Coordinators on event management.*

**1. Viewing Registrations**
Go to `/admin/registrations`. This is your master control room. Every time a student creates or joins a team, it appears here instantly.

**2. Tracking Teams & Payments**
Teams that have reached their limit will "Lock" their group. Once locked, they are asked to pay. 
When reviewing:
*   Yellow Pill = Pending (They paid, review required).
*   Red Pill = Rejected (Image was blurred, incorrect, or fake).
*   Green Pill = Approved.

**3. Event-Day Digital Check-In**
On the day of the event, place a volunteer at the front desk with a laptop.
1.  Ask the student for their **Team Code**.
2.  Find their row, and click **Mark as Checked-In**.
3.  A badge will appear on their team. You can use the "Attendance Dropdown" to filter out everyone who has already arrived!

---

## 7. 🛠 TROUBLESHOOTING SECTION

**Issue: "Authentication fails / Redirect mismatch error"**
*Solution:* Ensure the URI in Google Cloud Console exactly matches `http://localhost:3000/api/auth/callback/google` or your production domain.

**Issue: "PrismaClientValidationError or Database disconnected"**
*Solution:* Ensure `DATABASE_URL` is correct and you have run `npx prisma db push` to generate the correct tables.

**Issue: "Team join fails with 'Team is full'."**
*Solution:* Ensure the team has not reached the `maxTeamSize` configured for that specific event in the `Events` table.

**Issue: "Data isn't loading or infinite spinner."**
*Solution:* Check the browser console. If it's returning 500, check the Vercel / server logs. Ensure your environment variables are set correctly in production.

---

## 8. 📅 EVENT DAY CHECKLIST (VERY IMPORTANT)

**Before Event (T-Minus 48 Hours):**
- [ ] Test User Login flow on a completely fresh incognito browser.
- [ ] Walk through a mock Solo and Team Registration end-to-end.
- [ ] Verify you can successfully Approve a payment in the Admin console.
- [ ] Ensure all Coordinators are familiarized with the Check-In table.
- [ ] Lock registration forms via `/admin/settings` disabling new entries.

**During Event:**
- [ ] Keep a laptop open purely to `/admin/registrations`.
- [ ] Filter by "Approved" payments only, ensuring volunteers don't admit pending members.
- [ ] Use the Search Bar heavily to rapid-find incoming generic student names.
- [ ] Utilize the Bulk Action bottom bar to check-in massive blocks of teams instantly.

**After Event:**
- [ ] Click "Export CSV" and save the master ledger of all attendees for college records.

---

## 9. 📦 FUTURE IMPROVEMENTS

For developers taking over this codebase in 2027:
*   **Payment Gateway Integration:** Drop the manual UPI screenshot workflow and integrate Razorpay or Stripe for automated real-time payment webhook verification.
*   **Automated Emailing:** Implement a server cron job or queue to automatically email users their Team Code upon creation, and notify them when payments verify.
*   **Certificate Generation:** Add a button inside the User Dashboard that dynamically overlays their Name onto a PNG canvas and exports a participation certificate for "Checked-In" users.
