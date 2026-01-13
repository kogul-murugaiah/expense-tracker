# 💰 CASHAM — Expense Tracker App

CASHAM is a modern multi-user finance & expense tracker built using *Vite + React + TypeScript + Tailwind CSS* with *Supabase* as the backend.  
It provides clean dashboards, income/expense tracking, monthly & yearly insights, and secure multi-user authentication with *Row Level Security (RLS)*.

---

## 🚀 Live Demo
🔗 https://expense-tracker-five-navy.vercel.app/

---

## 📌 Features

### ✅ Authentication (Multi-user)
- Email + Password Login & Signup
- Email verification support
- Secure per-user data access using *Supabase RLS policies*
- User profile identification (shows logged-in email)
- Logout support (Desktop + Mobile)

### ✅ Expense Management
- Add expenses with:
  - Item name
  - Amount
  - Date
  - User-specific Category (from categories table)
  - User-specific Account Type
  - Optional description
- Manage expenses (view + edit)

### ✅ Income Management
- Add income with:
  - Amount
  - Date
  - User-specific Source (from income_sources table)
  - User-specific Account Type

### ✅ Analytics Dashboard
- Monthly summary cards:
  - Income
  - Expenses
  - Balance
- Account-wise analytics (dynamic per user)
- Auto-updates when custom accounts are added

### ✅ Monthly / Yearly Insights
- Monthly tracking by category & account
- Yearly tracking overview

### ✅ Custom Master Data (Per User)
- ✅ Custom Account Types (account_types)
- ✅ Custom Categories (categories)
- ✅ Custom Income Sources (income_sources)
- Dropdowns load only the logged-in user’s categories/sources/accounts

### ✅ Mobile Friendly UI
- Premium dark-themed UI
- Bottom Navigation Bar
- Profile sheet and logout inside mobile UI
- Touch-friendly layout

---

## 🛠 Tech Stack

### Frontend
- Vite
- React
- TypeScript
- Tailwind CSS

### Backend
- Supabase (Auth + Database + RLS)

### Deployment
- Vercel

---

## 📂 Pages / Routes

| Page | Route |
|------|-------|
| Dashboard | / |
| Add Expense | /add |
| Add Income | /add-income |
| Monthly | /monthly |
| Yearly | /yearly |
| Manage Expenses | /expenses |
| Login | /login |
| Signup | /signup |

---

## 🔐 Security — Row Level Security (RLS)

CASHAM is built as a *true multi-user app*.  
All tables use Supabase *RLS policies, ensuring each user can access **only their own data*.

Tables protected with RLS:
- expenses
- income
- account_types
- categories
- income_sources

---

## 🔑 Environment Variables

Create a .env file in the project root and add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key