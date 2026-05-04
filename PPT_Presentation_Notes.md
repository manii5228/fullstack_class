# Presentation Notes — Fullstack Class (EventBook + Repo Overview)

Purpose: a single-file, PPT-ready brief that explains methodology, unique features, architecture, UI (colors/typography), file locations, key endpoints, and suggested slide structure to build a deck quickly.

--

**Project Summary**
- **Main app (EventBook):** a full-featured event discovery and booking system implemented under [project2](project2/) with a React frontend and Node/Express backend backed by MySQL.
- Other contained projects: `project` (real-time features + sockets), `lab_task` (class exercises / Maven projects), `login` (simple login demo), `reactjs/my-app` (React demo).

**One-line tech stack**
- Frontend: React (create-react-app), React Router, react-chartjs-2, axios, react-toastify.
- Backend: Node.js + Express, JWT auth, multer for uploads, nodemailer for emails, MySQL (mysql2/promise), bcrypt for password hashing.

**Architecture & Methodology (Technical)**
- Layered, component-driven architecture:
  - Presentation: React SPA (`project2/frontend/src`) with route guards and services.
  - API layer: Express routes (`project2/backend/routes/*`) grouped by domain (auth, events, bookings, analytics, profile).
  - Persistence: MySQL connection pool (`project2/backend/db/connection.js`) and transactional operations for booking flow.
  - Integrations: File storage in `uploads/` (posters, profiles), Email via Nodemailer, optional real-time via Socket.IO in other project.
- API design: RESTful endpoints, role-based guards (`authenticateUser`, `authenticateAdmin`), and protection via JWT tokens.
- Data consistency: booking process uses DB transactions and row-level locking (SELECT ... FOR UPDATE) to avoid overselling.

**Unique / Notable Features (different from simple demo projects)**
- Waitlist workflow with admin conversion to bookings.
- Atomic booking with transaction semantics and conflict detection (time-conflict checks, duplicate booking prevention).
- Event analytics with derived metric `engagement_score` and admin dashboard endpoints (`/api/analytics/*`).
- Admin utilities: clone event, bulk-upload events (CSV/JSON), poster/profile upload handling.
- Confirmation emails on booking with an HTML template (nodemailer).

**UI / Design system**
- Design tokens and palette live in [project2/frontend/src/index.css](project2/frontend/src/index.css).
- Key color tokens (hex):
  - --bg-primary: #F9F5EC
  - --bg-secondary: #FFFFFF
  - --c-yellow: #FAC046
  - --c-blue: #2A8FF7
  - --c-pink: #F596C5
  - --c-maroon: #3C0908
  - --c-orange: #F25F2E
  - --c-lime: #BBE138
  - --c-sand: #FCEFD5
  - --text-dark: #1A1A1A
  - --text-light: #FFFFFF
- Fonts: `Inter`, `Bricolage Grotesque`, `Poppins` (referenced in `index.css` and component CSS).
- Layout: a responsive 12-column "Solid Bento" grid system and rounded card primitives (see `.solid-bento-grid` and `.card` styles).

**Key files & where to find them**
- Backend (EventBook):
  - [project2/backend/server.js](project2/backend/server.js)
  - [project2/backend/.env](project2/backend/.env)
  - [project2/backend/db/connection.js](project2/backend/db/connection.js)
  - Routes: [project2/backend/routes/auth.js](project2/backend/routes/auth.js), [project2/backend/routes/events.js](project2/backend/routes/events.js), [project2/backend/routes/bookings.js](project2/backend/routes/bookings.js), [project2/backend/routes/analytics.js](project2/backend/routes/analytics.js), [project2/backend/routes/profile.js](project2/backend/routes/profile.js)
  - Uploads folder: [project2/backend/uploads](project2/backend/uploads)
