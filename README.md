# Saint Cuts — Website

Static site, no build step. Plain HTML/CSS/JS.

## Structure

```
index.html            Home page
privacy.html           Privacy policy stub
accessibility.html     Accessibility statement stub
css/styles.css         All styles
js/main.js              Nav, service tabs, scroll reveal, video/reduced-motion handling
js/tilt.js              CSS 3D tilt-on-hover for cards + hero (desktop/fine-pointer only)
js/scene3d.js           Three.js ambient wireframe scene layered over the hero video
js/vendor/three.module.min.js   Vendored Three.js r169 (MIT license) — no runtime CDN dependency
assets/images/          shop-interior.png, tools-macro.png
assets/video/           hero-loop.mp4, gallery-loop.mp4, cta-loop.mp4
netlify.toml             Netlify build/cache config + security headers + noindex
```

## 3D / animation layer

- **Hero**: a small Three.js scene (wireframe rings + a faceted "gem" + a sparse particle field) renders over the hero video with `mix-blend-mode: screen`, plus a subtle CSS 3D tilt on the whole hero pane that follows the pointer. Runs on all devices; skipped automatically if `prefers-reduced-motion` is set or the browser reports `saveData`. Fails silently (no crash, no visual artifact) if WebGL is unavailable.
- **Cards** (services, gallery, about portrait, map): CSS 3D tilt-on-hover with a light "shine" following the cursor. Desktop/fine-pointer only — touch devices keep the existing tap/active states instead, since hover-tilt doesn't make sense without a persistent pointer.
- Three.js is vendored locally under `js/vendor/` (not loaded from a CDN at runtime) so the page has no third-party script dependency at request time — better privacy, and no supply-chain risk from a compromised CDN post-deploy. It's MIT-licensed; see `js/vendor/three.module.min.js`'s header comment for the license notice.

## Before launch — fill in real business info

Search `index.html`, `privacy.html`, and `accessibility.html` for bracketed placeholders and replace them:

- `[Shop address]` — street address (appears in Visit section and map card, x2)
- `[hours]` — operating hours
- `[509 phone number]` — shop phone number
- `@saint.cuts` / `[Confirm handle]` — Instagram handle
- `[shop email]` — contact email (legal pages)
- Booking button: in `index.html`, find `data-placeholder-link` on the "Book Appointment" button in the Booking section and replace `href="#"` with your real scheduling link (Square, Booksy, Calendly, etc.), then remove the `data-placeholder-link` attribute so it navigates normally instead of showing the "connect your booking platform" toast.

## Video/image asset roles

- `hero-loop.mp4` — hero background video (above the fold)
- `cta-loop.mp4` — booking section background video
- `gallery-loop.mp4` — gallery grid accent tile
- `shop-interior.png` — About section + gallery
- `tools-macro.png` — Services panel + gallery

These were assigned by best guess (I couldn't preview the raw video frames in this environment). If a clip doesn't match its section, just swap the file under the same filename, or update the `<source>` path in `index.html`.

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
git commit -m "Saint Cuts site"
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
