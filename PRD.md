# Product Requirements Document: Social Ticker ("InstaLive Display")

## Product Tagline
A browser-based, full-screen animated Instagram follower counter with QR code for real-time social engagement.

---

## 1. Overview

### Summary
Social Ticker bridges the digital and physical worlds by showing a live Instagram follower count on any connected screen or digital signage. The display animates smoothly with real-time updates and includes a QR code linking directly to the Instagram account, encouraging on-site visitors to follow instantly.

### Core Value Proposition
Give businesses, events, and creators a visually engaging way to promote their social media presence without needing dedicated hardware — just open a browser.

---

## 2. Goals & Success Metrics

### Goals
- Showcase real-time Instagram followers in a visually captivating way.
- Increase follower growth through on-site QR scans.
- Provide a low-friction, hardware-free setup for venues and creators.
- Deliver smooth, reliable updates that reflect social media activity.
- Maintain a polished presentation suitable for large-format displays.

### Success Metrics
| Metric | Target |
|--------|--------|
| Average refresh latency | < 2 seconds after data fetch |
| API uptime | > 99% |
| QR code scan rate | > 5% of venue visitors |
| Follower growth | +10% after 30 days of display |
| Setup time | < 3 minutes from login to display |
| Follower count accuracy | ±1% compared to live total |

---

## 3. Target Users

- **Retailers / cafés / gyms** — display social proof to customers in-store.
- **Event booths / pop-ups** — attract attendees to follow on the spot.
- **Influencers / creators** — display live metrics in studios or streams.
- **Hospitality venues** — reinforce brand identity and social engagement.

---

## 4. User Stories

### Primary
1. *As a business owner*, I want to display my Instagram follower count on a TV so customers can see it in real time.
2. *As a venue manager*, I want visitors to easily scan a QR code to follow our account.
3. *As a marketer*, I want the counter to update automatically without manual refreshes.

### Secondary
4. *As a user*, I want to customize the background and color scheme to match our branding.
5. *As an admin*, I want to log in securely using my Instagram account.
6. *As a team*, I want analytics showing how many people scanned or interacted.

---

## 5. Core Features (MVP)

| Priority | Feature | Description |
|-----------|----------|--------------|
| ✅ Must | **Live follower count display** | Shows current Instagram follower count from API |
| ✅ Must | **Auto-refresh** | Updates every 5–12 seconds (adjustable within rate limits) |
| ✅ Must | **Smooth animation** | Animated number transition for new counts |
| ✅ Must | **QR code display** | Dynamically generated QR to Instagram profile |
| ✅ Must | **Full-screen / kiosk mode** | Clean interface for TV or signage |
| ✅ Must | **Profile identity module** | Displays handle, avatar, optional tagline, and branded colors |
| 🔶 Should | **Custom branding** | Optional logo, background, colors |
| 🔶 Should | **Offline fallback** | Shows last known count with reconnect indicator |
| 🔶 Should | **Configurable refresh interval** | Default 10 s, adjustable 5–60 s |
| 🔶 Should | **Orientation presets** | Themes for landscape/portrait digital signage |
| 🔹 Could | **Analytics dashboard** | Tracks QR scans, impressions |
| 🔹 Could | **Multi-platform support** | Expand to TikTok / YouTube counters |
| 🔹 Could | **Animation themes** | “Flip Clock,” “Minimalist,” “Retro,” etc. |

---

## 6. Technical Architecture

### Frontend
- **Framework:** React or Next.js
- **Display:** Responsive, full-screen animation layer using Framer Motion / GSAP
- **QR Code:** Generated via `qrcode.react` or `QRCode.js`
- **Auth:** Instagram OAuth for secure login

### Backend
- **Server:** Node.js + Express
- **API Integration:** Instagram Graph API via Meta App
- **Cache Layer:** Redis or in-memory caching to reduce API calls
- **Hosting:** Vercel / Cloudflare Pages (frontend), Cloudflare Workers / Supabase Edge (backend)

### Data Flow
```text
[Instagram Graph API] → [Backend Cache] → [Frontend Display App]
```

---

## 7. Constraints & Assumptions

- Initial release targets modern Chromium-based browsers running on dedicated displays.
- Instagram data access may require third-party services or proxies due to API limitations.
- Network interruptions should not crash the display; fallback UI states are required.
- Polling interval must respect Instagram rate limits; caching strategy should mitigate excessive requests.

---

## 8. Future Enhancements (Out of Scope)

- Support for additional social networks beyond Instagram.
- Historical analytics dashboards and exported reports.
- Native mobile or desktop applications.
- Advanced interactive modules (e.g., live comments ticker).
