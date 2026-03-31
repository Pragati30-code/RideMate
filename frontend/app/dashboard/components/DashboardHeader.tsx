import Link from "next/link";
import { UserCircle2 } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header style={{
      background: "rgba(255,255,255,0.75)",
      backdropFilter: "blur(20px)",
      borderBottom: "1.5px solid rgba(255,255,255,0.9)",
      boxShadow: "0 2px 16px rgba(180,140,100,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>

        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <div style={{
            width: 36, height: 36,
            background: "#2d2d2d",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 10px rgba(45,45,45,0.18)",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13" stroke="#fdf6ec" strokeWidth="1.8" strokeLinecap="round"/>
              <rect x="3" y="13" width="18" height="5" rx="2.5" fill="#fdf6ec"/>
              <circle cx="7.5" cy="18" r="1.7" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1"/>
              <circle cx="16.5" cy="18" r="1.7" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1"/>
            </svg>
          </div>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#2d2d2d", letterSpacing: "-0.4px" }}>
            RideMate
          </span>
        </Link>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/my-ride-dashboard" style={{ textDecoration: "none" }}>
            <button style={{
              background: "transparent",
              border: "1.5px solid rgba(45,45,45,0.15)",
              borderRadius: 50,
              padding: "8px 18px",
              fontFamily: "var(--font-dm), sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "#3a3530",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(45,45,45,0.06)")}
            onMouseOut={e => (e.currentTarget.style.background = "transparent")}
            >
              My Ride Dashboard
            </button>
          </Link>

          <Link href="/user-profile" aria-label="Profile" title="Profile" style={{ textDecoration: "none" }}>
            <div style={{
              width: 38, height: 38,
              borderRadius: "50%",
              border: "1.5px solid rgba(45,45,45,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s",
              background: "rgba(255,255,255,0.6)",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(45,45,45,0.06)")}
            onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.6)")}
            >
              <UserCircle2 size={20} color="#3a3530" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}