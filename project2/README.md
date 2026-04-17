# 🎪 EventBook — BentoGrid Event Booking System

A modern, full-stack college event booking platform with Bento Grid UI, Admin Intelligence Dashboard, and rich analytics.

## 🛠️ Tech Stack
- **Frontend:** React JS + Custom CSS (Bento Grid Design)
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Auth:** JWT
- **Charts:** Chart.js + react-chartjs-2

## 🚀 Getting Started

### 1. Database Setup (MySQL Workbench)
```sql
-- Run the schema file in MySQL Workbench:
-- File: backend/db/schema.sql
```

### 2. Start the App
The frontend has been built into the backend. You only need to run one command:
```bash
cd backend
npm start   # Runs the compiled full stack app on port 5000
```
Open `http://localhost:5000` in your browser.

## 🔐 Default Credentials

| Role  | Email                      | Password  |
|-------|---------------------------|-----------|
| Admin | admin@eventbooking.com    | admin123  |

## 📂 Project Structure
```
project2/
├── backend/
│   ├── db/
│   │   ├── schema.sql          # Full MySQL schema + seed data
│   │   └── connection.js       # MySQL pool connection
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── routes/
│   │   ├── auth.js             # Login / Register
│   │   ├── events.js           # CRUD + clone + bulk upload
│   │   ├── bookings.js         # Book + waitlist + cancel
│   │   └── analytics.js        # Dashboard analytics
│   ├── uploads/                # Event poster images
│   ├── .env                    # Environment config
│   └── server.js               # Express entry point
│
└── frontend/src/
    ├── components/
    │   ├── Navbar.jsx          # Sticky navbar with auth
    │   ├── EventCard.jsx       # Category-coded event cards
    │   ├── EventModal.jsx      # Create/Edit modal
    │   ├── CapacityIndicator.jsx  # Color-coded capacity bar
    │   └── SearchBar.jsx       # Search + filter panel
    ├── pages/
    │   ├── Home.jsx            # Landing with hero + event grid
    │   ├── EventDetailsPage.jsx  # Detailed event view
    │   ├── BookingPage.jsx     # Booking flow + receipt
    │   ├── BookingHistory.jsx  # User booking history
    │   ├── UserDashboard.jsx   # Bento grid user dashboard
    │   ├── AdminDashboard.jsx  # Analytics + charts
    │   ├── ManageEvents.jsx    # Admin event management
    │   ├── LoginPage.jsx       # User/Admin login
    │   └── RegisterPage.jsx    # User registration
    └── services/
        ├── api.js              # Axios instance + interceptors
        ├── eventService.js     # Event API calls
        ├── bookingService.js   # Booking API calls
        └── authService.js      # Auth + token management
```

## ✨ Features
- 🎨 Bento Grid UI with category-coded event cards
- 🔍 Search & filter events (category, department, date, price, sort)
- 🎫 Full booking flow with conflict detection
- 📋 Waitlist management
- 👁️ Real-time engagement scoring
- 📊 Admin analytics with Chart.js charts
- 🗂️ CRUD + clone + archive events
- 📧 Email confirmation after booking
- 🔐 JWT authentication (user + admin)
- 📱 Responsive design
