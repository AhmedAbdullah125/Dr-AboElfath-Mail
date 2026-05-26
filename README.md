# Dr. Abo Elfath — Mail Manager

A personal mail management system built with **Next.js 14**, **Supabase**, and **Vanilla CSS**. Designed as a private Outlook-style interface to organize, archive, and manage important correspondence — accessible from any device.

## ✨ Features

- 📥 **4 Categories**: Inbox, Sent, Spam, Important (each with icons)
- 📋 **Mail List**: Searchable, filterable, with per-item edit/delete
- 📖 **Mail Detail**: Full view with subject, date, time, from/to, body
- 📎 **Attachments**: Upload PDF, Word, Excel, images — download any time
- ✍️ **Compose / Edit**: Rich form with drag-and-drop file upload
- 📅 **Date & Time**: Picker with "Now" shortcut
- 📱 **Responsive**: Works on PC, tablet, and mobile
- 🎨 **Dark Theme**: Premium Outlook-inspired UI

## 🚀 Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Go to **Storage → New Bucket** and create a bucket named `mail-attachments` (set as **public**)
4. Copy your **Project URL** and **API keys** from Settings → API

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deploy to Vercel

1. Push this repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add the 3 environment variables in Vercel's dashboard
4. Deploy — done! ✅

## 🗂 Project Structure

```
app/
  api/
    mails/          → GET list, POST create
    mails/[id]/     → GET one, PUT update, DELETE
    upload/         → POST upload file, DELETE attachment
  mail/             → Main UI page
components/
  Sidebar/          → Category navigation
  MailList/         → Mail list panel
  MailDetail/       → Mail content view
  MailForm/         → Create / Edit modal
  ConfirmDialog/    → Delete confirmation
  Toast/            → Notifications
context/
  MailContext.tsx   → Global state (React Context + useReducer)
lib/
  supabase.ts       → Supabase client
  types.ts          → TypeScript interfaces
  utils.ts          → Date/file formatting helpers
styles/
  globals.css       → Design system + all component styles
supabase/
  schema.sql        → Database schema (run in Supabase SQL Editor)
```

## 🛠 Tech Stack

| Layer    | Technology                |
|----------|---------------------------|
| Frontend | Next.js 14 (App Router)   |
| Styling  | Vanilla CSS               |
| State    | React Context + useReducer|
| Database | Supabase (PostgreSQL)     |
| Storage  | Supabase Storage          |
| Deploy   | Vercel                    |
