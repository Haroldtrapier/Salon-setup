"use client";
import Link from "next/link";

const links = {
  Shop: [
    { name: "All Collections", href: "/shop" },
    { name: "French Tips", href: "/shop" },
    { name: "Ombre", href: "/shop" },
    { name: "Bold & Artistic", href: "/shop" },
  ],
  Services: [
    { name: "Custom Fit AI", href: "/custom-fit" },
    { name: "Book Appointment", href: "/book" },
    { name: "FAQ", href: "/faq" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Shipping", href: "/shipping" },
    { name: "Returns", href: "/returns" },
  ],
};

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#080808", borderTop: "1px solid #1a1a1a" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 1.5rem 3rem" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "3rem", marginBottom: "4rem" }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 600, color: "#f0ede8" }}>DNNB</span>
              <span style={{ color: "#c9a96e" }}>.</span>
            </Link>
            <p style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "#555555", lineHeight: 1.8, maxWidth: 240 }}>
              AI-powered custom-fit press-on nails. Crafted for your unique nail shape. No compromise.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444444", marginBottom: "1.25rem" }}>{cat}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {items.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className="footer-link"
                      style={{ fontSize: "0.8125rem", color: "#666666", textDecoration: "none", transition: "color 0.2s" }}>
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#444444" }}>© 2026 Drip Nails & Beauty. All rights reserved.</p>
          <p style={{ fontSize: "0.6875rem", color: "#333333", letterSpacing: "0.15em", textTransform: "uppercase" }}>Crafted with AI · Made for You</p>
        </div>
      </div>
      <style>{`
        .footer-link:hover { color: #c9a96e !important; }
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
