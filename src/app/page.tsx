"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Camera, Star } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

const collections = [
  {
    name: "French Tips",
    description: "Timeless elegance",
    tag: "Bestseller",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=1000&fit=crop&q=90",
  },
  {
    name: "Ombre Collection",
    description: "Gradient perfection",
    tag: "New",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=1000&fit=crop&q=90",
  },
  {
    name: "Bold & Artistic",
    description: "Make a statement",
    tag: "Limited",
    image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=1000&fit=crop&q=90",
  },
];

const steps = [
  {
    num: "01",
    icon: Camera,
    title: "Capture Your Nails",
    desc: "Upload a clear photo of your hand with all 5 fingers extended. Our AI analyzes your natural nail shape.",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "AI Analysis",
    desc: "Our vision model measures each nail's width, length, and curvature with precision — no measuring tape needed.",
  },
  {
    num: "03",
    icon: Star,
    title: "Custom Crafted",
    desc: "Your measurements save to your profile. Every set is sized exactly to your unique nail dimensions.",
  },
];

const testimonials = [
  {
    quote: "The custom fit makes such a difference. These look and feel like they were made just for me — because they were.",
    name: "Sarah M.",
    role: "Loyal Customer",
    stars: 5,
  },
  {
    quote: "I've tried every press-on brand out there. Nothing compares to the quality and fit from Drip Nails & Beauty. Obsessed.",
    name: "Jessica L.",
    role: "Beauty Blogger",
    stars: 5,
  },
  {
    quote: "The AI fitting was mind-blowing. Zero gap, zero lift. My nails lasted three full weeks.",
    name: "Maya R.",
    role: "Verified Customer",
    stars: 5,
  },
];

const ticker = ["CUSTOM FIT", "AI-POWERED", "LUXURY PRESS-ONS", "CRAFTED FOR YOU", "DRIP NAILS & BEAUTY", "ZERO COMPROMISE", "YOUR SHAPE · YOUR STYLE"];

const S: Record<string, React.CSSProperties> = {
  gold: { color: "#c9a96e" },
  muted: { color: "#888888" },
  dim: { color: "#666666" },
  dimmer: { color: "#555555" },
  text: { color: "#f0ede8" },
  serif: { fontFamily: "'Playfair Display', Georgia, serif" },
  caps: { fontSize: "0.6875rem", letterSpacing: "0.25em", textTransform: "uppercase" as const },
  btn: {
    display: "inline-flex", alignItems: "center", gap: "0.5rem",
    padding: "0.9rem 2rem",
    fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const,
    textDecoration: "none", transition: "all 0.25s",
  },
};

