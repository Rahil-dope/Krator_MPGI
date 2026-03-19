# KRATOS 2026 — Technical Fest Management Platform
*Complete Documentation & Organizer Handbook*

---

## 1. 📘 PROJECT OVERVIEW

**What is the KRATOS 2026 system?**
KRATOS 2026 is a dynamic, end-to-end event management platform designed specifically for college tech festivals. It bridges the gap between students looking to participate and organizers needing strict control over registrations, payments, and event-day operations.

**Key Features:**
*   **Public Event Catalog:** View dynamic listings across Tech, Gaming, Hardware, and Creative categories.
*   **Registration & Team Management:** Users can register individually, create teams, generate secure team codes, invite members, and officially "lock" their teams.
*   **Payment Verification Workflow:** Teams pay via UPI, upload screenshot proofs, and enter Transaction IDs for manual organizer approval.
*   **Powerful Admin Portal:** Real-time analytics, expected vs. verified revenue tracking, bulk action processing (Approve/Check-In), and single-click full CSV generation.
*   **Dynamic CMS (Content Management System):** Adjust registration deadlines, update UPI details (including dynamic QR uploads), and edit event rules/venues without requesting developer deployment.

**Tech Stack Summary:**
*   **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, next/font, next/image, Lucide Icons, next-themes, react-hot-toast.
*   **Backend (BaaS):** Firebase (Auth, Firestore, Storage).
*   **Hosting:** Vercel.

**System Architecture:**
The platform leverages a serverless architecture where the Next.js frontend securely communicates directly with Firebase services. Global states (Authentication, Site Settings) are handled via optimized React Context Providers. No custom backend servers or databases need to be maintained.

---

## 2. ⚙️ LOCAL SETUP GUIDE (STEP-BY-STEP)

### A. Prerequisites
Ensure you have the following installed on your machine before starting:
*   **Node.js:** v18.x or newer
*   **Package Manager:** npm (comes with Node) or yarn
*   **Git:** Version control system

### B. Clone Project
Open your terminal and clone the repository:
```bash
git clone <your-github-repo-url>
cd KRATOS
```

### C. Install Dependencies
Install all the required packages to run the application:
```bash
npm install
```

### D. Environment Variables (`.env.local`)
Create a file named `.env.local` in the root of your project folder. You will need to populate the following variables obtained from your Firebase Console (See Section 3 for where to find these):

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key_here"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
NEXT_PUBLIC_ADMIN_EMAILS="admin@example.com"
NEXT_PUBLIC_UPI_ID="yourupi@paytm"
NEXT_PUBLIC_FEE_PER_PERSON="69"
```
*Note: Because this architecture calls Firebase from the client-side, these variables MUST begin with `NEXT_PUBLIC_`.*

### E. Run Locally
Start the development server:
```bash
npm run dev
```
**Expected Output:** The terminal will show `Ready in <time> ms`. Open `http://localhost:3000` in your browser. You should see the KRATOS 2026 homepage.

---

## 3. 🔥 FIREBASE SETUP (VERY DETAILED)

### A. Create Firebase Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add Project**.
3.  Name it `kratos-2026` (or similar). Turn off Google Analytics (optional). Click **Create Project**.
4.  Once created, click the **Web icon (`</>`)** to add a web app to the project. Follow the steps, and Firebase will provide the configuration variables needed for your `.env.local` file.

### B. Enable Authentication
1.  Navigate to **Build > Authentication > Sign-in method**.
2.  Click **Add new provider** and select **Google**.
3.  Enable it, select a support email, and hit **Save**.
4.  Navigate to the **Settings > Authorized domains** tab in Authentication.
5.  Ensure `localhost` is listed. Note: Once you deploy to Vercel, you must return here to add your verified Vercel domain (e.g., `kratos2026.vercel.app`).

