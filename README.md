# Saint The Barber — Website

Static site, no build step. Plain HTML/CSS/JS.

## Structure

```
index.html            Home page
privacy.html           Privacy policy stub
accessibility.html     Accessibility statement stub
css/styles.css         All styles
js/main.js              Nav, service tabs, scroll reveal, video/reduced-motion handling
js/tilt.js              CSS 3D tilt for the hero/booking videos + hover-tilt for cards (desktop/fine-pointer only)
js/carousel.js          Recent Work photo/video carousel (auto-advance, swipe, arrows, dots)
assets/images/          shop-interior.png, tools-macro.png, logo-mark.png (nav/footer icon),
                        logo-full.png (spare, with wordmark, unused on the page),
                        favicon-32.png / favicon-512.png
assets/video/           hero-loop.mp4, cta-loop.mp4 (in use), gallery-loop.mp4 (unused — see note below)
assets/gallery/         Recent Work carousel media — see "Recent Work carousel" below
_headers                 Cloudflare Pages cache/security headers + noindex
```

## Logo

`logo-mark.png` is a cropped, transparent-background version of the supplied crest logo (crest only, wordmark removed) used next to the "Saint / The Barber" text in the header and footer. `logo-full.png` is the same treatment but keeps the "SAINT THE BARBER" text baked into the image — not used anywhere currently, kept in case you want it for something like a larger standalone placement. Both had their black background converted to transparency locally (brightness-based alpha), so they drop onto the dark theme with no visible box around them. Favicons were generated from the crest mark.

## 3D / animation layer

The 3D treatment is built from the real video footage, not abstract graphics:

- **Hero and Booking CTA**: the full-bleed video panes tilt subtly in 3D (`perspective` + `rotateX/rotateY`) following the pointer, like a floating glass panel. Desktop/fine-pointer only.
- **Cards** (services, about portrait, map): CSS 3D tilt-on-hover with a light "shine" following the cursor. Desktop/fine-pointer only — touch devices keep the existing tap/active states instead, since hover-tilt doesn't make sense without a persistent pointer.
- All tilt effects respect `prefers-reduced-motion` (skipped entirely) and add no dependency — no external library, no runtime CDN request.

## Before launch

Address, phone, Instagram, hours, and the booking link are all filled in with real info. No business email is used (contact points are phone/Instagram only) — the `privacy.html` and `accessibility.html` contact sections were updated to reflect that.

## Services

The service menu in the Services section (`index.html`) mirrors the real Booksy listing (Regular Haircut, Skin Fade, Taper, Blowout Taper, Burst Fade, Mullet, Wash + Style, Beard Trim, Haircut + Design, Haircut + Beard Trim, Line Up, Long Hair) with the same prices and durations. Booksy listed "Taper", "Skin Fade", and "Any haircut + beard trim" twice each (once under "Popular Services", once under "Other Services", same price/time both times) — only included once here. If the real menu changes, update the `data-time` / `data-price` / `data-desc` attributes on the `.service-card` buttons in `index.html` (and the matching default content in `#service-panel` for whichever card has the `active` class).

## Recent Work carousel

The "Work" section (`index.html`, between Services and Visit) is a 5-slide carousel of real customer photos/video, in `assets/gallery/`:

