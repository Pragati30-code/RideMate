import Link from "next/link";

export default function AuthBrand() {
  return (
    <Link
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: "#2d2d2d",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(45,45,45,0.2)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
      <span className="font-display" style={{ fontSize: 19, fontWeight: 700, color: "#2d2d2d", letterSpacing: "-0.4px" }}>
        RideMate
      </span>
    </Link>
  );
}
