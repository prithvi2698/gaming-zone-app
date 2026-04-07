# Battle Arena Dashboard

A Next-generation, pixel-perfect React application for managing your Gaming Lounge sessions, finances, and points system with a distinct Neon-Cyberpunk aesthetic. Complete with synthetic Web Audio API triggers and Supabase cloud infrastructure!

---

## ⚡ Features
- **Pixel-Perfect Neon UI:** Custom global CSS mirroring the original cyberpunk prototype perfectly, entirely dependency-free.
- **Dynamic Session Timers:** Complex pulse-and-warn state transitions tracking active players, base rates, food items, and overtime.
- **Web Audio Infrastructure:** Features a dynamic `useSound` library creating on-the-fly interactive Sine and Square wave interaction bursts without any external `.mp3` dependencies.
- **React Context State Engine:** Decoupled `AppContext` stores active session states, multi-tier pricing blocks, staff profiles, and finance modules dynamically.
- **Full Backend Redundancy:** Implicitly hooks into `supabase.js` for data persistence. If offline or improperly configured, the state defaults safely to synchronous React memory seamlessly.
- **Secure Sub-Systems:** Built in faux-PIN auth layers (`1234`) intercepting `/expenses`, `/revenue`, and `/accounts`.

## 🚀 Getting Started

1. **Install Dependencies**
   ```sh
   npm install
   ```
2. **Setup Cloud Keys**
   Rename `.env.local.example` to `.env.local` or create it if missing:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Start Development Engine**
   ```sh
   npm run dev
   ```

## 🗄️ Database Schemas
To set up your Supabase project fully, create the following tables. Ensure RLS is configured matching your privacy requirements.

- `sessions`: `id, name, phone, station, players, duration, status, foodOrders (jsonb), rate, prepayment, payment, notes, startTime...`
- `history`: Mirrors `sessions` exactly, tracking closed instances securely with `ended_at, finalTotal, finalPaymentMode`.
- `expenses`: `id, name, amount, category, date`
- `account_transactions`: `account, type, amount, created_at`

## ☁️ Deployment Guides
This bundle is configured intrinsically for SPA-routing via React-Router.
- **Vercel:** Drop the repository directly into Vercel. Required `vercel.json` rewrites are included targeting `index.html`.
- **Netlify:** Drop the repository. Required `netlify.toml` redirects are active for `<Switch />` compatibility.

---
*Developed on Vite + React 19*
