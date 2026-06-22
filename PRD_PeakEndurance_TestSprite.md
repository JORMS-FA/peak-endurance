# Product Requirements Document (PRD) - Peak Endurance

## 1. Project Overview
Peak Endurance is an AI-powered endurance training platform that integrates real-time data from Strava to provide adaptive training plans. The system calculates performance metrics (PMC: CTL, ATL, TSB) and uses an AI Coach to adjust training based on actual fatigue and recovery.

## 2. Core Features & User Flows to Test

### 2.1 User Authentication & Onboarding
- **Google OAuth Login:** Users must be able to authenticate via Google.
- **Email/Password Auth:** Support for traditional sign-up and sign-in.
- **Athlete Onboarding:** A multi-step process to collect:
  - Body data (Weight, Height).
  - Performance benchmarks (10K pace).
  - Heart Rate Zones (Karvonen method or manual).
- **Expected Result:** User is redirected to the dashboard upon successful onboarding.

### 2.2 Strava Integration (Critical Path)
- **OAuth Connection:** The "Connect Strava" button must trigger the `strava-auth` edge function.
- **Authorization Flow:** User is redirected to Strava, approves permissions, and returns to the app via the callback URL.
- **Data Synchronization:** After connection, the `strava-sync` function must import activities and calculate TSS.
- **Expected Result:** Strava status changes to "Connected" and activity data appears in the dashboard.

### 2.3 Dashboard & Performance Metrics (PMC)
- **Metric Display:** Correct rendering of CTL (Chronic Training Load), ATL (Acute Training Load), and TSB (Training Stress Balance).
- **Charts:** Performance curves using Recharts must render correctly without crashing.
- **Sport Distribution:** Correct breakdown of activities by sport (Running, Cycling, etc.).

### 2.4 AI Coach & BYOK
- **AI Interaction:** Users can query the AI coach for plan adjustments.
- **BYOK (Bring Your Own Key):** Users in the Free tier must be able to enter their own Google AI Studio API key to unlock AI features.
- **Pro Tier:** Users with a subscription should have access to the server-side AI without needing their own key.

### 2.5 Monetization (Lemon Squeezy)
- **Upgrade Flow:** "Upgrade to Pro" button must lead to a Lemon Squeezy checkout.
- **Subscription State:** After payment, the user's tier must update from 'Free' to 'Pro' in the database.

## 3. Technical Constraints & Edge Cases
- **Responsive Design:** Must work on mobile browsers (portrait mode).
- **Error Handling:** Display clear error messages if the Strava API is down or the Supabase function returns a non-2xx code.
- **Security:** RLS (Row Level Security) must prevent users from seeing each other's tokens or athlete data.

## 4. Success Criteria
- User can sign up $\rightarrow$ Connect Strava $\rightarrow$ See PMC Metrics $\rightarrow$ Interact with AI Coach.
