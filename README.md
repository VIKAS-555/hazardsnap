# BST Tech Club — Department of CSE (AI & ML)

A modern, responsive, high-performance web platform built with **Clean Minimalist & Modern Academic** design principles for the **BST Tech Club**, Department of Computer Science & Engineering (AI & ML).

---

## 🚀 Key Features

1. **Academic Department Scope**
   - Exclusively tailored for **CSE (AI & ML)** undergraduates.
   - Strict student USN range validation: **`2392608001` to `2392608302`**.

2. **4 Core Technical Domains**
   - **Competitive Programming**: Data Structures, Graph Theory, Dynamic Programming, LeetCode, Codeforces.
   - **Robotics**: Microcontrollers, ROS 2, Edge AI, Autonomous Navigation, Computer Vision.
   - **Open Source**: Public software collaboration, Git/GitHub, pull requests, CI/CD, documentation.
   - **Hackathon**: Rapid prototyping, full-stack MVPs in 24–48 hours, pitch storytelling.

3. **Dynamic Workshops, Labs & Hackathons Portal**
   - Starts clean and empty with an interactive **"+ Add Event"** manager.
   - Full in-browser **Add, Edit, and Delete** capabilities while keeping the exact card and pass formatting.
   - Integrated RSVP modal, digital pass generation, verified QR code, and `.ics` calendar download.

4. **Student Projects Gallery**
   - Starts clean and empty ready for member submissions.
   - Members can **Add, Edit, and Delete** projects with live demo and GitHub source links.

5. **Signature Call-to-Action**
   - Clean framed `BUILD. COLLABORATE. SHIP.` section.

6. **BST Tech Club Portal (`login.html`)**
   - Member authentication, USN verification, unique Tech Club ID minting (`BST-2026-XXXX`), in-app password editing, and peer referral QR code sharing.

4. **Student Project Showcase**
   - Live demo links, GitHub source repositories, and category badges.

5. **Executive Board & Leadership Directory**
   - Roles, domains, bios, and LinkedIn & GitHub profile links.

6. **Interactive FAQ Accordion**
   - Common student queries regarding eligibility, fees, attendance verification, and recruitment.

8. **Secure Authentication & Member Portal (`login.html` & `js/auth.js`)**
   - **Method 1: Existing Member Sign In** via Tech Club ID or College Email + Password.
   - **Method 2: New Member Onboarding** requesting Full Name, USN (University Seat Number), Section/Division, College Email, and Department.
   - **Personalized Tech Club ID**: Uniquely generated format (e.g. `DS-2026-1082`) for every verified member.
   - **Password Security & Management**: Client-side Web Crypto **SHA-256 with per-user cryptographic salt**, real-time password strength meter, brute-force rate-limiting, and an in-app password update tool.
   - **Peer Referral System (QR & Shareable Link)**: Every member gets a personal share link (`login.html?ref=DS-XXXX`) and an instant scannable QR code. When newcomers scan or click, they are directed straight to the registration form with the referrer credited!

9. **Zero-Build Architecture**
   - Ready to run instantly with vanilla modern HTML5, Tailwind CSS, Lucide Icons, and modular JavaScript.
   - No node build pipelines required for local development or preview!

---

## 🛠️ How to Run Locally

You can preview the website immediately using Python's built-in HTTP server:

```bash
cd "/Users/polymath/Antigravity/Club Website"
python3 -m http.server 3000
```

Then open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

*(Alternatively, you can double-click `index.html` to open it directly in any browser).*

---

## ⚙️ Customizing for Your College

All club content is centralized inside **[`js/config.js`](file:///Users/polymath/Antigravity/Club%20Website/js/config.js)**. You do not need to hunt through HTML to modify details:

```javascript
const clubConfig = {
  club: {
    name: "BST Tech Club",
    fullName: "BST Tech Club — CSE (AI & ML)",
    collegeName: "Bosscoder School Of Technology",
    shortCollege: "BST",
    tagline: "Empowering CSE (AI & ML) innovators, builders, and problem solvers.",
    contactEmail: "contact@bsttechclub.edu",
    // ...
  },
  domains: [ /* Your club tracks */ ],
  events: [ /* Upcoming & past workshops */ ],
  projects: [ /* Student projects */ ],
  team: [ /* Leads & faculty advisors */ ],
  faqs: [ /* FAQs */ ]
};
```

---

## 🌐 Free Deployment Guide

Because the app is clean static HTML/CSS/JS, you can host it for free in seconds:

- **GitHub Pages**:
  1. Push this folder to a GitHub repository.
  2. Go to **Settings** > **Pages** > Select `main` branch and `/root`.
  3. Your site goes live at `https://<username>.github.io/<repo-name>/`.

- **Vercel / Netlify**:
  - Drag and drop this folder onto [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com) for instant global edge deployment.
