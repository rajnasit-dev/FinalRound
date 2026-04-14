<p align="center">
  <img src="https://img.shields.io/badge/FinalRound-Tournament%20Management-0ea5e9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTYgOWE2IDYgMCAwIDEgMTIgMEE2IDYgMCAwIDEgNiA5Ii8+PHBhdGggZD0iTTEyIDE1YTYgNiAwIDAgMS02IDZBOCA2IDAgMCAxIDEyIDE1WiIvPjwvc3ZnPg==&logoColor=white" alt="FinalRound" />
</p>

<h1 align="center">🏆 FinalRound</h1>

<p align="center">
  <strong>A full-stack sports tournament management platform built with the MERN stack</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-ES%20Modules-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Redux%20Toolkit-2.11-764ABC?style=flat-square&logo=redux&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/REST%20API-100%2B%20Endpoints-success?style=flat-square" />
  <img src="https://img.shields.io/badge/Pages-60%2B%20Routes-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Components-32%2B%20Reusable%20UI-purple?style=flat-square" />
  <img src="https://img.shields.io/badge/Models-14%20Schemas-orange?style=flat-square" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [User Roles & Dashboards](#-user-roles--dashboards)
- [API Endpoints](#-api-endpoints)
- [Database Design](#-database-design)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Contact](#-contact)

---

## 🌟 Overview

**FinalRound** is a production-grade, full-stack web application for managing sports tournaments end-to-end. It connects **Players**, **Team Managers**, **Tournament Organizers**, and **Admins** on a single platform — handling everything from team formation and tournament registration to live match scheduling, payment processing, and PDF receipt generation.

Built as a solo full-stack project, FinalRound demonstrates proficiency in:

- **System Design** — 14 interconnected MongoDB models with discriminator inheritance
- **API Architecture** — 100+ RESTful endpoints with role-based access control
- **Frontend Engineering** — 60+ routes, 32+ reusable components, global state management
- **Security** — JWT auth, bcrypt hashing, OTP email verification, HTTP-only cookies, Helmet headers
- **DevOps** — Vercel-ready deployment, Cloudinary media pipeline, environment-based configuration

---

## ✨ Key Features

### 🏟️ Tournament Management
- Create and manage tournaments with **League** or **Knockout** formats
- Support for both **Team-based** and **Individual** registration types
- Configurable entry fees, prize pools, team limits, and registration windows
- Platform fee system with admin-configurable pricing
- Tournament lifecycle management: `Upcoming → Live → Completed`

### 👥 Team & Player Management
- Full team CRUD with roster management, captain designation, and coaching staff
- Player profiles with sports, roles, achievements, and physical stats
- Join request system — players can request to join teams or managers can invite players
- Team availability toggling (`openToJoin` status)

### 📅 Match Scheduling & Live Tracking
- Create fixtures manually or auto-generate tournament brackets
- Live score updates with Man of the Match selection
- Match status tracking: `Upcoming → Live → Completed → Cancelled`
- Filter matches by tournament, team, or status

### 💳 Payment & Booking System
- Entry fee payment processing with status tracking (`Pending → Success → Failed → Refunded`)
- Booking confirmations tied to payment verification
- **PDF receipt generation** with jsPDF for downloadable payment records
- Revenue analytics in the admin dashboard

### 🔔 Request & Notification System
- Multi-type request handling: Player↔Team, Organizer Authorization, Tournament Booking
- Duplicate request prevention with compound indexes
- Accept/Reject workflows with real-time status updates

### 🛡️ Admin Panel
- Comprehensive dashboard with platform-wide statistics
- Organizer authorization approval workflow
- User, tournament, team, payment, and feedback management
- Sports CRUD — dynamically manage available sports across the platform
- Revenue tracking and payment oversight

### 🎨 UI/UX
- **Dark mode** with localStorage persistence
- **Smooth scrolling** via Lenis library
- **Framer Motion** animations throughout
- Fully **responsive** design — mobile drawer navigation + desktop sidebar
- Toast notifications, modals, and loading states
- 32+ reusable UI components: DataTable, Pagination, FilterDropdown, SearchBar, and more

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework with latest concurrent features |
| **React Router 7** | Client-side routing with nested layouts |
| **Redux Toolkit** | Global state management with 11 feature slices |
| **Tailwind CSS 4** | Utility-first responsive styling |
| **Framer Motion** | Page transitions and micro-interactions |
| **React Hook Form** | Performant form handling with validation |
| **Axios** | HTTP client with interceptors |
| **Lucide React** | Consistent icon system |
| **jsPDF** | Client-side PDF receipt generation |
| **Lenis** | Smooth scroll engine |
| **Vite 7** | Lightning-fast dev server and build tool |

### Backend
| Technology | Purpose |
|---|---|
| **Express 5** | Web framework (latest major with async error handling) |
| **Mongoose 9** | MongoDB ODM with discriminator inheritance |
| **JWT** | Stateless auth with access + refresh token rotation |
| **bcrypt** | Password hashing (12 salt rounds) |
| **Cloudinary** | Cloud media storage for avatars, logos, banners |
| **Multer 2** | Multipart file upload handling |
| **Nodemailer** | Transactional emails (OTP verification, password reset) |
| **Helmet** | HTTP security headers |
| **cookie-parser** | Secure HTTP-only cookie management |

### Infrastructure
| Technology | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud database |
| **Cloudinary** | Media CDN & transformation pipeline |
| **Vercel** | Serverless deployment (client + server) |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                       │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Router   │  │ Redux Store  │  │   32+ UI Components    │ │
│  │ 60+ pages │  │  11 slices   │  │  (DataTable, Modal...) │ │
│  └────┬─────┘  └──────┬───────┘  └────────────────────────┘ │
│       │               │                                      │
│       └───────┬───────┘                                      │
│               │ Axios                                        │
└───────────────┼──────────────────────────────────────────────┘
                │ HTTPS
┌───────────────┼──────────────────────────────────────────────┐
│               ▼          SERVER (Express 5)                  │
│  ┌──────────────────┐  ┌─────────────────┐                  │
│  │   14 Route Files  │  │   Middlewares   │                  │
│  │   100+ Endpoints  │──│  Auth · Multer  │                  │
│  └────────┬─────────┘  │  Email · Error   │                  │
│           │             └─────────────────┘                  │
│  ┌────────▼─────────┐                                        │
│  │  12 Controllers   │                                       │
│  │  Business Logic   │                                       │
│  └────────┬─────────┘                                        │
│           │                                                  │
│  ┌────────▼─────────┐  ┌──────────┐  ┌──────────────┐      │
│  │  14 Mongoose      │  │Cloudinary│  │  Nodemailer  │      │
│  │  Models (ODM)     │──│  (Media) │  │  (Email)     │      │
│  └────────┬─────────┘  └──────────┘  └──────────────┘      │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
    ┌───────▼───────┐
    │  MongoDB Atlas │
    │   (Database)   │
    └───────────────┘
```

---

## 👥 User Roles & Dashboards

FinalRound implements a **role-based multi-dashboard** architecture. Each role has its own dedicated dashboard with tailored navigation:

### 🏃 Player
| Feature | Description |
|---|---|
| Tournament Discovery | Browse and register for tournaments |
| Team Membership | View teams, send join requests |
| Payment History | Track entry fee payments with PDF receipts |
| Profile Management | Edit bio, sports, achievements, avatar |
| Request Center | Manage incoming/outgoing team requests |

### 📋 Team Manager
| Feature | Description |
|---|---|
| Team CRUD | Create teams, upload logos, manage rosters |
| Player Recruitment | Add players, send invitations, manage requests |
| Tournament Enrollment | Register teams for tournaments |
| Payment Tracking | Monitor team-level payments |

### 🎯 Tournament Organizer
| Feature | Description |
|---|---|
| Tournament Creation | Full setup with rules, fees, schedules, banners |
| Platform Fee Payment | Pay configurable platform fee to publish |
| Match Scheduling | Create fixtures, update scores, declare results |
| Team Approvals | Review and approve registered teams/players |
| Authorization | Submit documents for admin verification |

### 🔧 Admin
| Feature | Description |
|---|---|
| Analytics Dashboard | Platform-wide statistics and metrics |
| User Management | View and manage all users across roles |
| Organizer Authorization | Review and approve organizer requests |
| Sports Management | Dynamic CRUD for available sports |
| Revenue & Payments | Financial oversight and tracking |
| Feedback Moderation | Review platform feedback and ratings |

---

## 📡 API Endpoints

The backend exposes **100+ RESTful endpoints** across 14 route groups, all prefixed with `/api/v1/`:

| Route Group | Endpoints | Key Operations |
|---|---|---|
| `/auth` | 12 | Register (3 roles), Login, Logout, OTP verify, Password reset, Token refresh |
| `/users` | 4 | Profile CRUD, Avatar management |
| `/players` | 12 | CRUD, Sports/Achievements, Filter by sport/city |
| `/team-managers` | 9 | Profile, Teams listing, Achievements |
| `/tournament-organizers` | 9 | Profile, Document verification, Authorization |
| `/sports` | 5 | CRUD, Active listing, Search |
| `/teams` | 13 | CRUD, Roster management, Captain, Logo, Search |
| `/tournaments` | 15 | CRUD, Registration, Approval, Platform fee, Status, Search |
| `/matches` | 13 | CRUD, Scores, Results, Status, Live/Upcoming/Completed filters |
| `/payments` | 9 | CRUD, Status tracking, Filtering, Stats |
| `/bookings` | 5 | Create, Read, Update payment status, Cancel |
| `/requests` | 8 | Send, Accept, Reject, Cancel, Filter by type |
| `/feedback` | 9 | CRUD, Ratings, Average calculation |
| `/admin` | 10+ | Dashboard stats, Settings, Revenue, User/Tournament/Team management |

All endpoints follow consistent patterns:
- **Standardized responses** via `ApiResponse` utility
- **Centralized error handling** via `ApiError` + async wrapper
- **Authentication** via JWT middleware on protected routes
- **File uploads** via Multer → Cloudinary pipeline

---

## 🗄️ Database Design

14 MongoDB schemas built with **Mongoose discriminator inheritance** for polymorphic user types:

```
User (Base)
 ├── Player        (sports, achievements, physical stats)
 ├── TeamManager   (teams, achievements)
 ├── TournamentOrganizer (verification, authorization)
 └── Admin         (permissions, login tracking)

Sport ──────────────── Team ──────────────── Tournament
  │                     │                       │
  │    ┌────────────────┘                       │
  │    │                                        │
  │    ▼                                        ▼
  └── Match ◄──────────────────────────── (fixtures)
       │
       ▼
    Payment ──── Booking ──── Request

Feedback ──── Settings (singleton)
```

**Key design decisions:**
- **Discriminator pattern** on User model avoids separate collections while enabling role-specific fields
- **Compound indexes** on Request model prevent duplicate pending requests
- **Singleton pattern** on Settings model for platform-wide configuration
- **Flexible participant references** in Match model support both team-based and individual sports

---

## 🖼️ Screenshots

> Coming soon — screenshots of dashboards, tournament views, match fixtures, and admin panel.

<!-- 
Uncomment and add your screenshots:
![Home Page](screenshots/home.png)
![Tournament Dashboard](screenshots/tournament-dashboard.png)
![Match Fixtures](screenshots/fixtures.png)
![Admin Panel](screenshots/admin.png)
-->

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **MongoDB** (Atlas or local instance)
- **Cloudinary** account (free tier works)
- **SMTP email service** (Gmail, SendGrid, etc.)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/finalround.git
cd finalround

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
```

### Configuration

```bash
# In the server directory, create a .env file
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)
```

### Running Locally

```bash
# Terminal 1 — Start the backend
cd server
npm run dev          # Runs on http://localhost:3000

# Terminal 2 — Start the frontend
cd client
npm run dev          # Runs on http://localhost:5173
```

### Seed the Database (Optional)

```bash
cd server
npm run seed         # Populates sample data for testing
```

---

## 🔐 Environment Variables

### Server (`server/.env`)

```env
# Database
MONGODB_URI=mongodb+srv://your-connection-string
DB_NAME=finalround

# Server
PORT=3000
NODE_ENV=development

# JWT Authentication
ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📁 Project Structure

```
finalround/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # 32+ reusable components
│   │   │   │   ├── DataTable.jsx    # Sortable table with pagination
│   │   │   │   ├── Modal.jsx        # Accessible modal dialogs
│   │   │   │   ├── FilterDropdown.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── TournamentCard.jsx
│   │   │   │   ├── MatchCard.jsx
│   │   │   │   └── ...
│   │   │   ├── Navbar.jsx           # Responsive nav with dark mode
│   │   │   ├── Sidebar.jsx          # Dashboard sidebar navigation
│   │   │   └── Footer.jsx
│   │   ├── config/
│   │   │   └── dashboardLinks.js    # Role-based navigation config
│   │   ├── hooks/                   # Custom hooks (useAge, useMatchStatus...)
│   │   ├── layouts/
│   │   │   ├── RootLayout.jsx       # Public pages layout
│   │   │   ├── DashboardLayout.jsx  # Role dashboards with auth guard
│   │   │   └── AdminLayout.jsx      # Admin panel layout
│   │   ├── pages/
│   │   │   ├── public/              # 11 public pages
│   │   │   ├── auth/                # 6 auth pages
│   │   │   ├── Player/              # 10 player dashboard pages
│   │   │   ├── Manager/             # 11 manager dashboard pages
│   │   │   ├── Organizer/           # 13 organizer dashboard pages
│   │   │   └── admin/               # 9 admin pages
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   └── slices/              # 11 Redux feature slices
│   │   ├── utils/                   # formatINR
│   │   ├── router.jsx               # 60+ route definitions
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── controllers/             # 12 controller files
│   │   ├── models/                  # 14 Mongoose schemas
│   │   ├── routes/                  # 14 route files
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   ├── multer.middleware.js  # File upload handling
│   │   │   └── sendEmail.js         # Transactional email service
│   │   ├── utils/
│   │   │   ├── ApiError.js          # Custom error class
│   │   │   ├── ApiResponse.js       # Standardized response format
│   │   │   ├── asyncHandler.js      # Async error wrapper
│   │   │   └── cloudinary.js        # Media upload service
│   │   ├── app.js                   # Express app configuration
│   │   ├── db.js                    # MongoDB connection (singleton)
│   │   └── index.js                 # Server entry point
│   ├── seed.js                      # Database seeder
│   └── package.json
│
└── README.md                        # You are here
```

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| **Authentication** | JWT access + refresh token rotation with HTTP-only cookies |
| **Password Security** | bcrypt hashing with 12 salt rounds |
| **Email Verification** | Time-limited OTP codes via Nodemailer |
| **Password Reset** | Secure token-based reset flow |
| **HTTP Headers** | Helmet with X-Frame-Options, X-XSS-Protection, Referrer-Policy |
| **Access Control** | Role-based middleware on every protected endpoint |
| **Input Validation** | React Hook Form + server-side Mongoose validation |
| **File Uploads** | Multer size/type restrictions → Cloudinary (no local storage in production) |
| **CORS** | Configurable origin allowlist with credentials support |
| **Error Handling** | Centralized error middleware — no stack traces leaked in production |

---

## 📊 What This Project Demonstrates

| Skill Area | Evidence |
|---|---|
| **Full-Stack Development** | Complete MERN app with 60+ pages, 100+ APIs, 14 data models |
| **System Design** | Multi-role architecture, discriminator inheritance, request/approval workflows |
| **API Design** | RESTful conventions, consistent error handling, pagination-ready endpoints |
| **State Management** | 11 Redux slices with async thunks, optimistic updates, error states |
| **Authentication & Security** | JWT rotation, OTP verification, role-based guards, Helmet headers |
| **Database Modeling** | Complex relationships, compound indexes, singleton patterns, polymorphism |
| **UI Engineering** | 32+ reusable components, responsive layouts, dark mode, animations |
| **Third-Party Integration** | Cloudinary, Nodemailer, jsPDF, smooth scrolling engine |
| **Code Quality** | Modular architecture, DRY principles, consistent naming, separation of concerns |
| **Deployment** | Vercel-ready with serverless export, SPA fallback, environment configuration |

---

## 🤝 Contact

I'm actively looking for **Full-Stack Developer** opportunities. If this project resonates with you, let's connect!

<!-- Update with your actual links -->

- **Portfolio**: [yourportfolio.com](https://yourportfolio.com)
- **LinkedIn**: [linkedin.com/in/raj-nasit](https://www.linkedin.com/in/raj-nasit-a91b8037a)
- **Email**: nasitraj5678@gmail.com
- **GitHub**: [github.com/rajnasitdev](https://github.com/rajnasit-dev)

---

<p align="center">
  <strong>⭐ If you found this project impressive, consider giving it a star!</strong>
</p>

<p align="center">
  Built with ❤️ and a lot of ☕
</p>

