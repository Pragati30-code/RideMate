import Link from "next/link";

export default function CTABanner() {
  return (
    <section style={{ padding: "60px 32px" }}>
      <div style={{
        maxWidth:       1200,
        margin:         "0 auto",
        background:     "#2d2d2d",
        borderRadius:   32,
        padding:        "52px 48px",
        display:        "flex",
        flexWrap:       "wrap",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            24,
        position:       "relative",
        overflow:       "hidden",
      }}>
        {/* Background glows */}
        <div style={{
          position:   "absolute", right: -40, top: -40,
          width:      280, height: 280,
          background: "radial-gradient(circle, rgba(255,155,106,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        }}/>
        <div style={{
          position:   "absolute", left: 120, bottom: -60,
          width:      200, height: 200,
          background: "radial-gradient(circle, rgba(244,160,192,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        }}/>

        {/* Text */}
        <div style={{ position: "relative" }}>
          <div className="font-display" style={{
            fontSize:      "clamp(28px, 4vw, 44px)",
            fontWeight:    800,
            color:         "#fdf6ec",
            letterSpacing: "-1px",
            lineHeight:    1.15,
            marginBottom:  10,
          }}>
            Ready to share the ride? 🚗
          </div>
          <p className="font-body" style={{ color: "rgba(253,246,236,0.55)", fontSize: 16 }}>
            Join 500+ students already saving money and making friends.
          </p>
        </div>

        {/* Button */}
        <Link href="/register" style={{ position: "relative" }}>
          <button className="btn-cta">
            Get started for free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </Link>
      </div>
    </section>
  );
}