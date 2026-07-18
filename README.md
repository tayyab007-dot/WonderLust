# 🧭 WanderLust — Full-Stack Vacation Rental Marketplace

WanderLust is a production-ready, full-stack web application built following the classic server-side **MVC (Model-View-Controller)** design pattern. Inspired by Airbnb, the platform allows users to explore, create, and manage premium property listings, submit dynamic star-rated reviews, and view geographic locations using fully open-source interactive mapping systems.

---

## 🚀 Core Technical Features

### 🛠️ Backend Architecture & Restful Routing
* **MVC Pattern Separation:** Developed using **Node.js** and **Express**, isolating application logic into modular controllers, Mongoose schemas, and clean RESTful route mappings.
* **Authentication & Role-Based Authorization:** Powered by **Passport.js** (`passport-local`). Secure route-protection middlewares ensure that while any visitor can browse properties, only the explicit **authenticated owner** of a listing holds the rights to update or delete it.
* **Asynchronous Error Handling & Validation:** Built with a centralized asynchronous error wrapper (`wrapAsync`) and custom **Joi** schema validation layers to catch malformed inputs before they hit the database.

### 🗺️ Free Geocoding & Interactive Maps (No Credit Card Required)
* **On-the-Fly Geocoding:** Leverages asynchronous backend connections to OpenStreetMap's **Nominatim API** to convert plain text location inputs (e.g., *"Lahore, Pakistan"*) into precise **GeoJSON Point coordinates** (`[longitude, latitude]`) instantly on listing creation.
* **Leaflet.js Mapping Infrastructure:** Visualizes property pins dynamically on the listing details page using **Leaflet.js** and OpenStreetMap tile layers. Coordinates are securely injected via DOM data-attributes to prevent cross-site scripting (XSS) hazards.

### 🖼️ Cloud Media Pipeline & UI Optimization
* **Cloudinary Cloud Hosting:** Uploads binary multipart form streams via **Multer** directly to **Cloudinary** cloud infrastructure.
* **On-the-Fly Bandwidth Compression:** Utilizes Cloudinary's Transformation API to dynamically fetch optimized $250\text{px}$ low-resolution thumbnail previews on edit layouts, slashing page load times.

### 🎨 Polished Airbnb-Style Frontend Experience
* **Responsive Category Filtering Slider:** Features a horizontal overflow icon slider bar configured with smooth CSS transitions, Font Awesome vectors, and a client-side JavaScript chevron-arrow button engine.
* **Dynamic Tax Switch Input:** Includes an interactive, responsive toggle button that directly manipulates DOM visibility parameters to dynamically overlay tax breakdowns (+18% GST) inline without a full page refresh.

---

## 📂 Tech Stack

* **Backend Engine:** Node.js, Express.js
* **Database Cluster:** MongoDB Atlas, Mongoose ODM
* **Session Strategy:** Express-Session, Mongo Session Store (`connect-mongo`)
* **Templates & View Presentation:** Embedded JavaScript (EJS), Bootstrap 5, Font Awesome
* **Mapping Framework:** Leaflet.js, OpenStreetMap API, Nominatim Geocoder
* **Media Handling:** Multer, Cloudinary API
* **Form Validation:** Joi (Object schema validation)

---

## ⚙️ Local Installation & Setup

Follow these steps to run the project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/WanderLust.git](https://github.com/your-username/WanderLust.git)
   cd WanderLust
