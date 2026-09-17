# NexCell Solutions website

A static site built from the Figma file "Nexcell-Solution" (page: Prototype). It uses plain HTML, CSS and JavaScript, with no build step.

## Run locally

```bash
python3 -m http.server 4321 --directory site
```

Then open http://localhost:4321.

## Deploy

Vercel project Root Directory is `site/` (framework "Other", no build step). `site/vercel.json` only sets clean URLs and asset caching.

## Structure

| Path | What it is |
|---|---|
| `index.html`, `services.html`, `how-we-work.html`, `about.html` | Pages. Each has one `<h1>`, its own title, meta description and canonical URL |
| `assets/css/styles.css` | Figma tokens as CSS variables, mobile-first layout (breakpoints at 640 / 768 / 900 / 1100px) |
| `assets/js/main.js` | Mobile menu, FAQ accordion, scroll reveal, contact form (validates, then opens the visitor's email app) |
| `assets/js/agent.js` | "Ask NexCell" assistant, running in **demo mode** (scripted answers, no API calls) |
| `assets/icons/` | Logo mark and icons exported from Figma |
| `robots.txt`, `sitemap.xml` | Files for search engines |

## Inconsistencies in the Figma file, fixed in code

- **Stats:** one set everywhere (50+ projects, 6 services, 100% Claude-native, London). The unverified "170+ UK businesses" and "Claude Specialist partner" claims were removed.
- **Process:** the How We Work steps (Audit & Strategy, Build & Integrate, Test & Refine, Launch & Enable) are used everywhere.
- **Address:** 66 Paul Street everywhere (the How We Work footer said 86).
- **Navigation:** the pill nav and pill buttons are used on every page, and the footer is the same on every page, including a Contact link.
- **ConneX:** links out to connexecosystem.com, since there's no ConneX page.
- **Mobile homepage:** now has the ConneX section, FAQ and sectors strip, like desktop.
- **Copy:** FAQ answers written. The unexplained "Morpheus" line was removed. The menu button no longer says "Continue". The copyright year updates automatically.

## Making the agent live

In `agent.js`, replace `route()` with a `fetch` to a serverless function (e.g. `api/chat.js` on Vercel). That function should call Claude with the `SERVICES`/`INTENTS` content as its system prompt. Keep the API key on the server.

## Logo files

`brand/` has the logo as SVG and 4x PNG:

- `nexcell-logo-on-light-bg` / `nexcell-logo-on-dark-bg`: full logo on paper (`#FAF7F5`) and navy-deep (`#05070C`) backgrounds
- `nexcell-logo-light` / `nexcell-logo-dark`: transparent background, for light and dark backgrounds
- `nexcell-mark`: logo mark on its own