### C. Setup Firestore
1.  Navigate to **Build > Firestore Database**.
2.  Click **Create database**.
3.  Start in **Production mode** (we will set custom rules later). Choose a location geographically close to your target audience (e.g., `asia-south1`).
4.  **Create the following root collections:**
    *   `users` - Stores logged-in user profiles.
    *   `events` - Stores the core event information.
    *   `teams` - Stores team registrations and payment stats.
    *   `registrations` - Links users to teams for event sign-ups.
    *   `settings` - Stores global platform limits and UI toggles.

### D. Firestore Structure Examples
**`settings` collection (Requires exactly ONE document with ID `global`)**
```json
{
  "registrationOpen": true,
  "upiId": "kratos2026@sbi",
  "upiQR": "https://firebasestorage.googleapis.com/.../qr.png",
  "registrationDeadline": "April 8, 2026"
}
```

**`events` collection**
```json
{
  "name": "Robo Wars",
  "category": "hardware",
  "minTeamSize": 2,
  "maxTeamSize": 4,
  "feePerPerson": 100,
  "prize": "₹50,000",
  "venue": "Main Arena",
  "isActive": true
}
```

**`teams` collection**
```json
{
  "teamName": "Byte Brawlers",
  "teamCode": "XJ9PLQ",
  "eventId": "event_document_id",
  "leaderId": "user_uid_here",
  "paymentStatus": "pending", 
  "isLocked": true,
  "checkedIn": false,
  "members": [
    { "name": "John", "phone": "9876543210", ... }
  ]
}
```

### E. Setup Firebase Storage
1.  Navigate to **Build > Storage** and click **Get started**.
2.  Start in strict mode and choose the identical location to your Firestore database.
3.  The app uses these paths automatically:
    *   `/payments/{teamId}/` — payment proof screenshots
    *   `/settings/upiQR` — UPI QR code (uploaded via Admin Settings)

