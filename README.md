# NOIR Barber Studio — Portfolio Website + Booking & Admin Demo (v3.1 — booking time fix)

A fictional, premium barber-studio website designed as a portfolio demonstration. NOIR is not a real barbershop. Photographs are inspiration images, and sample testimonials, services, prices and staff are fictitious.

## v3.1 booking time picker fix

- **CHOOSE YOUR TIME** is now an actual visible dropdown beside the date; choose a value to book.
- **VIEW ALL TIME SLOTS** expands an optional grid of clickable times.
- On days that are closed or fully booked, a visible message explains why no times appear.
- **NEXT AVAILABLE DAY** jumps to another day with appointments.
- All booking and admin features from v3 remain; still a browser-only demo with no actual email.

## What's included

- `index.html` — premium responsive public website (services, gallery, reviews, opening hours, booking flow)
- `styles.css` — public website styles and visual animations
- `app.js` — interactive booking modal, live time-slot selection, paper airplane-to-NOIR-envelope delivery animation
- `admin.html` — styled studio-owner dashboard
- `admin.css` / `admin.js` — dashboard, appointment statuses, search, sample data, 7-day agenda, CSV export and weekly hours editor
- `studio-store.js` — **browser-only demo data layer** for appointments, opening hours, barber availability, validation and booking conflicts
- `assets/favicon.svg`

## IMPORTANT: no real backend or email

**This is a portfolio demo, not a production booking system.** Both pages save data to the same browser's `localStorage`, scoped to the same domain and browser profile. That allows you to demonstrate a complete user booking journey and see it appear in the admin dashboard **on that browser only**. If someone else opens the public site on their phone, their demo appointments are **not** visible on your computer. The envelope/paper airplane animation is visual; **it does not send an email**.

The admin demo has **no authentication**. It is deliberately publicly accessible for demonstration. Never ask real clients to enter real personal details on this version. Use **fictional names only**. Do not present this as a working secure admin dashboard for a real business.

A real deployment for clients requires a protected backend/database (e.g., Supabase, Firebase or a booking SaaS), server-side slot conflict prevention, authenticated admin authorization, email/phone notification integrations, spam protection, GDPR/privacy handling and appropriate uptime/backup arrangements. A password or secret hidden in browser JS **is not sufficient security**.

## How to try the demo

1. Unzip the project to one folder.
2. In that folder start a small local server (recommended for consistent browser storage):

   ```bash
   python -m http.server 8000
   ```
3. In one browser/profile open `http://localhost:8000/index.html`.
4. Click **BOOK YOUR EXPERIENCE**, choose a service/barber/date/time, enter a *fictional* guest name, and click **BOOK NOW — WATCH IT FLY**. The envelope animation plays.
5. Open `http://localhost:8000/admin.html` in the **same browser/profile**. You'll see the new demo booking; update its status if you like.
6. Change the hours under **OPENING HOURS**, click **SAVE HOURS**, and return to/reload the public page. The hours list and available booking times adapt.
7. For a populated dashboard without manual booking, click **+ ADD SAMPLE DATA**. Example bookings use fictional names. You can also export CSV or clear demo bookings.

The site uses HTML, CSS and vanilla JS; no npm or build step is needed. Google Fonts and Unsplash photos require internet access.

## Scheduling demo rules

- Default open days: Tuesday–Saturday, 10:00–19:00. Sunday/Monday closed.
- Admin can set separate open/closed status and hours for each day.
- Guests can book up to 60 days ahead, at 30-minute slot increments with at least 30 minutes' notice on the current day.
- Two fictional barbers: Alex and Jordan. “First available” chooses one with room for the full service duration.
- Services are 30–75 minutes; the demo blocks overlapping time slots for the same barber.
- Pending and Confirmed bookings reserve time. Completed and Cancelled bookings do not.
- Hours edits do not retroactively cancel or relocate existing demo appointments.
- Browser storage can be cleared by browser settings, private browsing, or the dashboard's Clear button.

## GitHub Pages / custom domain

1. Create a GitHub repository and upload `index.html`, `styles.css`, `app.js`, `admin.html`, `admin.css`, `admin.js`, `studio-store.js`, `assets/` and this README to its root.
2. Repository **Settings → Pages → Deploy from a branch → main / (root)**.
3. Your `USERNAME.github.io/REPO/` preview site will work as a *public portfolio demo*.
4. Optionally configure a custom domain in **Settings → Pages → Custom domain** and set appropriate DNS records at the registrar. Add domain verification and enable HTTPS when available.
5. `admin.html` is **not secure** and will be publicly accessible in the repository. It can safely demonstrate fake data, but do not use it to manage real bookings as-is.

Official GitHub documentation: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Next step for actual client delivery

Replace the browser-only `studio-store.js` with a secure, centralized booking API and real authentication. Keep the public UI and admin design. Configure actual studio hours, staff, service durations, business info, real photos, customer contact collection, privacy notice and a verified notification provider.