- Frontend (EventBook):
  - Entry: [project2/frontend/src/index.js](project2/frontend/src/index.js)
  - App and routes: [project2/frontend/src/App.js](project2/frontend/src/App.js)
  - Theme tokens & base styles: [project2/frontend/src/index.css](project2/frontend/src/index.css)
  - Components: [project2/frontend/src/components](project2/frontend/src/components)
  - Pages: [project2/frontend/src/pages](project2/frontend/src/pages)
  - Services (API wrappers): [project2/frontend/src/services](project2/frontend/src/services)
  - Public assets: [project2/frontend/public/images](project2/frontend/public/images)

**Primary API endpoints (summary)**
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/admin/login`
- Events: `GET /api/events` (filters), `GET /api/events/:id`, `POST /api/events` (admin + poster upload), `PUT /api/events/:id`, `DELETE /api/events/:id`, `POST /api/events/:id/clone`, `POST /api/events/bulk-upload`
- Bookings: `POST /api/bookings` (transactional), `GET /api/bookings/my-bookings`, `GET /api/bookings/admin/all`, `PATCH /api/bookings/:id/cancel`, `POST /api/bookings/waitlist`, `GET /api/bookings/waitlist/:event_id`, `POST /api/bookings/waitlist/:waitlist_id/convert`
- Analytics: `GET /api/analytics/dashboard`, `GET /api/analytics/events`, `GET /api/analytics/events/:id`
- Profile: `GET /api/profile`, `PUT /api/profile`, `POST /api/profile/picture`

**Database & data model (inferred)**
- Main tables referenced in code: `users`, `admins`, `events`, `bookings`, `event_analytics`, `waitlist`.
- Notable columns: `events.available_tickets`, `event_analytics.views|bookings|engagement_score`, `bookings.total_price|status`.

**How to run locally (quick)**
1. Start backend (EventBook):

```bash
cd project2/backend
npm install
# create/update .env (sample at project2/backend/.env). Ensure DB is available and credentials match.
npm run dev   # or `npm start` for production
```

2. Start frontend (development):

```bash
cd project2/frontend
npm install
npm start
```

Notes: the frontend `services/api.js` expects the API at `http://localhost:5000/api` by default (see `project2/backend/.env` where `PORT=5000`).

**Screenshots / assets to include in PPT**
- Use the production `build` index and static files for high-quality screenshots: [project2/frontend/build/index.html](project2/frontend/build/index.html) and `project2/frontend/public/images/*`.

**Slide-by-slide suggestion (15 slides, ready-to-copy)**
1. Title: Project name, authors, date
2. Elevator pitch: 1–2 sentence description + demo link
3. Tech stack: list frontend, backend, DB, infra
4. Architecture diagram: client ↔ API ↔ DB + uploads + email + optional sockets
5. User flows (2 slides): register → browse → book (screenshots)
6. Booking internals: transactional flow, locks, waitlist
7. Unique features: analytics, bulk-upload, clone, waitlist
8. Security & best practices: JWT, bcrypt, env secrets
9. UI & design tokens: palette, fonts, grid (include color swatches)
10. API & data model: main endpoints + tables
11. Dev & run instructions: commands and .env notes
12. Assets & demos: where to find images and built app
13. Metrics & analytics: what the backend tracks and charts to show
14. Limitations & future work: suggested improvements
15. Q&A / Contact

**Suggested screenshots / copy for slides**
- Homepage (`project2/frontend/src/pages/Home.jsx`) and Events listing (`EventsPage.jsx`) — use full-page build screenshots.
- Booking confirmation email: capture HTML template from `project2/backend/routes/bookings.js`.
- Admin dashboard charts: use endpoints under `/api/analytics` to capture figures.

**Next steps I can help with**
- Generate a PowerPoint `pptx` from these notes automatically (I can create slides with titles+bullets and embed images). Reply "Create PPT" to proceed.
- Capture live screenshots by running the app locally (I can run a short script or give exact steps).

--

File created: [PPT_Presentation_Notes.md](PPT_Presentation_Notes.md)
