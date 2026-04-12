export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Marketplace", href: "#marketplace" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Sellers", href: "#seller-spotlight" },
  { label: "Login", href: "#footer" },
];

export const stats = [
  { label: "Verified Sellers", value: 6, suffix: "+" },
  { label: "Authentic Products", value: 18, suffix: "+" },
  { label: "Roles", value: 3, suffix: "", detail: "Buyer · Seller · Admin" },
  { label: "Hidden Fees", value: 0, prefix: "₹", suffix: "" },
];

export const heroCards = [
  {
    name: "Kashmiri Pashmina Shawl",
    seller: "Kashmir Loom House",
    price: "₹12,500",
    trust: "95% Trust",
    image: "https://picsum.photos/seed/roots-pashmina/840/560",
  },
  {
    name: "Walnut Serving Bowl",
    seller: "Himalayan Atelier",
    price: "₹3,200",
    trust: "93% Trust",
    image: "https://picsum.photos/seed/roots-bowl/840/560",
  },
  {
    name: "Papier-Mâché Keepsake Box",
    seller: "Dal Lake Works",
    price: "₹950",
    trust: "96% Trust",
    image: "https://picsum.photos/seed/roots-box/840/560",
  },
];

export const roleCards = [
  {
    title: "Buyers",
    icon: "shopping-bag",
    border: "border-gold/80",
    tone: "from-[#F5E5C6] to-[#FFF8EC]",
    text: "Browse verified crafts, pay digitally, and track every order with clarity.",
  },
  {
    title: "Sellers",
    icon: "hand-platter",
    border: "border-terracotta/80",
    tone: "from-[#F7E7DB] to-[#FFF8EC]",
    text: "List products, manage orders, and build a trust score that rewards consistency.",
  },
  {
    title: "Admins",
    icon: "shield-check",
    border: "border-charcoal/70",
    tone: "from-[#F3EAD7] to-[#FFF8EC]",
    text: "Oversee the platform, verify sellers, and resolve disputes with precision.",
  },
];

export const rolePanels = {
  Buyer: {
    number: "01",
    title: "Buyer",
    accent: "gold",
    summary:
      "Buyers move through ROOTS like a quiet gallery visit - elegant, verified, and transparent.",
    bullets: [
      "Browse crafts with seller trust scores visible at every step.",
      "Pay digitally and retain a clean order trail for future reference.",
      "Follow live status without losing the human story behind the craft.",
      "Use the same account for shopping, returns, and support.",
    ],
    cta: "Get Started as Buyer",
    mock: {
      title: "Today’s Order",
      subtitle: "Pashmina Shawl · Paid",
      metric: "Arrives in 3 days",
      gauge: "92% confidence",
      bars: [76, 54, 88],
    },
  },
  Seller: {
    number: "02",
    title: "Seller",
    accent: "terra",
    summary:
      "Sellers get a calm, practical operating layer - listings, order flow, and trust growth in one place.",
    bullets: [
      "List products only after your UPI setup and profile are complete.",
      "Track trust score changes as reviews and fulfillment history accumulate.",
      "Manage packing, shipping, and proof submission without jumping tabs.",
      "Receive direct digital payments, with manual verification safeguards.",
    ],
    cta: "Get Started as Seller",
    mock: {
      title: "Trust Score",
      subtitle: "94 / 100",
      metric: "12 active orders",
      gauge: "Verified seller",
      bars: [88, 74, 62],
    },
  },
  Admin: {
    number: "03",
    title: "Admin",
    accent: "charcoal",
    summary:
      "Admins watch the system with an exacting eye - approvals, disputes, and platform hygiene in real time.",
    bullets: [
      "Review sellers, payment proofs, and content violations from one panel.",
      "Approve or reject disputed proof with a full paper trail.",
      "Keep the platform clean, fair, and culturally credible.",
      "Act with oversight rather than interruption.",
    ],
    cta: "Open Admin Console",
    mock: {
      title: "Verification Queue",
      subtitle: "4 pending proofs",
      metric: "1 urgent review",
      gauge: "Manual checks enabled",
      bars: [92, 48, 80],
    },
  },
};

export const featuredProducts = [
  {
    name: "Pashmina Shawl",
    seller: "by Kashmir Crafts Co.",
    price: "₹12,500",
    trust: "95% Trust Score",
    category: "Textile",
    image: "https://picsum.photos/seed/pashmina/400/300",
  },
  {
    name: "Walnut Wood Bowl",
    seller: "by Himalayan Atelier",
    price: "₹3,200",
    trust: "92% Trust Score",
    category: "Woodcraft",
    image: "https://picsum.photos/seed/walnut-bowl/400/300",
  },
  {
    name: "Kashmiri Embroidered Kurta",
    seller: "by Srinagar Loom House",
    price: "₹7,800",
    trust: "97% Trust Score",
    category: "Textile",
    image: "https://picsum.photos/seed/kashmiri-kurta/400/300",
  },
  {
    name: "Copper Water Pot",
    seller: "by Ladakh Copper Studio",
    price: "₹1,800",
    trust: "90% Trust Score",
    category: "Metalwork",
    image: "https://picsum.photos/seed/copper-pot/400/300",
  },
  {
    name: "Handwoven Silk Dupatta",
    seller: "by Banaras Silk Guild",
    price: "₹5,500",
    trust: "94% Trust Score",
    category: "Textile",
    image: "https://picsum.photos/seed/silk-dupatta/400/300",
  },
  {
    name: "Browse All",
    seller: "Explore the full ROOTS catalogue",
    price: "",
    trust: "",
    category: "",
    type: "cta",
    image: "",
  },
];

