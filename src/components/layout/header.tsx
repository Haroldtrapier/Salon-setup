"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store";

const navigation = [
  { name: "Shop", href: "/shop" },
  { name: "Custom Fit", href: "/custom-fit" },
  { name: "Book", href: "/book" },
  { name: "About", href: "/about" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartStore((s) => s.items.length);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    transition: "background 0.4s ease, border-color 0.4s ease",
    backgroundColor: scrolled ? "rgba(8,8,8,0.97)" : "rgba(8,8,8,0.6)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderBottom: `1px solid ${scrolled ? "#222222" : "transparent"}`,
  };

  return (
    <header style={headerStyle}>
      <nav style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", height: 72, alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.375rem", fontWeight: 600, color: "#f0ede8", letterSpacing: "0.04em" }}>
              DNNB
            </span>
            <span style={{ color: "#c9a96e", fontSize: "1.5rem", lineHeight: 1 }}>.</span>
          </Link>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="nav-link"
                style={{ fontSize: "0.75rem", fontWeight: 400, color: "#888888", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <Link href="/shop" style={{ position: "relative", color: "#f0ede8", display: "flex", lineHeight: 0 }}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#c9a96e", color: "#080808", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: "none", border: "none", color: "#f0ede8", cursor: "pointer", padding: 4, display: "none" }}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ backgroundColor: "#0f0f0f", borderTop: "1px solid #1e1e1e" }}>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)}
                  style={{ fontSize: "0.875rem", color: "#888888", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) { .desktop-nav { display: flex !important; } .mobile-btn { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } .mobile-btn { display: flex !important; } }
      `}</style>
    </header>
  );
}