- `work-photo-1.jpg` through `work-photo-4.jpg` — real haircut photos, converted from the original PNG/JPEG captures to optimized JPEGs (originals were 4–12MB lossless PNGs; re-encoded at quality 85, ~250–370KB each with no visible quality loss)
- `work-video-1.mp4` — a real haircut clip. **The original file was an HEVC (H.265)-encoded .mov file straight from iPhone, which Chrome/Firefox/Edge cannot play** (only Safari supports HEVC natively) — transcoded to H.264 MP4 with ffmpeg for universal browser support. `work-video-1-poster.jpg` is an extracted first-frame thumbnail so the slide doesn't show blank before playback starts. A second video was originally included but removed since it showed the same person as the first.
- Behavior: photo slides auto-advance every 4.5s; video slides play through their actual length and advance on the browser's native `ended` event (not a hardcoded timer), muted/inline. Supports swipe (touch), arrow buttons, dot navigation, and keyboard arrow keys. Pauses on hover/focus and when scrolled out of view. Fully skips auto-advance under `prefers-reduced-motion` (manual navigation still works).
- To add/remove/reorder slides: edit the `.carousel-slide` elements inside `#carousel-track` in `index.html` and add/remove a matching `.carousel-dot` button — the JS in `js/carousel.js` reads slide count from the DOM, no hardcoded indices to update.
- If you add more HEVC-source phone videos later, transcode them the same way before using them on the site: `ffmpeg -i input.mov -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset slow -c:a aac -b:a 128k -movflags +faststart output.mp4`

## Video/image asset roles

- `hero-loop.mp4` — hero background video (above the fold)
- `cta-loop.mp4` — booking section background video
- `gallery-loop.mp4` — **not currently used on the page** (the "Our Craftsmanship" gallery section was removed). The file is still in `assets/video/` in case you want to use it elsewhere — nothing loads it right now.
- `shop-interior.png` — About section photo
- `tools-macro.png` — Services panel photo

Video/section pairings were assigned by best guess (I couldn't preview the raw video frames in this environment). If a clip doesn't match its section, just swap the file under the same filename, or update the `<source>` path in `index.html`.

## Run locally

Any static file server works, e.g.:

```
npx serve .
# or
python -m http.server 8080
```

Then open the printed local URL.

## Deploy

### GitHub

```
git init
git add .
git commit -m "Saint The Barber site"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Cloudflare Pages

Live at **https://saint-the-barber.pages.dev** — free tier, no card on file, no usage-based billing.

- One-time manual deploy (what was used to stand this up):
  ```
  npx wrangler login
  npx wrangler pages project create saint-the-barber --production-branch=main
  npx wrangler pages deploy . --project-name=saint-the-barber --branch=main
  ```
- **To get auto-deploy on every push** (recommended, not yet set up): Cloudflare dashboard → Workers & Pages → `saint-the-barber` → Settings → Builds → Connect to Git → authorize GitHub → pick `Wall20k/saint-cuts` → build command: (none), output directory: `.`. After that, every push to `main` deploys automatically and you don't need the manual `wrangler pages deploy` step above.
- `_headers` is already set up with long-term caching for images/video and the security/noindex headers (Cloudflare Pages uses a `_headers` file for this instead of Netlify's `netlify.toml`).

### Note on file sizes

The three video files are 6–10MB each (well under GitHub's 100MB limit, no Git LFS needed). If you replace them with longer/higher-res clips, keep an eye on total repo size and consider compressing (H.264, ~5–8 Mbps, 1080p is plenty for a background loop).

## Security & legal notes

- The repo is private, and the deployed Cloudflare Pages URL is set to `noindex, nofollow` (both in HTML `<meta>` tags and via an `X-Robots-Tag` response header in `_headers`). Search engines won't index it, but the URL itself is not password-protected — anyone with the direct link can view it. Cloudflare Pages doesn't offer free built-in password protection the way Netlify does; if you want that, put Cloudflare Access (also free for personal use) in front of the project, or ask for it to be set up.
- `_headers` also sets baseline security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`).
- No API keys, tokens, or credentials are stored anywhere in this repo. The Cloudflare deploy was authenticated via OAuth login in a real browser session (`wrangler login`) — no token was ever pasted into chat or committed to the repo.
- Address, phone, hours, and Instagram are real, current info — not placeholders. The hero/About/Services photos (`shop-interior.png`, `tools-macro.png`) and the hero/booking background videos are AI-generated; confirm you have the rights to use them commercially (check the generator's terms of service) before making the repo public, since they're bundled directly into it. The Recent Work carousel photos/video are real customer photos, not AI-generated.
