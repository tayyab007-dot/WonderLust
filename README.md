# 🧭 WanderLust — Full-Stack Vacation Rental Marketplace

WanderLust is a robust, production-grade full-stack web application designed following the server-side **MVC (Model-View-Controller)** architecture pattern. Modeled closely after Airbnb, this application enables users to discover, create, manage, and review premium vacation properties globally. It features secure user authentication, cloud-hosted image management, dynamic location geocoding, and interactive real-time mapping.

---

## 🚀 Key Features

*   **Full CRUD Lifecycle:** Seamless capability to create, read, update, and delete property listings with automated server-side data validations.
*   **Secure Authentication & Authorization:** Managed via Passport.js with strong middleware protection ensuring *only* explicit property owners can edit or delete their listings.
*   **Cloud Media Storage & Optimization:** Multi-part binary image uploads streamed via Multer directly to Cloudinary, featuring on-the-fly thumbnail transformation for smooth edit page previews.
*   **Interactive Mapping & Geocoding:** Zero-cost, privacy-first geocoding that dynamically converts text addresses (e.g., "Lahore, Pakistan") into GeoJSON Point coordinates via OpenStreetMap's Nominatim API, rendering interactive maps on the client-side with Leaflet.js.
*   **Airbnb-Style UI/UX & Controls:** A fully responsive Bootstrap 5 interface complete with an overflow-scroll category filter bar with smooth client-side button navigation, dynamic inline tax-display switches, and star-rating review systems.

---

## 🛠️ Tech Stack & Architecture

*   **Backend Engine:** Node.js & Express.js (MVC Pattern)
*   **View Layer:** EJS (Embedded JavaScript Templates)
*   **Database:** MongoDB & Mongoose ODM (GeoJSON spatial schema architecture)
*   **Authentication:** Passport.js (Local Strategy)
*   **Media Pipeline:** Multer & Cloudinary Storage API
*   **Mapping Suite:** Leaflet.js & OpenStreetMap (Nominatim API)
*   **Styling & Icons:** Bootstrap 5, Font Awesome 6, and Starability CSS

---

## 📂 Project Structure

```text
MAJORPROJECT/
├── controllers/     # Core application logic & API behavior
├── models/          # Mongoose relational schemas (Listing, Review, User)
├── routes/          # Express RESTful route mapping definition arrays
├── views/           # EJS presentation layout templates
│   ├── includes/    # Reusable partial components (Navbar, Footer, Flash alerts)
│   ├── layouts/     # Global boilerplate structural wrappers
│   └── listings/    # Template views for index, show, new, and edit states
├── public/          # Static frontend directory resources
│   ├── css/         # Global template stylesheets
│   └── js/          # Client-side execution scripts (map.js, validation handlers)
├── utils/           # Centralized global async wrappers & error-handling modules
├── .env             # Isolated application environment keys (Hidden from Git)
└── app.js           # Server initialization portal configuration
