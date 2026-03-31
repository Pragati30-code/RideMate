import Link from "next/link";

export default function MyRideDashboardHeader() {
  return (
    <header
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(20px)",
        borderBottom: "1.5px solid rgba(255,255,255,0.9)",
        boxShadow: "0 2px 16px rgba(180,140,100,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: "#2d2d2d",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(45,45,45,0.18)",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13"
                  stroke="#fdf6ec"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <rect x="3" y="13" width="18" height="5" rx="2.5" fill="#fdf6ec" />
                <circle cx="7.5" cy="18" r="1.7" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1" />
                <circle cx="16.5" cy="18" r="1.7" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1" />
              </svg>
            </div>
            <span className="font-display" style={{ fontSize: 17, fontWeight: 700, color: "#2d2d2d", letterSpacing: "-0.3px" }}>
              RideMate
            </span>
          </Link>
          <span className="hidden sm:inline" style={{ color: "#c0b8b2", fontSize: 16 }}>·</span>
          <span className="hidden sm:inline font-display" style={{ fontSize: 16, fontWeight: 700, color: "#6b6560", letterSpacing: "-0.2px" }}>
            My Ride
          </span>
        </div>
        <Link href="/dashboard" style={{ textDecoration: "none", flexShrink: 0 }}>
          <button className="mrd-btn mrd-btn-dark" style={{ padding: "8px 14px", fontSize: 13, width: "auto" }}>
            <span className="hidden sm:inline">← Back to Dashboard</span>
            <span className="sm:hidden">← Back</span>
          </button>
        </Link>
      </div>
    </header>
  );
}
