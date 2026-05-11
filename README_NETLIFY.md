# Hosting on Netlify

Your app is partially ready for Netlify. Please follow these critical steps:

## 1. Static vs Full-Stack
Netlify is a static hosting provider. Your custom Express server (`server.ts`) will **NOT** run on Netlify. Instead, Netlify will serve the static files from the `dist` folder.

## 2. Database (IMPORTANT)
Since the Express server and `data.json` won't work on Netlify:
- You **MUST** use **Supabase** for your database.
- Create a project on [Supabase](https://supabase.com).
- Go to your Netlify Site Settings > Environment Variables and add:
  - `VITE_SUPABASE_URL`: Your Supabase Project URL
  - `VITE_SUPABASE_ANON_KEY`: Your Supabase Project API Key

## 3. Configuration
I have already added a `netlify.toml` file to your project. This tells Netlify:
- To use `npm run build` to compile the app.
- To use the `dist` folder for the website.
- To handle React Router correctly (so refresh doesn't give a 404 error).

## 4. Deployment
1. Export your code (via the Settings menu in AI Studio).
2. Push it to a GitHub repository.
3. Connect that repository to Netlify.
