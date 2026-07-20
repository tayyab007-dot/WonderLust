# WanderLust — Full-Stack Vacation Rental Marketplace

An advanced, production-ready Web2 accommodation booking platform modeled after modern vacation rental architectures. Developed as a final-year Bachelor of Science in Computer Science thesis project, this system implements secure third-party financial handshakes, dual-channel automated transactional notification pipelines, defensive server-side data validations, and strict access authorization routing.

---

## 🚀 Key System Features & Implementations

### 💳 1. Secure Financial Gateway & Interceptor Pipeline (Stripe API)
* **Token Handshake Engine:** Seamless integration with Stripe Checkout Session APIs, scaling server-side numeric currency normalization (converting fiat units to minor cent denominators) using isolated `.env` keys.
* **Idempotent Re-Processing Guard:** Implements the Post-Redirect-Get (PRG) pattern in the dashboard router. This prevents duplicate transaction parsing, duplicate data writes, and email floods on browser refreshes or back-forward navigation actions.
* **Privacy Ownership Enforcement:** Strict security evaluation checks that cross-reference active session IDs against Mongoose schema references, ensuring only the authenticated user who initiated the booking can trigger a payment verification update.

### 📧 2. Automated Transactional Notification System (Nodemailer SMTP)
* **Dual-Channel Routing:** Automatically orchestrates simultaneous HTML data dispatches upon verified payments.
  * **Guest Delivery:** Transmits a clean, responsive HTML invoice and reservation summary directly to the client's inbox.
  * **Host Notification:** Uses nested object population paths (`path: "listing", populate: { path: "owner" }`) to uncover the property creator's profile data and route an immediate earnings notification alert.
* **Secure SMTP Relay:** Configured securely alongside Google's global mail distribution nodes via dedicated, cryptographically isolated 16-character Account App Passwords.

### 🛡️ 3. Defensive Programming & Data Sanity Layer
* **Date-Range Intersection Overlap Logic:** Native protection against multi-user double-bookings using non-overlapping evaluation queries ($startDate < newEnd \text{ AND } endDate > newStart$) across active "Pending" or "Paid" reservations.
* **Retroactive & Chronological Guards:** Automatic validation filtering that blocks past/historical reservation attempts, enforces positive-integer stay durations, and flags malformed data parameters (`NaN` inputs).
* **Joi Payload Enforcement:** Explicit object validation schemas restricting text payload boundaries (preventing database bloat attacks), establishing positive price ceilings, and validating standard URI strings.
* **Object Existence Assertions:** Null-pointer middleware protections that intercept malformed or non-existent MongoDB ObjectIds before runtime reference execution crashes the Node.js process.

---

## 🛠️ Tech Stack & Architecture

* **Backend Environment:** Node.js, Express.js
* **Database Layer:** MongoDB Atlas (Mongoose ODM)
* **View Layer:** Embedded JavaScript (EJS Templates), Bootstrap 5
* **Security & Authentication:** Passport.js (Local Strategy), Joi Schema Validators
* **Media Handling:** Multer, Cloudinary API Storage
* **Payment Processing:** Stripe Node SDK Engine
* **Communication:** Nodemailer SMTP Transport Relay

---

## 📂 Architecture Workspace Tree

```text
MAJORPROJECT/
├── controllers/
│   ├── bookings.js      # Handles price compiling, past-date guards, and overlap filters
│   ├── dashboards.js    # Intercepts Stripe return signatures, triggers PRG, handles mail triggers
│   └── listings.js      # Fuzzy search index algorithms and multi-image uploads
├── models/
│   ├── booking.js       # Core reservation schema utilizing compound performance indices
│   ├── listing.js       # Property catalog schema with embedded location geometries
│   └── user.js          # Authentication profiles managed via Passport-Local-Mongoose
├── routes/
│   ├── payment.js       # Initializes external Stripe checkout session configurations
│   └── user.js          # Handles system signups, logins, and session lifecycles
├── utlls/
│   ├── email.js         # Configures Gmail SMTP transport channels and HTML layouts
│   └── ExpressError.js  # Global application HTTP error handler classes
├── middleware.js        # Holds administrative ownership checks and Joi payload execution blocks
├── schema.js            # Master data definition constraints for listings and reviews
├── .env                 # Encrypted environment configurations (API keys, credentials)
└── app.js               # Application core mounting middleware pipelines
