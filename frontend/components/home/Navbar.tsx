import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 relative z-20 fade-up-1">

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
          style={{ color: "#2d2d2d", letterSpacing: "-0.5px", fontSize: "clamp(16px, 4vw, 24px)" }}
        >
          RideMate
        </span>
      </div>

      {/* Buttons — inline styles so no btn-main class conflicts */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(20px)",
        border: "1.5px solid rgba(255,255,255,0.9)",
        borderRadius: 50,
        padding: "6px 6px 6px 12px",
        boxShadow: "0 4px 20px rgba(180,140,100,0.1)",
      }}>

        {/* Log in — hidden on mobile */}
        <Link href="/login" className="hidden sm:block">
          <button style={{
            background: "transparent",
            border: "none",
            color: "#555",
            fontSize: 14,
            fontFamily: "var(--font-dm), sans-serif",
            fontWeight: 500,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 50,
            whiteSpace: "nowrap",
          }}>
            Log in
          </button>
        </Link>

        {/* Sign up — always visible, compact on mobile */}
        <Link href="/register">
          <button style={{
            background: "#2d2d2d",
            color: "#fdf6ec",
            border: "none",
            borderRadius: 50,
            fontFamily: "var(--font-dm), sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            padding: "8px 16px",
            fontSize: 13,
            lineHeight: 1,
          }}>
            Sign up ✦
          </button>
        </Link>
      </div>
    </nav>
  );
}