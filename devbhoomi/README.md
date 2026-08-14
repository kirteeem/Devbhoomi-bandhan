# 🌺 Devbhoomi Bandhan — Full Stack MERN Matrimonial Platform

A production-ready starter for a premium, bilingual (Hindi/English) matrimonial platform for Himachal Pradesh.

## What's included

**Backend** (`/backend`) — Node.js + Express + MongoDB (Mongoose)
- JWT auth with refresh tokens, OTP login, Google login endpoint
- Role-based access control (user / priest / admin)
- Mongoose schemas: User, Profile, Match, Interest, Chat, Message, Notification, Priest, KundaliRequest, KundaliReport, Testimonial, AdminLog
- REST APIs: auth, profile (incremental updates + completion %), match search & suggestions (filters + pagination), interests, chat, kundali requests, priest dashboard, admin panel, notifications, testimonials, Cloudinary photo upload
- Socket.io for real-time messages/notifications
- Security: helmet, cors, rate limiting, mongo-sanitize, bcrypt password hashing
- Seed script for the demo priest account (Pandit Jagat Ram Sharma)

**Frontend** (`/frontend`) — React 19 + TypeScript + Vite + Tailwind CSS
- Exact design tokens from the brief (colors, fonts) wired into `tailwind.config.ts`
- react-i18next bilingual support with `/locales/en` and `/locales/hi` — language switcher in the navbar, no page reload
- TanStack Query for data fetching/caching (incl. infinite scroll on Browse Matches)
- React Hook Form + Zod validation on auth forms
- Framer Motion for hero/section animations
- Axios client with automatic access-token refresh on 401
- Pages: Home, Login, Signup, Dashboard, Browse Matches (smart filters), Profile Detail, Free Kundali, 404
- Protected routes via `AuthContext`

## Getting started

### 1. Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT secrets, Cloudinary keys
npm install
npm run seed               # creates the demo priest account
npm run dev                 # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```

## What's scaffolded vs. what to extend next

This gives you a real, running full-stack skeleton with working auth, profiles, search, interests, chat, and the free-kundali flow — not placeholders. To take it further:

- **Priest & Admin dashboards**: backend APIs are complete (`/api/priest/*`, `/api/admin/*`); build out the matching React pages the same way the user-facing pages are built.
- **Photo gallery UI** on the profile page (upload endpoint already works via `/api/upload/photo`).
- **Chat UI**: `/api/chats` + Socket.io events (`message:new`, `notification:new`) are ready; wire up a chat window component.
- **Google OAuth**: backend endpoint expects a verified `id_token` payload — add `@react-oauth/google` on the frontend and verify the token server-side with `google-auth-library` before trusting it.
- **Real OTP provider**: swap the stub in `backend/src/utils/otp.js` for MSG91/Twilio Verify.
- **More locale strings**: as you build more pages, keep adding keys to both `locales/en/common.json` and `locales/hi/common.json`.

## Design tokens (from the brief)

| Token | Hex |
|---|---|
| Background | `#FCFBF8` |
| Cream | `#FFF8F0` |
| Maroon | `#7A1E3A` |
| Forest Green | `#305943` |
| Gold | `#D4AF37` |
| Text | `#1B1B1B` |

Fonts: Manrope / Plus Jakarta Sans (English), Noto Sans Devanagari (Hindi).
