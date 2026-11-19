# NOIR Barber Studio — Premium demo website

**Portfolio concept only.** A fictional barber brand for demonstrating frontend design. No real salon, testimonials, pricing, address, or appointments are implied.

## What's inside

- Responsive editorial one-page website, desktop/tablet/mobile
- Smooth scroll and reveal animations, custom cursor glow, magnetic buttons, marquee
- Services, lookbook, demo testimonials, interactive booking modal
- Booking form intentionally **does not send or save data**
- Zero build step. HTML + CSS + vanilla JavaScript; works with GitHub Pages

## Local preview

Open `index.html` in a browser (internet access is required to display photography and Google Fonts), or use a local server:

```bash
python -m http.server 8000
```

Open http://localhost:8000

## Deploy to GitHub Pages

1. Create a GitHub repository, e.g. `noir-barber-demo`.
2. Upload `index.html`, `styles.css`, `app.js` and the `assets/` folder into the repository root.
3. In repository **Settings → Pages**, select **Deploy from a branch**, `main`, `/ (root)` and save.
4. GitHub will provide a temporary `USERNAME.github.io/noir-barber-demo/` address.
5. To connect a custom domain or subdomain, first add it to the repository's **Settings → Pages → Custom domain**. For a subdomain such as `barber.example.com`, at the domain registrar add a DNS **CNAME** for `barber` pointing to `USERNAME.github.io` (replace username). DNS propagation and certificate issuance can take time; enable **Enforce HTTPS** once available.
6. Verify domain ownership through GitHub account **Settings → Pages**, using the TXT record they provide, especially before adding extra subdomains.

See official docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## What to replace before serving a real client

- Fictional brand NOIR, concept badge, placeholder copy, testimonials, prices, location and contacts
- External Unsplash photography with **real client images** where possible; third-party photo and font loading requires internet
- Demo form with actual reservation provider/backend, data protection, spam protection and email notifications
- Proper privacy/legal details for the target country
- Performance/SEO/analytics setup and content verification

No genuine appointments are created or stored. No data is sent by the booking form.