export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #080808 0%, #0c0c0c 100%)" }}>
        {/* Radial gold glow */}
        <div style={{ position: "absolute", top: "15%", right: "8%", width: "45vw", height: "45vw", maxWidth: 600, maxHeight: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 1.5rem", width: "100%" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>

            {/* Left: Copy */}
            <div>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                style={{ ...S.caps, ...S.gold, marginBottom: "1.5rem" }}>
                Drip Nails & Beauty · AI Custom Fit
              </motion.p>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ ...S.serif, fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 500, lineHeight: 1.05, ...S.text, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
                Beauty<br /><em style={{ ...S.gold }}>Perfected.</em>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                style={{ fontSize: "1.0625rem", ...S.muted, lineHeight: 1.8, maxWidth: 460, marginBottom: "2.5rem" }}>
                AI-powered custom-fit press-on nails, crafted precisely to your nail dimensions. No guessing. No gaps. Just flawless.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.42 }}
                style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/shop" style={{ ...S.btn, backgroundColor: "#c9a96e", ...S.text, color: "#080808" }}>
                  Shop Collection <ArrowRight size={14} />
                </Link>
                <Link href="/custom-fit" style={{ ...S.btn, border: "1px solid #2e2e2e", ...S.text }}>
                  Get Custom Fit
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.65 }}
                style={{ display: "flex", gap: "2.5rem", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #1a1a1a" }}>
                {[["500+", "Styles"], ["10k+", "Happy Clients"], ["4.9★", "Rating"]].map(([val, label]) => (
                  <div key={label}>
                    <p style={{ ...S.serif, fontSize: "1.5rem", fontWeight: 600, ...S.text }}>{val}</p>
                    <p style={{ ...S.caps, fontSize: "0.6875rem", color: "#555555", marginTop: "0.2rem" }}>{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Image */}
            <motion.div className="hero-img" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative" }}>
              <div style={{ position: "relative", borderRadius: 3, overflow: "hidden", aspectRatio: "4/5" }}>
                <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&h=1100&fit=crop&q=90"
                  alt="Luxury press-on nails" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.55) 0%, transparent 55%)" }} />
              </div>
              {/* Floating card */}
              <div style={{ position: "absolute", bottom: "2rem", left: "-2rem", backgroundColor: "rgba(14,14,14,0.96)", backdropFilter: "blur(20px)", border: "1px solid #252525", padding: "1.1rem 1.4rem", borderRadius: 3, minWidth: 210 }}>
                <p style={{ ...S.caps, ...S.gold, fontSize: "0.625rem", marginBottom: "0.5rem" }}>AI Measurement</p>
                <p style={{ fontSize: "0.875rem", ...S.text, fontWeight: 500 }}>Custom fit for every finger</p>
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.3rem" }}>
                  {["T", "I", "M", "R", "P"].map((f) => (
                    <div key={f} style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#1a1a1a", border: "1px solid #2e2e2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem", color: "#888" }}>{f}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) { .hero-grid { grid-template-columns: 1fr !important; } .hero-img { display: none !important; } }
        `}</style>
      </section>

      {/* ── TICKER ───────────────────────────────────────── */}
      <div style={{ backgroundColor: "#c9a96e", padding: "0.85rem 0", overflow: "hidden" }}>
        <div className="animate-marquee">
          {[...ticker, ...ticker].map((item, i) => (
            <span key={i} style={{ paddingRight: "3rem", ...S.caps, fontSize: "0.625rem", fontWeight: 700, color: "#080808" }}>
              {item} <span style={{ opacity: 0.4 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── COLLECTIONS ──────────────────────────────────── */}
      <section style={{ padding: "7rem 0", backgroundColor: "#080808" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <motion.div {...fadeUp} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem" }}>
            <div>
              <p style={{ ...S.caps, ...S.gold, marginBottom: "0.75rem" }}>Curated for You</p>
              <h2 style={{ ...S.serif, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, ...S.text, lineHeight: 1.1 }}>
                Featured<br /><em>Collections</em>
              </h2>
            </div>
            <Link href="/shop" style={{ display: "flex", alignItems: "center", gap: "0.5rem", ...S.caps, fontSize: "0.6875rem", ...S.muted, textDecoration: "none" }}>
              View All <ArrowRight size={12} />
            </Link>
          </motion.div>

          <div className="col-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
            {collections.map((col, i) => (
              <motion.div key={col.name} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}>
                <Link href="/shop" style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ position: "relative", overflow: "hidden", borderRadius: 2, aspectRatio: "3/4", backgroundColor: "#111" }}>
                    <img src={col.image} alt={col.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.72) 0%, transparent 55%)" }} />
                    <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
                      <span style={{ backgroundColor: "#c9a96e", color: "#080808", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.3rem 0.65rem" }}>{col.tag}</span>
                    </div>
                    <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem" }}>
                      <p style={{ ...S.serif, fontSize: "1.25rem", ...S.text, fontWeight: 500 }}>{col.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "rgba(240,237,232,0.55)", marginTop: "0.2rem" }}>{col.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 768px) { .col-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ── AI PROCESS ───────────────────────────────────── */}
      <section style={{ padding: "7rem 0", backgroundColor: "#0d0d0d", borderTop: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: "5rem" }}>
            <p style={{ ...S.caps, ...S.gold, marginBottom: "1rem" }}>How It Works</p>
            <h2 style={{ ...S.serif, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, ...S.text }}>
              AI-Powered <em>Custom Fit</em>
            </h2>
            <p style={{ ...S.dim, marginTop: "1rem", maxWidth: 440, margin: "1rem auto 0", fontSize: "0.9375rem", lineHeight: 1.75 }}>
              Three steps to nails that were made — precisely — for you.
            </p>
          </motion.div>

          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, backgroundColor: "#1a1a1a" }}>
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.15 }}
                style={{ backgroundColor: "#0d0d0d", padding: "3rem 2.5rem" }}>
                <p style={{ ...S.serif, fontSize: "3.5rem", fontWeight: 400, color: "#1d1d1d", lineHeight: 1, marginBottom: "1.5rem" }}>{step.num}</p>
                <step.icon size={22} color="#c9a96e" style={{ marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 500, ...S.text, marginBottom: "0.75rem" }}>{step.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#5e5e5e", lineHeight: 1.8 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ── EDITORIAL SPLIT ──────────────────────────────── */}
      <section style={{ backgroundColor: "#080808" }}>
        <div className="split-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Image */}
          <div style={{ position: "relative", minHeight: 620, overflow: "hidden" }}>
            <img src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=900&h=1100&fit=crop&q=90"
              alt="Ombre Collection" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,8,0.25)" }} />
          </div>
          {/* Copy */}
          <motion.div {...fadeUp} style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "5rem 4rem", backgroundColor: "#0d0d0d" }}>
            <p style={{ ...S.caps, ...S.gold, marginBottom: "1.5rem" }}>The Difference</p>
            <h2 style={{ ...S.serif, fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 500, ...S.text, lineHeight: 1.15, marginBottom: "1.5rem" }}>
              Not just beautiful.<br /><em>Perfectly yours.</em>
            </h2>
            <p style={{ fontSize: "0.9375rem", ...S.dim, lineHeight: 1.9, marginBottom: "1.25rem" }}>
              Every DNNB set begins with your measurements. Our AI maps your nail bed&apos;s exact geometry — width, length, curvature — across all five fingers. The result? A set that sits flush, lifts zero, and lasts weeks.
            </p>
            <p style={{ fontSize: "0.9375rem", ...S.dim, lineHeight: 1.9, marginBottom: "2.5rem" }}>
              This isn&apos;t a sizing chart. It&apos;s technology built for beauty.
            </p>
            <Link href="/custom-fit" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", ...S.caps, fontSize: "0.75rem", fontWeight: 600, ...S.gold, textDecoration: "none", paddingBottom: "0.3rem", borderBottom: "1px solid #c9a96e", width: "fit-content" }}>
              Get Your Custom Fit <ArrowRight size={12} />
            </Link>
          </motion.div>
        </div>
        <style>{`@media (max-width: 768px) { .split-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section style={{ padding: "7rem 0", backgroundColor: "#080808", borderTop: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ ...S.caps, ...S.gold, marginBottom: "1rem" }}>Client Love</p>
            <h2 style={{ ...S.serif, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, ...S.text }}>
              What They&apos;re <em>Saying</em>
            </h2>
          </motion.div>

          <div className="reviews-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                style={{ backgroundColor: "#0f0f0f", border: "1px solid #1e1e1e", padding: "2.5rem" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: "1.5rem" }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={13} fill="#c9a96e" color="#c9a96e" />
                  ))}
                </div>
                <p style={{ ...S.serif, fontSize: "1rem", fontStyle: "italic", color: "#ccc8c0", lineHeight: 1.85, marginBottom: "1.5rem" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: "1.25rem" }}>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 500, ...S.text }}>{t.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#555555", marginTop: "0.2rem" }}>{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 768px) { .reviews-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "8rem 0", background: "linear-gradient(160deg, #0a0a08 0%, #0d0d0a 100%)", borderTop: "1px solid #1a1a1a" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60vw", height: "60vh", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,110,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem", textAlign: "center", position: "relative" }}>
          <motion.div {...fadeUp}>
            <p style={{ ...S.caps, ...S.gold, marginBottom: "1.5rem" }}>Ready?</p>
            <h2 style={{ ...S.serif, fontSize: "clamp(2.25rem, 5vw, 4rem)", fontWeight: 500, ...S.text, lineHeight: 1.1, marginBottom: "1.5rem" }}>
              Your perfect nails<br /><em>are one click away.</em>
            </h2>
            <p style={{ fontSize: "1rem", ...S.dim, lineHeight: 1.8, maxWidth: 460, margin: "0 auto 2.75rem" }}>
              Shop our collection or start your AI custom fitting today. Beauty this precise shouldn&apos;t be this easy — but it is.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/shop" style={{ ...S.btn, backgroundColor: "#c9a96e", color: "#080808" }}>
                Shop Now <ArrowRight size={14} />
              </Link>
              <Link href="/book" style={{ ...S.btn, border: "1px solid #2e2e2e", ...S.text }}>
                Book Appointment
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
