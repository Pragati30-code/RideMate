import Link from "next/link";
import CarIllustration from "./CarIllustration";

const stats = [
  { value: "500+", label: "Active riders" },
  { value: "₹150",   label: "Avg. saved / ride" },
  { value: "4.9 ★",  label: "Student rating" },
];

export default function HeroSection() {
  return (
    <main className="relative px-4 sm:px-8 pb-0 pt-8" style={{ maxWidth: 1200, margin: "0 auto" }}>

      {/* Background blobs */}
      <div style={{
        position: "absolute", top: -60, right: -80, width: 500, height: 500,
        background: "radial-gradient(circle, rgba(255,180,120,0.18) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }}/>
      <div style={{
        position: "absolute", top: 200, left: -100, width: 400, height: 400,
        background: "radial-gradient(circle, rgba(255,200,220,0.2) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }}/>

      {/* Doodle dots */}
      <div className="doodle-dot" style={{ width: 12, height: 12, background: "#ff9b6a", top: 40,  left: "15%" }}/>
      <div className="doodle-dot" style={{ width: 8,  height: 8,  background: "#ffb347", top: 120, left: "8%" }}/>
      <div className="doodle-dot" style={{ width: 16, height: 16, background: "#f4a0c0", top: 80,  right: "12%" }}/>
      <div className="doodle-dot" style={{ width: 10, height: 10, background: "#ff9b6a", top: 200, right: "25%" }}/>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center" style={{ minHeight: "80vh" }}>

        {/* Left — Text content */}
        <div style={{ paddingBottom: 40 }}>

          {/* Badge */}
          <div className="sticker-badge fade-up-1" style={{ marginBottom: 28 }}>
            <span className="dot-blink" style={{ width: 7, height: 7, background: "white", borderRadius: "50%", display: "inline-block" }}/>
            Campus rides, made delightful
          </div>

          {/* Heading */}
          <h1 className="font-display fade-up-2" style={{
            fontSize: "clamp(48px, 6vw, 80px)",
            fontWeight: 900,
            lineHeight: 1.05,
            color: "#1e1e1e",
            letterSpacing: "-2px",
            marginBottom: 24
          }}>
            Ride together,{" "}
            <span style={{
              fontStyle: "italic",
              background: "linear-gradient(135deg, #ff9b6a, #ff6b9d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              save more
            </span>
            ,{" "}<br/>
            stress less.
          </h1>

          {/* Subtext */}
          <p className="font-body fade-up-3" style={{
            fontSize: 18, lineHeight: 1.7,
            color: "#6b6560", maxWidth: 440, marginBottom: 36
          }}>
            The Best way to commute around campus 🌸 Find rides, share costs, and vibe with fellow students going your way.
          </p>

          {/* CTA buttons */}
          <div className="fade-up-4" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
            <Link href="/register">
              <button className="btn-main">
                Start your journey
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-outline">
                I have an account
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="fade-up-4" style={{
            display: "flex", gap: 24, flexWrap: "wrap",
            borderTop: "1.5px solid rgba(45,45,45,0.08)",
            paddingTop: 28
          }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div className="font-display" style={{ fontSize: 26, fontWeight: 700, color: "#1e1e1e" }}>{s.value}</div>
                <div className="font-body"    style={{ fontSize: 13, color: "#999", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Car + floating cards */}
        <CarIllustration />
      </div>
    </main>
  );
}