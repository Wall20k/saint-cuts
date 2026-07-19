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
_headers                 Cloudflare Pages cache/security headers
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

- On mobile (≤560px), the service cards become a horizontally scrolling, scroll-snap strip. Since that overflow isn't obvious at a glance, `.service-tabs` is wrapped in a `.service-scroller` with the same arrow buttons used on the Recent Work carousel (reusing the `.carousel-arrow`/`.carousel-prev`/`.carousel-next` classes) — hidden above 560px since the grid just wraps to more rows there and there's nothing to scroll. Wired up in `js/main.js` via `scrollBy` on `.service-tabs`.
- The active/selected service card pops forward in 3D (`translateZ` + scale, lifted, gold glow) rather than just lifting slightly. This also **locks its rotation to flat** (`rotateX(0) rotateY(0)`), overriding whatever live hover-tilt rotation (`js/tilt.js`) was in effect — without that override, a card tilted backward at the moment of an active-state click could visually look like its top edge recedes into the page instead of popping out.

## Recent Work carousel

The "Work" section (`index.html`, between Services and Visit) is a 5-slide carousel of real customer photos/video, in `assets/gallery/`:

- `work-photo-1.jpg` through `work-photo-4.jpg` — real haircut photos, converted from the original PNG/JPEG captures to optimized JPEGs (originals were 4–12MB lossless PNGs; re-encoded at quality 85, ~250–370KB each with no visible quality loss)
- `work-video-1.mp4` — a real haircut clip. **The original file was an HEVC (H.265)-encoded .mov file straight from iPhone, which Chrome/Firefox/Edge cannot play** (only Safari supports HEVC natively) — transcoded to H.264 MP4 with ffmpeg for universal browser support. `work-video-1-poster.jpg` is an extracted first-frame thumbnail so the slide doesn't show blank before playback starts. A second video was originally included but removed since it showed the same person as the first.
- Behavior: photo slides auto-advance every 2s; video slides play through their actual length and advance on the browser's native `ended` event (not a hardcoded timer), muted/inline. Supports swipe (touch), arrow buttons, dot navigation, and keyboard arrow keys.
- Pausing: a plain click/tap on an arrow, dot, or the slide itself **never** pauses anything — it only navigates (or does nothing, for a tap on the media). The only thing that pauses playback/auto-advance is a genuine **press-and-hold** (300ms+), detected via Pointer Events on `#work-carousel`; releasing resumes exactly where it left off (video continues from its paused position, doesn't restart). Also pauses when scrolled out of view. Fully skips auto-advance under `prefers-reduced-motion` (manual navigation still works).
- The hold gesture is meant to pause playback, not trigger the browser's native long-press image menu (save/copy/share). Suppressed via `-webkit-touch-callout: none` + `user-select: none` + `-webkit-user-drag: none` on the slide media (CSS), plus a `contextmenu` listener with `preventDefault()` on `#work-carousel` (JS, covers Android's long-press behavior which isn't governed by the CSS property).
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

Live at **https://saintthebarber.pages.dev** — free tier, no card on file, no usage-based billing. (An earlier project, `saint-the-barber.pages.dev`, was the initial deploy target and was retired in favor of this cleaner, hyphen-free name.)

- One-time manual deploy (what was used to stand this up):
  ```
  npx wrangler login
  npx wrangler pages project create saintthebarber --production-branch=main
  npx wrangler pages deploy . --project-name=saintthebarber --branch=main
  ```
- **To get auto-deploy on every push** (recommended, not yet set up): Cloudflare dashboard → Workers & Pages → `saintthebarber` → Settings → Builds → Connect to Git → authorize GitHub → pick `Wall20k/saint-cuts` → build command: (none), output directory: `.`. After that, every push to `main` deploys automatically and you don't need the manual `wrangler pages deploy` step above.
- `_headers` is already set up with long-term caching for images/video and baseline security headers (Cloudflare Pages uses a `_headers` file for this instead of Netlify's `netlify.toml`).
- **Custom domain**: `saintthebarber.com` was confirmed available (checked via RDAP). If you buy it (Cloudflare Registrar is cheapest since the site's already on Cloudflare — at-cost pricing, no markup, roughly $9-10/year), it can be attached to this Pages project for free under Workers & Pages → `saintthebarber` → Custom domains.

### Note on file sizes

The three video files are 6–10MB each (well under GitHub's 100MB limit, no Git LFS needed). If you replace them with longer/higher-res clips, keep an eye on total repo size and consider compressing (H.264, ~5–8 Mbps, 1080p is plenty for a background loop).

## Security & legal notes

- The site is public and indexable (repo is public on GitHub, `noindex`/`X-Robots-Tag` were removed once the checks below cleared). It is not password-protected — this was a deliberate choice, not an oversight. If you want to lock it down later, Cloudflare Access is free for personal use and can sit in front of the Pages project.
- `_headers` sets baseline security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`) and long-term caching for images/video.
- No API keys, tokens, or credentials are stored anywhere in this repo, checked across the full git history, not just the current tree. The Cloudflare deploy was authenticated via OAuth login in a real browser session (`wrangler login`) — no token was ever pasted into chat or committed to the repo.
- Address, phone, hours, and Instagram are real, current info — not placeholders.
- Recent Work carousel: real customer photos/video, including one that appears to show a minor. **Confirmed with the site owner that consent (including a parent's consent for the minor) was obtained before this went public.** If that ever changes, pull the photo/video in question from `assets/gallery/` and the matching `.carousel-slide`/`.carousel-dot` pair in `index.html` immediately.
- AI-generated assets (`hero-loop.mp4`, `cta-loop.mp4`, `shop-interior.png`, `tools-macro.png`) were generated via Pletor. Checked Pletor's Terms of Service directly (Article 8, "Property Rights on Outputs"): Outputs from a **paid plan** carry full ownership and commercial-use rights; a free-plan account would be limited to personal/non-commercial use only. **Confirmed with the site owner that a paid Pletor plan was used**, so these are clear for commercial/public use. Pletor's terms also note the client is responsible for complying with the underlying model's own license (tracked in Pletor's Trust Center) — not independently verified here.