export const featureTiles = [
  {
    title: "Secure Auth",
    icon: "lock-keyhole",
    text: "JWT-based login and role-protected routes keep buyers, sellers, and admins separated by design.",
  },
  {
    title: "Digital Payments",
    icon: "credit-card",
    text: "Structured checkout, order references, and manual proof workflows maintain traceability.",
  },
  {
    title: "Order Management",
    icon: "package-check",
    text: "Buyers and sellers can follow the same order through each stage without losing context.",
  },
  {
    title: "Admin Oversight",
    icon: "shield-alert",
    text: "A governance layer for seller verification, proof review, and platform hygiene.",
  },
];

export const techBadges = [
  "JWT Auth",
  "MongoDB",
  "React Native",
  "Express.js",
  "Razorpay",
  "Role-Based Access",
  "Node.js",
];

export const testimonials = [
  {
    quote:
      "I ordered a Pashmina Shawl and it arrived exactly as described. The seller trust score gave me confidence.",
    author: "Priya M., Delhi",
    role: "Verified Buyer",
  },
  {
    quote:
      "Finally a platform that respects artisans. The seller dashboard is simple and powerful.",
    author: "Tariq H., Srinagar",
    role: "Registered Seller",
  },
  {
    quote:
      "As an admin, the oversight tools are everything we needed to keep the platform clean.",
    author: "Admin Team",
    role: "Platform Admin",
  },
];

export const testimonialRows = [testimonials, [...testimonials].reverse()];

export const faqData = [
  {
    q: "How does ROOTS verify sellers?",
    a: "Every seller goes through a manual review by our admin team. We check identity, craft evidence, product consistency, and trust signals before a storefront can go live.",
  },
  {
    q: "Can anyone list products on ROOTS?",
    a: "No. Sellers need a complete profile, valid UPI details, and platform approval before their first product can be published.",
  },
  {
    q: "How are payments handled?",
    a: "ROOTS supports structured digital payment flows with locked order references, proof submission, and verification-ready records.",
  },
  {
    q: "What happens if there is a dispute?",
    a: "The admin team can review proof, order history, and seller activity to resolve disputes with a clear audit trail.",
  },
  {
    q: "Do buyers see trust scores?",
    a: "Yes. Trust scores are visible across the platform so buyers can make decisions with better context and fewer surprises.",
  },
  {
    q: "Can sellers track order progress?",
    a: "Yes. Sellers can follow each order through packing, shipping, proof upload, and verification states in one place.",
  },
  {
    q: "Is ROOTS mobile friendly?",
    a: "Yes. The marketplace is designed for mobile-first discovery, checkout, and seller operations.",
  },
  {
    q: "Why is ROOTS different from a normal marketplace?",
    a: "ROOTS is designed as a trust-first craft platform with visible governance, verification, and a premium editorial feel.",
  },
];

export const liveEvents = [
  { icon: "🛍", text: "Priya M. ordered a Pashmina Shawl", time: "2s ago" },
  { icon: "✅", text: "seller3@kashmir.com verified by Admin", time: "8s ago" },
  { icon: "💳", text: "New order: Walnut Bowl — ₹3,200", time: "14s ago" },
  {
    icon: "⭐",
    text: "Trust Score updated: Kashmir Crafts → 96%",
    time: "21s ago",
  },
  { icon: "🧶", text: "New product listed: Silk Dupatta", time: "35s ago" },
  {
    icon: "📦",
    text: "Order #1047 shipped — estimated 3 days",
    time: "48s ago",
  },
  { icon: "🛍", text: "Rahul K. purchased Copper Water Pot", time: "1m ago" },
  {
    icon: "🔐",
    text: "Admin reviewed seller: Rajasthan Crafts Co.",
    time: "2m ago",
  },
];

export const craftRegions = [
  { name: "Kashmir", x: "42%", y: "8%", crafts: "Pashmina, Walnut Wood" },
  {
    name: "Rajasthan",
    x: "28%",
    y: "32%",
    crafts: "Block Print, Blue Pottery",
  },
  { name: "Gujarat", x: "22%", y: "44%", crafts: "Bandhani, Kutch Craft" },
  { name: "West Bengal", x: "72%", y: "42%", crafts: "Kantha, Muslin" },
  {
    name: "Tamil Nadu",
    x: "52%",
    y: "85%",
    crafts: "Kanjeevaram Silk, Bronze",
  },
  { name: "Odisha", x: "66%", y: "58%", crafts: "Pattachitra, Sambalpuri" },
];

export const comparisonData = [
  { feature: "Seller Trust Score", roots: true, others: false },
  { feature: "Verified Artisans Only", roots: true, others: false },
  { feature: "Digital Payments", roots: true, others: true },
  { feature: "Admin Oversight", roots: true, others: false },
  { feature: "Zero Hidden Fees", roots: true, others: false },
  { feature: "Role-Based Access", roots: true, others: false },
  { feature: "Direct Seller Comms", roots: true, others: true },
  { feature: "Craft Authenticity Badge", roots: true, others: false },
];

export const pageSections = [
  { id: "home", label: "Hero" },
  { id: "craft-story", label: "Craft Story" },
  { id: "how-it-works", label: "Roles" },
  { id: "marketplace", label: "Marketplace" },
  { id: "live-feed", label: "Live Feed" },
  { id: "seller-spotlight", label: "Sellers" },
  { id: "coverage-map", label: "Coverage" },
  { id: "trust-and-tech", label: "Tech" },
  { id: "comparison", label: "Compare" },
  { id: "faq", label: "FAQ" },
  { id: "footer", label: "Footer" },
];

export const footerColumns = {
  marketplace: ["Browse", "Categories", "New Arrivals", "Deals"],
  seller: ["Register", "Dashboard", "Trust Score", "Support"],
  company: ["About", "Blog", "Privacy Policy", "Contact"],
};
