# Cinematic Video Editor Portfolio

A responsive React + Vite portfolio with animated welcome screen, four animated portfolio folders, category filters, and a video modal.

## Run locally
1. Install Node.js (LTS).
2. Extract this folder and open a terminal inside it.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL printed by Vite.

## Personalize
- Edit `src/data/portfolio.js` to change the editor's name, tagline, contact details, categories, video titles, thumbnails, and video URLs.
- Replace demo video URLs with the editor's own YouTube/Vimeo links or direct MP4 URLs.
- For YouTube, use an embed URL such as `https://www.youtube.com/embed/VIDEO_ID`.
- Replace `YOUR_INSTAGRAM` and `919999999999` in the portfolio data.

## Deploy to Vercel
### Option A — GitHub (recommended)
1. Create a GitHub repository and upload the project files.
2. Sign in at https://vercel.com and choose **Add New → Project**.
3. Import the repository.
4. Vercel should detect Vite automatically. Build command: `npm run build`; output directory: `dist`.
5. Click **Deploy**.

### Option B — Vercel CLI
```bash
npm install
npm run build
npx vercel
```
Follow the prompts. For production deployment:
```bash
npx vercel --prod
```

No environment variables or backend are required for this static portfolio.
