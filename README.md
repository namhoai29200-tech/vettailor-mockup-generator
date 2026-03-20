# 🎖️ Vettailor Mockup Generator

Bulk AI mockup generation for US Veterans apparel using Gemini API.

Upload product images → choose mockup styles → auto-generate professional mockups in bulk.

## Features

- **8 mockup types**: On-Model (male/female), Flat Lay, Lifestyle (BBQ, Outdoor, Garage), Close-up, White BG
- **4 presets**: Quick, Full, E-commerce, Social Media
- **Batch generation** with auto rate-limiting and retry on failure
- **Custom prompts** per mockup type
- **Free tier**: ~500 images/day via Gemini API (no credit card needed)
- **Privacy**: API key stored in browser only, never sent to any server except Google

## Quick Start (Local)

```bash
git clone https://github.com/YOUR_USERNAME/vettailor-mockup-generator.git
cd vettailor-mockup-generator
npm install
npm run dev
```

Open http://localhost:3000 → Enter Gemini API key → Upload images → Generate!

## Deploy

### Option 1: Vercel (Recommended — Free, fastest)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project → Select repo
3. Framework: **Vite** (auto-detected)
4. Click **Deploy**
5. Done! Your app is live at `your-project.vercel.app`

```bash
# Or via CLI:
npm i -g vercel
vercel
```

### Option 2: Netlify (Free)

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy**

```bash
# Or via CLI:
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add build command: `npm run build`
4. Add start command: `npx serve dist -s`
5. Deploy

> Note: Railway's free tier has limited hours. Vercel/Netlify are better for static sites.

### Option 4: GitHub Pages (Free)

1. Install gh-pages: `npm install --save-dev gh-pages`

2. Add to `vite.config.js`:
```js
export default defineConfig({
  base: '/vettailor-mockup-generator/',
  // ... rest of config
})
```

3. Add to `package.json` scripts:
```json
"deploy": "npm run build && gh-pages -d dist"
```

4. Run:
```bash
npm run deploy
```

5. Go to repo Settings → Pages → Source: `gh-pages` branch

## Project Structure

```
vettailor-mockup-generator/
├── index.html          # Entry HTML
├── package.json        # Dependencies
├── vite.config.js      # Vite config
├── .gitignore
├── README.md
└── src/
    ├── main.jsx        # React entry
    └── App.jsx         # Main app (all-in-one)
```

## Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com)
2. Sign in with Google account
3. Click "Get API Key" → "Create API Key"
4. Copy key (starts with `AIza...`)

Free tier: ~500 images/day, no credit card required.

## Models & Pricing

| Model | Price | Free Tier |
|---|---|---|
| Nano Banana (`gemini-2.5-flash-image`) | $0.039/img | ~500/day FREE |
| Nano Banana 2 (`gemini-3.1-flash-image-preview`) | $0.045/img | ~500/day FREE |
| Nano Banana Pro (`gemini-3-pro-image-preview`) | $0.134/img | No free tier |

## Security

- API key is stored in `localStorage` only — never sent to any server except Google's API
- All image processing happens client-side
- No backend, no database, no analytics
- You can self-host on your own domain for full control

## License

MIT
