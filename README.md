# RadiLinks — All That Matters

**RadiLinks** is a next-generation personal portfolio and AI integration showcase built by **Radmehr Rezaabadi** — an **AI Integration Specialist** and **Full-Stack Developer**. After reorganizing the frontend into the repository root, streamlining navigation, and removing legacy mini-games, the site now highlights RadBot Quiz, AI automation flows, and business-focused storytelling while keeping performance at the center.

---

## Live Demo

- **Website:** [https://www.radilinks.com](https://www.radilinks.com)
- **Source Code:** [GitHub Repository](https://github.com/Radmehrvf/NETWORKRAD)

---

## Features

### Modern UI/UX
- Fully responsive design optimized for desktop and mobile.
- Sticky navigation with dropdown menus, smooth scrolling, and section highlights.
- Optimized font and asset loading for strong Core Web Vitals.

### AI-Powered Sections
- **AI Business Optimizer & Support CTA:** Collects user context and recommends AI-driven improvements.
- Integrated animations, validation, and dynamic states for polished interactions.

### Portfolio & Projects
- Highlights the AI Chat Assistant, Automation Suite, and the RadiLinks platform itself.
- Each project lists the tech stack, GitHub links, and optional live demos.

### Interactive Experience
- **RadBot Quiz** remains the flagship mini-game, delivering AI-powered questions, scoring, and auto-focus behavior.
- Mindspace, Explorer, and Network Builder were retired from the main page to keep the experience focused and fast.

### Universe & Growth
- Dedicated sections for business services, community links, and growth metrics.
- Animated backgrounds and subtle particle effects reinforce the futuristic aesthetic.

### Chat Integration
- "Let's Chat" CTA wired for AI-assistant handoffs (Cloudflare Worker friendly).

### Support Unlock Easter Egg
- Hovering the logo reveals a secret animation and support shout-out.

---

## Tech Stack

| Layer              | Technology                                                      |
|--------------------|------------------------------------------------------------------|
| **Frontend**       | HTML5, CSS3, Vanilla JavaScript                                  |
| **Styling**        | CSS Variables, Flexbox, Grid, Motion/transition effects          |
| **Backend / Auth** | Node.js, Express, Passport (Google + email), Redis-backed sessions |
| **Database**       | MySQL (mysql2 pool) |
| **Session Store**  | Redis |
| **AI & Integrations** | Cloudflare Workers, Claude AI (REST API)                     |
| **Hosting**        | GitHub Pages (frontend) + self/hosted Node backend               |
| **Assets**         | SVG icons, PNG logo, Google Fonts (Roboto)                      |

---

## Project Structure

`
NETWORKRAD/
+-- index.html            # Main marketing/portfolio page
+-- signup.html           # Authentication portal
+-- dashboard.html        # Authenticated workspace view
+-- account-settings.html # Profile & account management
+-- Style.css             # Optimized global styles
+-- Script.js             # Core interactivity, animations, AI logic
+-- assets/               # Logo, resume, misc assets
+-- backend/              # Express server, routes, middleware, config
+-- README.md             # Project documentation
`

Frontend assets now live at the repository root for GitHub Pages deployment, while the backend/ folder houses the Express server used for authentication and profile APIs.

---

## Key Functional Highlights

- **Lazy Loading:** Defers heavy sections for faster first paint.
- **Mobile Menu Toggle:** Animated overlay navigation with focus trapping.
- **Interactive Forms:** AI Optimizer, support CTAs, and contact prompts adapt to user context.
- **RadBot Quiz:** AI-generated questions with score tracking, auto-scroll, and keyboard handling.
- **Accessibility Ready:** Reduced-motion media queries, semantic tags, and ARIA helpers.
- **Performance Optimized:** Preloading, deferred CSS, async JS, and minimal render blocking assets.

---

## Developer

**Radmehr Rezaabadi**  
AI Integration Specialist & Full-Stack Developer  
- [radmehrvf@gmail.com](mailto:radmehrvf@gmail.com)  
- [LinkedIn](https://www.linkedin.com/in/radmehr-rezaabadi-a7396728b/)  
- [GitHub](https://github.com/Radmehrvf)  
- [YouTube](https://www.youtube.com/@NetworkRad)

---

## Installation & Setup

```bash
git clone https://github.com/Radmehrvf/NETWORKRAD.git
cd NETWORKRAD
```

Serve the static frontend (for example, with Python) and run the backend if you need authentication routes:

```bash
# Frontend preview
python -m http.server 8080

# Backend (inside backend/)
cd backend
npm install
npm run dev
```

`npm run dev` uses nodemon to automatically restart the server during development.

Create a `backend/.env` from `backend/.env.example` with your OAuth credentials, a strong `SESSION_SECRET` (32+ chars), database settings, and Redis settings (`REDIS_URL` or `REDIS_HOST` + `REDIS_PORT`).

Redis must be installed and running on the server (default `127.0.0.1:6379`).

## Performance & Security

- Uses fetchpriority hints and media="print" CSS loading for better First Contentful Paint.
- Redis-backed sessions with secure cookie flags (`httpOnly`, `sameSite`, `secure`).
- MySQL connection pooling via mysql2 for improved throughput.
- Request body size limits set to 10MB for JSON and URL-encoded payloads.
- Centralized 404/500 error handling for safer responses.
- No invasive tracking; follows accessibility and SEO best practices.

## Future Enhancements

- AI-powered contact form backed by Cloudflare Workers.
- Analytics dashboard for visitor metrics.
- Progressive Web App (PWA) packaging.
- Optional relaunch of curated mini-games in a dedicated hub.

---

## License

Open sourced under the **MIT License** — free for personal and commercial use with attribution.

---

> "Intelligence meets imagination — RadiLinks is where AI and creativity merge."
