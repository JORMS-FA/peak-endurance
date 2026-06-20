# Peak Endurance - Setup Guide

This guide covers how to configure Supabase, Vercel, and Google OAuth for the Peak Endurance web application.

---

## 1. Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New Project**.
3. Choose an organization, give your project a name (e.g. `peak-endurance`), set a database password, and select a region close to your users.
4. Wait for the project to finish provisioning.

### 1.2 Get Your API Credentials

1. In the Supabase dashboard, go to **Settings > API**.
2. Copy the **Project URL** - this is your `VITE_SUPABASE_URL`.
3. Copy the **anon / public** key - this is your `VITE_SUPABASE_ANON_KEY`.

### 1.3 Configure Authentication Providers

1. In the Supabase dashboard, go to **Authentication > Providers**.
2. Under **Email**, make sure the following settings are configured:
   - **Enable Email provider**: ON
   - **Confirm email**: ON (recommended for production)
   - **Enable Magic Link / OTP sign-in**: OFF (disabled - the app uses email+password only)
3. Under **Google** (configured in Section 3 below):
   - **Enable Google provider**: ON
   - Copy the **Callback URL (for OAuth)** shown in the Google provider section - you will need it when setting up Google Cloud credentials.

### 1.4 Configure Redirect URLs

1. Go to **Authentication > URL Configuration**.
2. Set the **Site URL** to your production domain (e.g. `https://your-app.vercel.app`).
3. Under **Redirect URLs**, add the following entries:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/app`
   - `http://localhost:5173/auth/callback` (for local development)
   - `http://localhost:5173/app` (for local development)

### 1.5 Create the Profiles Table

Run the following SQL in the Supabase **SQL Editor** (Dashboard > SQL Editor > New Query):

```sql
-- Create the profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

---

## 2. Vercel Deployment

### 2.1 Import the Repository

1. Go to [https://vercel.com](https://vercel.com) and sign in.
2. Click **Add New > Project**.
3. Import the GitHub repository containing this project.

### 2.2 Configure Build Settings

When configuring the project, set the following:

| Setting            | Value      |
|--------------------|------------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Vite     |
| **Build Command**  | (leave default - Vercel will use `vite build`) |
| **Output Directory** | (leave default - `dist`) |

### 2.3 Set Environment Variables

In the Vercel project settings, go to **Settings > Environment Variables** and add:

| Variable                  | Value                                         | Notes                                    |
|---------------------------|-----------------------------------------------|------------------------------------------|
| `VITE_SUPABASE_URL`      | `https://your-project-ref.supabase.co`        | From Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...`            | From Supabase Dashboard > Settings > API |
| `VITE_SITE_URL`          | `https://your-app.vercel.app`                 | Your Vercel deployment URL               |

> **Important**: All three variables must be prefixed with `VITE_` so Vite exposes them to the client bundle.

### 2.4 Deploy

Click **Deploy**. Vercel will build and deploy the app. Once deployed, copy the production URL and use it to update:

- `VITE_SITE_URL` environment variable in Vercel (if you used a placeholder)
- Supabase **Site URL** and **Redirect URLs** (Section 1.4)

---

## 3. Google OAuth Setup

### 3.1 Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > OAuth consent screen**.
4. Choose **External** user type and click **Create**.
5. Fill in the required fields:
   - **App name**: Peak Endurance
   - **User support email**: your email
   - **Developer contact email**: your email
6. Click **Save and Continue** through the Scopes and Test Users steps (defaults are fine).
7. Click **Back to Dashboard**.

### 3.2 Create OAuth Credentials

1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Set **Application type** to **Web application**.
4. Give it a name (e.g. `Peak Endurance Web`).
5. Under **Authorized JavaScript origins**, add:
   - `https://your-app.vercel.app`
   - `http://localhost:5173` (for local development)
6. Under **Authorized redirect URIs**, add the Supabase callback URL you copied in Section 1.3:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret**.

### 3.3 Configure Google Provider in Supabase

1. Go back to your Supabase dashboard > **Authentication > Providers > Google**.
2. Toggle **Enable Google provider** to ON.
3. Paste the **Client ID** and **Client Secret** from step 3.2.
4. Click **Save**.

---

## 4. Local Development

For local development, create a `.env.local` file in `apps/web/`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SITE_URL=http://localhost:5173
```

Then run:

```bash
cd apps/web
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Summary Checklist

- [ ] Supabase project created and API credentials copied
- [ ] Email+password auth enabled, magic link disabled
- [ ] Google OAuth configured in Supabase with Google Cloud credentials
- [ ] Profiles table created with RLS policies
- [ ] Redirect URLs configured in Supabase (production + localhost)
- [ ] Vercel project imported with Root Directory set to `apps/web`
- [ ] Framework Preset set to Vite
- [ ] All three `VITE_*` environment variables added in Vercel
- [ ] Google OAuth redirect URI points to Supabase callback URL
- [ ] Production deployment URL updated in Supabase Site URL
