# RENTWHEELS — Vehicle Rental Web Application

**BCA III Semester — Server-Side Web Development Project**  
**KLE Technological University, Hubballi & Dharwad, Karnataka**

**Project Created By:** FARAZ | SUDARSHAN | ADESH | NANDISH

---

## Project Overview

RENTWHEELS is a clean, full-stack vehicle rental web application designed for Hubballi and Dharwad, Karnataka. It features 18 preloaded Indian vehicles (Cars, Bikes, and Scooters), customer registration and booking management, a protected Admin Dashboard for fleet and booking control, and persistent JSON file storage (`users.json`, `vehicles.json`, `bookings.json`).

## Folder Structure

```
RENTWHEELS/
├── server.js          # Express.js standalone server
├── server.ts          # Full-stack Vite + Express server (port 3000)
├── package.json       # Node.js dependencies and scripts
├── README.md          # Project documentation
├── data/
│   ├── vehicles.json  # 18 preloaded Indian vehicles
│   ├── users.json     # 5 preloaded fictional customers + registered users
│   ├── bookings.json  # 5 sample Hubballi/Dharwad bookings + new bookings
│   └── contacts.json  # Contact Us form submissions
├── routes/
│   ├── createApp.js       # Express app factory
│   ├── jsonStore.js       # Safe JSON read/write utility
│   ├── authMiddleware.js  # Password hashing (scrypt) & Bearer token auth
│   ├── authRoutes.js      # Sign Up, Sign In, Admin Setup & Admin Login
│   ├── vehicleRoutes.js   # Vehicle listing, search & details
│   ├── bookingRoutes.js   # Customer bookings, price calculation & cancellation
│   ├── adminRoutes.js     # Admin CRUD for vehicles, customers & booking status
│   └── contactRoutes.js   # Contact form submission handler
├── public/
│   └── styles.css     # Brand palette CSS variables
└── src/               # Responsive frontend pages & components
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in development mode (port 3000):
   ```bash
   npm run dev
   ```
3. Build and run in production:
   ```bash
   npm run build
   npm start
   ```
