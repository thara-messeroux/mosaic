# Mosaic

Meet slowly. Connect deeply.

Mosaic is a values-first, friendship-first connection app. It helps people slow down, reflect on what matters to them, and make connection choices with more clarity. Instead of rushing straight into matching, Mosaic starts with self-understanding.

## Live App

[Explore Mosaic](https://mosaic-blond.vercel.app)

## Project Summary

| Area | Details |
|---|---|
| Project type | Full-stack final project |
| Core idea | Reflection before matching |
| Primary user | Someone who wants slower, more intentional connection |
| Main value | Helps users notice values, patterns, and connection preferences |
| Deployment | Vercel |
| Backend | Supabase |

## App Preview

### Reflections and AI Connection Lens

<img src="./public/screenshots/reflections-lens-desktop.png" alt="Mosaic reflections page with AI Connection Lens" width="100%" />

### Discover

<img src="./public/screenshots/discover-desktop.png" alt="Mosaic Discover page with profile cards" width="100%" />

### Sam, the AI Reflection Guide

<img src="./public/screenshots/sam-desktop.png" alt="Mosaic Sam AI guided reflection page" width="100%" />

### Mobile Experience

<p align="center">
  <img src="./public/screenshots/reflections-mobile.png" alt="Mosaic mobile reflections screen" width="320" />
</p>

## Core Features

- Secure sign up, sign in, and persistent sessions
- Profile creation, editing, and photo upload
- Private reflections with create, read, update, and delete
- Discover with persistent Save and Pass decisions
- Challenges with user-owned create, edit, and delete
- Sam, an AI-guided reflection companion
- AI Connection Lens for saved reflections
- Responsive desktop and mobile layout
- Private data protected with Supabase Auth, Row Level Security, and server-side AI calls

## User Journey

1. Create an account or sign in.
2. Build a profile with values, preferences, and a photo.
3. Explore Discover and save or pass on profiles.
4. Write private reflections about connection patterns.
5. Use Sam and Connection Lens to turn reflections into clearer themes and values.

## How the AI Works

- Sam asks a short series of reflection questions.
- Connection Lens analyzes a saved reflection and returns a theme with key values.
- AI requests run through a Supabase Edge Function.
- The OpenAI API key is stored only in Supabase Edge Function Secrets.
- User data is protected with Supabase Auth and Row Level Security.

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | CSS, responsive layout |
| Backend | Supabase, PostgreSQL |
| Auth | Supabase Auth |
| Data protection | Row Level Security |
| Storage | Supabase Storage |
| AI | Supabase Edge Functions, OpenAI Chat Completions API |
| Deployment | Vercel |

## What Went Well

- The product concept became clear: reflection before matching.
- Supabase Auth, RLS, storage, and user-owned data work together well.
- The AI features feel connected to the product instead of added on randomly.
- The app works across desktop and mobile with a polished layout.
- The deployment flow works through GitHub and Vercel.

## Challenges and How I Solved Them

| Challenge | How I solved it |
|---|---|
| Protecting private user data | Used Supabase Auth and Row Level Security so users only access their own data. |
| Keeping AI keys out of the frontend | Moved AI calls into a Supabase Edge Function and stored the OpenAI key in Supabase secrets. |
| Making AI useful without replacing judgment | Framed Sam and Connection Lens as reflection aids, not advice or therapy. |
| Making routing work after refresh | Added Vercel SPA routing so direct URLs load correctly. |
| Improving mobile polish | Added consistent mobile gutters so pages feel aligned and professional. |

## Future Improvements

- Consent-based compatibility matching
- Private messaging after mutual interest
- Stronger onboarding for new users
- Reflection trends over time
- More accessibility and usability testing

## Important Links

- Live App: https://mosaic-blond.vercel.app
- GitHub Repository: https://github.com/thara-messeroux/mosaic
- React: https://react.dev
- Vite: https://vite.dev
- Supabase: https://supabase.com
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- OpenAI API: https://platform.openai.com/docs
- Vercel: https://vercel.com

## Local Setup

```bash
npm install
npm run dev
npm run build
```

Set these environment variables in a local `.env.local` file:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The OpenAI API key is not stored in the frontend. It belongs only in Supabase Edge Function Secrets, so every AI request stays server-side.

## Author

Thara Messeroux
GitHub: https://github.com/thara-messeroux