### F. Firebase Security Rules
To ensure bad actors cannot manipulate payment statuses or overwrite other users' data, use the following rules.

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /payments/{teamId}/{fileName} {
      allow read: if request.auth != null; // Everyone logged in can read
      allow create: if request.auth != null; // Anyone can upload their proof
      allow update, delete: if false; // Uploads are permanent to avoid tampering
    }
    match /settings/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // UPI QR uploads from Admin Settings
    }
  }
}
```

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own user docs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read events, no one can write (update via code/admin console later)
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null; // Restrict this to true admins in production
    }

    // Teams: Auth users can read, leader can update
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null; 
    }

    // Registrations: Auth users can create and read their own
    match /registrations/{regId} {
      allow read, create: if request.auth != null;
      allow update, delete: if false;
    }
    
    // Settings: Global read
    match /settings/global {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
*(Note: For strict production environments, it's highly recommended to utilize Custom Claims or strict User Roles mapped in Firestore to lock `write` permissions for the `settings`, `events`, and `teams.paymentStatus` solely to verified Admins.)*

---

## 4. 🧑💼 ADMIN SETUP GUIDE

**How to make someone an Admin:**
Admin access is controlled via `NEXT_PUBLIC_ADMIN_EMAILS` in `.env.local` (comma-separated list of Google account emails). Add your email to this variable and sign in with that Google account to access `/admin`.

**Using the Platform (Non-Technical Staff):**
1.  **Access the Dashboard:** Go to `yourwebsite.com/admin`. 
2.  **Add Events:** Navigate to `Events` on the sidebar. Click "Add Event". Fill out the form (Prize, Rules, Coordinator details) and click Save. It's instantly live!
3.  **Manage Teams & Verify Payments:**
    *   Navigate to the `Registrations` tab.
    *   You will see a list of teams. Click a row to expand it.
    *   Click "View Screenshot" to verify the payment proof. 
    *   If valid, click **Approve**. If fraudulent, click **Reject**.
4.  **Use Filters:** Use the dropdowns at the top of the Registrations table to isolate just "Pending" payments or filter by a specific "Event".
5.  **Export CSV:** Click the "Export CSV" button. It will instantly download an Excel-ready spreadsheet of exactly what you are currently filtering on the screen!

---

## 5. 🚀 DEPLOYMENT GUIDE (VERCEL)

### Step-by-Step Deployment
1.  **Push to GitHub:** Ensure your local repository is pushed to a GitHub repository.
2.  **Connect to Vercel:** Go to [Vercel.com](https://vercel.com/) and create a new project. Link your GitHub account and select your KRATOS 2026 repository.
3.  **Framework Preset:** Vercel will automatically detect `Next.js`. Leave the build settings as default.
4.  **Environment Variables:** 
    *   Stop before clicking Deploy! Open the **Environment Variables** tab.
    *   Copy every single variable from your `.env.local` file and paste them here exactly.
5.  **Deploy:** Click Deploy. Wait ~2 minutes for the build to finish.
6.  **Fixing Auth:** 
    *   Copy the new `something.vercel.app` domain Vercel provides you.
    *   Go to **Firebase Console > Authentication > Settings > Authorized domains**.
    *   Click **Add domain** and paste the Vercel URL. If you skip this, users won't be able to log in!

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
*   Ask the student for their **Team Code** (or search their name/phone number in the search bar).
*   Find their row, and click **Mark as Checked-In**.
*   A purple badge will appear on their team. You can use the "Attendance Dropdown" to filter out everyone who has already arrived!

---

## 7. 🛠 TROUBLESHOOTING SECTION

**Issue: "Login with Google does nothing or gets stuck."**
*Solution:* Ensure the domain you are visiting is listed inside Firebase Authentication's "Authorized Domains". Third-party cookies must not be blocked by the browser.

**Issue: "Team join fails with 'Team is full'."**
*Solution:* Ensure the team has not reached the `maxTeamSize` configured for that specific event in the `Events` database.

**Issue: "Payment upload refuses to work."**
*Solution:* Ensure Firebase Storage rules are updated to allow `request.auth != null`. Verify the filename doesn't contain breaking trailing characters.

**Issue: "Firebase permission denied error in red."**
*Solution:* Your Firestore Security Rules are blocking access. Temporarily switch them to test mode (`allow read, write: if true;`) to verify if rules are the specific culprit, then fix the conditional logic.

**Issue: "Data isn't loading or infinite spinner."**
*Solution:* Your environment variables in `.env.local` or Vercel are missing, misnamed, or pointing to a deleted Firebase project.

---

## 8. 🔐 SECURITY BEST PRACTICES

1.  **Never expose Admin Access:** Implement a strict whitelist backend rule for who is allowed to load the `/admin` routes.
2.  **Secure the Database:** Never leave Firestore Rules on Test Mode during the live registration period.
3.  **Read-Only Operations:** Ensure users can only UPDATE their own team document if `isLocked` is false, and cannot modify the `paymentStatus` field via client-side code directly unless tightly guarded.
4.  **Data Backups:** Export your Firestore database 24 hours prior to the festival logic as a fail-safe against accidental deletion.

---

## 9. 📅 EVENT DAY CHECKLIST (VERY IMPORTANT)

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
- [ ] Downgrade Firebase project billing (if using Blaze) or archive the project.

---

## 10. 📦 FUTURE IMPROVEMENTS

For developers taking over this codebase in 2027:
*   **Payment Gateway Integration:** Drop the manual UPI screenshot workflow and integrate Razorpay or Stripe for automated real-time payment webhook verification.
*   **Automated Emailing:** Implement Firebase Extensions (Trigger Email) to automatically email users their Team Code upon creation, and notify them when payments verify.
*   **Certificate Generation:** Add a button inside the User Dashboard that dynamically overlays their Name onto a PNG canvas and exports a participation certificate for "Checked-In" users.
*   **Mobile App Wrapper:** Leverage React Native to wrap the views into a standard college fest app format.
