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
assets/images/          shop-interior.png, tools-macro.png, logo-mark.png (nav/footer icon),
                        logo-full.png (spare, with wordmark, unused on the page),
                        favicon-32.png / favicon-512.png
assets/video/           hero-loop.mp4, cta-loop.mp4 (in use), gallery-loop.mp4 (unused — see note below)
netlify.toml             Netlify build/cache config + security headers + noindex
```

## Logo

`logo-mark.png` is a cropped, transparent-background version of the supplied crest logo (crest only, wordmark removed) used next to the "Saint / The Barber" text in the header and footer. `logo-full.png` is the same treatment but keeps the "SAINT THE BARBER" text baked into the image — not used anywhere currently, kept in case you want it for something like a larger standalone placement. Both had their black background converted to transparency locally (brightness-based alpha), so they drop onto the dark theme with no visible box around them. Favicons were generated from the crest mark.

## 3D / animation layer

The 3D treatment is built from the real video footage, not abstract graphics:

- **Hero and Booking CTA**: the full-bleed video panes tilt subtly in 3D (`perspective` + `rotateX/rotateY`) following the pointer, like a floating glass panel. Desktop/fine-pointer only.
- **Cards** (services, about portrait, map): CSS 3D tilt-on-hover with a light "shine" following the cursor. Desktop/fine-pointer only — touch devices keep the existing tap/active states instead, since hover-tilt doesn't make sense without a persistent pointer.
- All tilt effects respect `prefers-reduced-motion` (skipped entirely) and add no dependency — no external library, no runtime CDN request.

## Before launch — fill in real business info

Address, phone, Instagram, and the booking link are all filled in. Still to do:

- `[shop email]` — contact email, used in `privacy.html` and `accessibility.html` (search for it)
- Hours are set to "By appointment" — update the Visit section in `index.html` if you want listed hours instead.

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

### Netlify

- **New site from Git** → pick this repo → build command: (none) → publish directory: `.`
- Or drag-and-drop the project folder into Netlify's dashboard for a manual deploy.
- `netlify.toml` is already set up with long-term caching for images/video.

### Note on file sizes

The three video files are 6–10MB each (well under GitHub's 100MB limit, no Git LFS needed). If you replace them with longer/higher-res clips, keep an eye on total repo size and consider compressing (H.264, ~5–8 Mbps, 1080p is plenty for a background loop).

## Security & legal notes

- The repo is private and the deployed Netlify URL is set to `noindex, nofollow` (both in HTML `<meta>` tags and via an `X-Robots-Tag` response header in `netlify.toml`) while the site still contains placeholder business info and AI-generated imagery. Search engines won't index it, but the URL itself is not password-protected — anyone with the direct link can view it.
- `netlify.toml` also sets baseline security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`).
- No API keys, tokens, or credentials are stored anywhere in this repo.
- Before making the repo public or removing `noindex`: replace the placeholder address/phone/hours/Instagram handle with real information, and confirm you have the rights to use the AI-generated photos/video commercially (check the generator's terms of service for commercial-use and ownership terms) since they're bundled directly into this repo.
