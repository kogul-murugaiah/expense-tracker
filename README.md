# 💰 CASHAM — Expense Tracker App

CASHAM is a modern multi-user expense tracker built using **Vite + React + TypeScript + Tailwind CSS** with **Supabase** as the backend.  
It provides clean analytics dashboards, income/expense tracking, monthly & yearly insights, and multi-user authentication with secure **Row Level Security (RLS)**.

---

## 🚀 Live Demo
🔗 https://expense-tracker-five-navy.vercel.app/

---

## 📌 Features

### ✅ Authentication (Multi-user)
- Email + Password Login & Signup
- Email verification support
- Secure per-user data access using **Supabase RLS policies**
- User profile identification (shows logged-in email)
- Logout support (Desktop + Mobile)

### ✅ Expense Management
- Add expenses with:
  - Item name
  - Amount
  - Date
  - Category
  - Account type
  - Optional description
- Manage expenses (view + edit)

### ✅ Income Management
- Add income with:
  - Amount
  - Date
  - Source
  - Account type

### ✅ Analytics Dashboard
- Monthly summary cards:
  - Income
  - Expenses
  - Balance
- Account-wise analytics
- Auto-updates when custom accounts are added

### ✅ Monthly / Yearly Insights
- Monthly tracking by category & account
- Yearly tracking overview

### ✅ Custom Account Types
- Users can create custom account types
- Dashboard & forms automatically load the user’s accounts
- Default accounts auto-created for new users

### ✅ Mobile Friendly UI
- Premium dark-themed UI (Gen-Z style)
- Bottom Navigation Bar
- Profile sheet & logout inside mobile UI
- Touch-friendly layout

---

## 🛠️ Tech Stack

### Frontend
- **Vite**
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Supabase**
  - Auth
  - Database
  - RLS policies

### Deployment
- **Vercel**

---

## 📂 Pages / Routes

| Page | Route |
|------|-------|
| Dashboard | `/` |
| Add Expense | `/add` |
| Add Income | `/add-income` |
| Monthly | `/monthly` |
| Yearly | `/yearly` |
| Manage Expenses | `/expenses` |
| Login | `/login` |
| Signup | `/signup` |

---

## 🔐 Security — Row Level Security (RLS)

CASHAM is built as a **true multi-user app**.

All main tables (expenses, income, account_types) use Supabase **RLS policies**, ensuring:
- A user can access **only their data**
- Insert/Update/Delete are restricted to the logged-in user's rows

---

## ⚙️ Supabase Setup

### 1️⃣ Create Supabase Project
Go to: https://supabase.com/  
Create a new project.

### 2️⃣ Add Tables
Required tables:
- `expenses`
- `income`
- `categories`
- `account_types`

### 3️⃣ Enable RLS
Enable RLS on:
- `expenses`
- `income`
- `account_types`

### 4️⃣ Add RLS Policies
Policies should restrict access using `auth.uid() = user_id`

---

## 🔑 Environment Variables

Create a `.env` file in the root folder:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
