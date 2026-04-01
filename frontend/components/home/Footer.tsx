export default function Footer() {
  return (
    <footer style={{ borderTop: "1.5px solid rgba(45,45,45,0.08)", padding: "28px 32px" }}>
      <div style={{
        maxWidth:       1200,
        margin:         "0 auto",
        display:        "flex",
        flexWrap:       "wrap",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            12,
      }}>
        {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div style={{
          width: 38, height: 38,
          background: "#2d2d2d",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(45,45,45,0.2)",
          flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13" stroke="#fdf6ec" strokeWidth="1.8" strokeLinecap="round"/>
            <rect x="3" y="13" width="18" height="5" rx="2.5" fill="#fdf6ec" opacity="0.95"/>
            <circle cx="7.5" cy="18" r="2" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1.2"/>
            <circle cx="16.5" cy="18" r="2" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1.2"/>
            <path d="M3 15h18" stroke="#2d2d2d" strokeWidth="0.8" opacity="0.3"/>
          </svg>
        </div>
        <span
          className="font-display font-bold"
          style={{ color: "#2d2d2d", letterSpacing: "-0.5px", fontSize: "clamp(14px, 4vw, 20px)" }}
        >
          RideMate
        </span>
      </div>

        {/* Copyright */}
        <p className="font-body" style={{ color: "#aaa", fontSize: 13 }}>
          © 2026 RideMate — Driven by Connection, Built by Pragati 🌷
        </p>
      </div>
    </footer>
  );
}