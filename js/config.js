/**
 * BST Tech Club Configuration & Content Data
 * Department: CSE (AI & ML)
 */

const clubConfig = {
  club: {
    name: "BST Tech Club",
    fullName: "BST Tech Club — CSE (AI & ML)",
    collegeName: "Bosscoder School Of Technology",
    shortCollege: "BST",
    department: "CSE (AI & ML)",
    tagline: "Empowering CSE (AI & ML) innovators, builders, and problem solvers.",
    subtagline: "A student-led technical community pushing the boundaries of Competitive Programming, Robotics, Open Source, and Hackathons.",
    established: "2023",
    contactEmail: "contact@bsttechclub.edu",
    location: "CSE (AI & ML) Department, Tech Innovation Hub",
    socials: {
      github: "https://github.com",
      discord: "https://discord.gg",
      linkedin: "https://linkedin.com",
      x: "https://x.com",
      instagram: "https://instagram.com"
    },
    stats: [
      { label: "Joined Members", value: "0", icon: "users", live: true },
      { label: "Technical Domains", value: "4", icon: "layers" },
      { label: "Branch", value: "CSE (AI & ML)", icon: "cpu" },
      { label: "Technical Sessions & RSVP", value: "0", icon: "trophy", live: true }
    ]
  },

  // Focus Domains / Tracks (4 Specific Domains Requested)
  domains: [
    {
      id: "competitive-programming",
      title: "Competitive Programming",
      lead: "Algorithms & Problem Solving Track",
      description: "Mastering data structures, algorithmic paradigms, dynamic programming, graph algorithms, and competitive problem solving on Codeforces, LeetCode, and ICPC contests.",
      icon: "code-xml",
      tags: ["Data Structures", "Dynamic Programming", "Graph Theory", "LeetCode", "Codeforces", "C++ / Java", "Time Complexity"]
    },
    {
      id: "robotics",
      title: "Robotics",
      lead: "Autonomous Systems & Hardware Track",
      description: "Designing intelligent robotic systems, microcontrollers, ROS 2 pipelines, sensor fusion, computer vision integration, edge AI inference, and autonomous rover navigation.",
      icon: "bot",
      tags: ["ROS 2", "Arduino & ESP32", "Raspberry Pi", "Computer Vision", "Sensors & Actuators", "Embedded C++", "Edge AI"]
    },
    {
      id: "open-source",
      title: "Open Source",
      lead: "Collaborative Software Track",
      description: "Building production software in public, mastering Git & GitHub workflows, contributing to global repositories, code reviews, writing documentation, and maintaining community packages.",
      icon: "git-pull-request",
      tags: ["Git & GitHub", "Pull Requests", "CI/CD Actions", "Documentation", "Global Repos", "GSoC Prep", "Code Review"]
    },
    {
      id: "hackathon",
      title: "Hackathon",
      lead: "Rapid Prototyping & Product Track",
      description: "Assembling interdisciplinary teams to ideate and build production-ready full-stack MVPs in 24 to 48 hours, pitch storytelling, rapid debugging, and competing in national hackathons.",
      icon: "trophy",
      tags: ["Rapid Prototyping", "Full-Stack MVP", "AI Integrations", "Pitch Decks", "Team Synergy", "24-48h Sprints"]
    }
  ],

  // Events & Workshops (Kept empty by default; managed via dynamic CRUD in app.js / localStorage)
  events: [],

  // Student Projects Gallery (Kept empty by default; managed via dynamic CRUD in app.js / localStorage)
  projects: [],

  // Frequently Asked Questions (Updated for CSE AI & ML)
  faqs: [
    {
      question: "Who is eligible to join BST Tech Club?",
      answer: "All enrolled students from the Department of Computer Science & Engineering (AI & ML) with valid USNs between 2392608001 and 2392608302 are welcome to register and participate."
    },
    {
      question: "Are workshops and events free to attend?",
      answer: "Yes, 100% of our general workshops, study jams, and bootcamps are completely free for department students. Materials and resources are provided by the club."
    },
    {
      question: "How does the RSVP and attendance verification work?",
      answer: "Clicking 'RSVP' on any scheduled event generates your personalized digital ticket pass with a unique verification code and QR code. You can save it to your device or add the event directly to your calendar."
    },
    {
      question: "How can I add my project or propose a workshop?",
      answer: "Student project showcases and workshop sessions are curated and published by Core Maintainers and Lead Administrators. Active members can submit their projects or workshop proposals to domain leads or maintainers for review and inclusion."
    },
    {
      question: "How does the tiered open-source governance & point system work?",
      answer: "The club features a 4-tier meritocracy: Active Developers automatically advance to Staff Contributor upon earning 100 contribution points (+20 pts/referral, +15 pts/RSVP, +25 pts/project showcase) and maintain rank with ≥60 points. Core Maintainers and Lead Administrators manage club governance, workshops, and project showcases."
    }
  ]
};

// Export to window
if (typeof window !== "undefined") {
  window.clubConfig = clubConfig;
}
