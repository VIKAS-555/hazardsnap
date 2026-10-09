# BST Tech Club — Department of CSE (AI & ML)

A modern, responsive, high-performance web platform built with **Clean Minimalist & Modern Academic** design principles for the **BST Tech Club**, Department of Computer Science & Engineering (AI & ML), Bosscoder School Of Technology.

---

## 🚀 Key Features

1. **Academic Department Scope**
   - Exclusively tailored for **CSE (AI & ML)** undergraduates.
   - Strict student USN range validation: **`2392608001` to `2392608302`**.
   - Clean verification: USN displayed strictly in canonical format (`USN: 2392608166`).

2. **4 Core Technical Domains**
   - **Competitive Programming**: Data Structures, Graph Theory, Dynamic Programming, LeetCode, Codeforces, ICPC.
   - **Robotics**: Microcontrollers, ROS 2, Edge AI, Autonomous Navigation, Computer Vision.
   - **Open Source**: Public software collaboration, Git/GitHub, pull requests, CI/CD, documentation.
   - **Hackathon**: Rapid prototyping, full-stack MVPs in 24–48 hours, pitch storytelling.

3. **Tiered Open-Source Governance Framework**
   - **Lead Administrator (Root / UID 0)**: Highest tier in club administration and platform infrastructure. Operates under multi-admin governance (≥1 Lead Admin). Exclusive authority to manually promote/demote leadership ranks; exempt from point decay.
   - **Core Maintainer**: Technical leadership, domain tracks coordinator, and code submission reviewer. Exempt from points and decay.
   - **Staff Contributor**: Senior peer mentor. Unlocked automatically when an Active Developer achieves **100+ merit points**. Requires maintaining **≥60 points** (auto-demoted below 60).
   - **Active Developer**: Verified student member entry tier. Automatically earns contribution points: **+20 pts** per verified peer referral, **+15 pts** per workshop RSVP, **+25 pts** per approved project showcase.

4. **Curated Workshops, Labs & Hackathons**
   - Interactive scheduling and management strictly accessible to **Lead Administrators** and **Core Maintainers**.
   - General students and visitors enjoy full search, filtering (All, Upcoming, Hackathons, Past), live seat tracking, personalized digital RSVP passes, QR verification codes, and one-click `.ics` calendar sync.

5. **Student Projects Gallery**
   - Curated showcase of applications, robotics hardware builds, open-source utilities, and hackathon prototypes.
   - Project publishing and editing guarded strictly for **Lead Administrators** and **Core Maintainers** to ensure production-grade project quality.
   - Public view includes live demo launch, GitHub repository inspect, and domain category tags.

6. **Executive Board & Leadership Directory**
   - Interactive directory featuring domain leads, mentors, and faculty advisors with LinkedIn and GitHub links.
   - Clickable governance filter pills allowing instant filtering by rank (Lead Admin, Core Maintainer, Staff Contributor, Active Dev).

7. **Cryptographic Member Authentication & Vault (`login.html`)**
   - **Existing Member Sign-In**: Via Tech Club ID or College Email + Password.
   - **New Member Onboarding**: Automated USN range validation (`2392608001`–`2392608302`), full name, section, and college email.
   - **Personalized Tech Club ID**: Minted in canonical format (e.g. `BST-2026-XXXX`).
   - **Password Security**: Client-side Web Crypto **SHA-256 with per-user cryptographic salt**, real-time password strength meter, brute-force rate-limiting, and an in-app password update tool.

8. **Peer Referral System (QR & Instant Share Link)**
   - Every registered member receives an individualized referral link (`login.html?ref=BST-XXXX`) and an instant high-resolution QR code.
   - Automatic point attribution (+20 points credited per joined peer) driving auto-advancement toward Staff Contributor.

9. **Silky Hydrodynamic Liquid Cursor Simulation (`js/liquid-effect.js`)**
   - Physics-based interactive background mesh with viscous dissipation, impulse propagation, and dynamic lighting.
   - Optimized with `requestAnimationFrame`, cached bounds, and adaptive pixel ratios for buttery 60+ FPS performance without UI lag.

10. **Zero-Build Architecture**
    - Built using vanilla HTML5, Tailwind CSS, Lucide Icons, and modular vanilla JavaScript.
    - Runs instantly without complex bundlers or Node.js runtime dependencies.

---

## 🛠️ How to Run Locally

You can preview the website immediately using Python's built-in HTTP server:

```bash
cd "/Users/polymath/Antigravity/Club Website"
python3 -m http.server 3000
```

Then open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

*(Alternatively, you can open `index.html` directly in any modern browser).*

---

## ⚙️ Customizing for Your College

All club content is centralized inside **[`js/config.js`](file:///Users/polymath/Antigravity/Club%20Website/js/config.js)**:

```javascript
const clubConfig = {
  club: {
    name: "BST Tech Club",
    fullName: "BST Tech Club — CSE (AI & ML)",
    collegeName: "Bosscoder School Of Technology",
    shortCollege: "BST",
    department: "CSE (AI & ML)",
    tagline: "Empowering CSE (AI & ML) innovators, builders, and problem solvers.",
    contactEmail: "contact@bsttechclub.edu",
    // ...
  },
  domains: [ /* Your club tracks */ ],
  events: [ /* Upcoming & past workshops */ ],
  projects: [ /* Student projects */ ],
  faqs: [ /* Frequently asked questions */ ]
};
```

---

## 🌐 Free Deployment Guide

Because the app is clean static HTML/CSS/JS, you can host it for free in seconds:

- **GitHub Pages**:
  1. Push this repository to GitHub.
  2. Go to **Settings** > **Pages** > Select `main` branch and `/root`.
  3. Your site goes live at `https://<username>.github.io/<repo-name>/`.

- **Vercel / Netlify**:
  - Deploy directly via GitHub integration or drag-and-drop the directory for instant edge deployment.
