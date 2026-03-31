"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, getAuthHeaders, getAuthToken, clearAuthSession } from "@/lib/api";
import { ArrowLeft, LogOut } from "lucide-react";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  rideOtp?: string;
  phoneNumber?: string;
  studentId?: string;
  gender?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  drivingLicense?: string;
  verifiedDriver?: boolean;
  role?: string;
  verificationStatus?: string;
};

type DriverStatus = {
  isVerifiedDriver: boolean;
  verificationStatus: string;
  vehicleNumber: string;
  vehicleModel: string;
  drivingLicense: string;
  detailsSubmitted: boolean;
};

const styles = `
  .font-display { font-family: var(--font-playfair), Georgia, serif; }
  .font-body    { font-family: var(--font-dm), sans-serif; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up-1 { animation: fade-up 0.5s ease-out 0.05s both; }
  .fade-up-2 { animation: fade-up 0.5s ease-out 0.15s both; }
  .fade-up-3 { animation: fade-up 0.5s ease-out 0.25s both; }

  .up-card {
    background: rgba(255,255,255,0.68);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255,255,255,0.95);
    border-radius: 20px;
    padding: 22px 24px;
    box-shadow: 0 4px 20px rgba(180,140,100,0.08);
  }

  .up-section {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.9);
    border-radius: 24px;
    padding: 28px 32px;
    box-shadow: 0 4px 24px rgba(180,140,100,0.07);
  }

  .up-field {
    background: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(45,45,45,0.08);
    border-radius: 14px;
    padding: 12px 16px;
    transition: box-shadow 0.2s;
  }
  .up-field:hover { box-shadow: 0 4px 14px rgba(180,140,100,0.1); }

  .up-label {
    font-family: var(--font-dm), sans-serif;
    font-size: 11px; font-weight: 600; color: #8a8380;
    letter-spacing: 0.5px; text-transform: uppercase;
    display: block; margin-bottom: 4px;
  }

  .up-value {
    font-family: var(--font-dm), sans-serif;
    font-size: 14px; font-weight: 500; color: #1e1e1e;
    word-break: break-all;
  }

  .up-btn {
    display: inline-flex; align-items: center; gap: 7px;
    border: none; border-radius: 50px; cursor: pointer;
    font-family: var(--font-dm), sans-serif; font-weight: 600;
    font-size: 13px; padding: 9px 20px; transition: all 0.22s;
    white-space: nowrap;
  }
  .up-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .up-btn-dark { background: #2d2d2d; color: #fdf6ec; }
  .up-btn-dark:hover:not(:disabled) { background: #1a1a1a; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(45,45,45,0.18); }
  .up-btn-red  { background: rgba(220,80,80,0.08); color: #b71c1c; border: 1.5px solid rgba(220,80,80,0.22); }
  .up-btn-red:hover:not(:disabled)  { background: rgba(220,80,80,0.15); transform: translateY(-1px); }

  .up-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 50px;
    font-family: var(--font-dm), sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.3px; text-transform: uppercase;
  }
  .badge-verified   { background: rgba(100,200,120,0.12); color: #2e7d32; border: 1px solid rgba(100,200,120,0.28); }
  .badge-pending    { background: rgba(255,180,50,0.12);  color: #a07010; border: 1px solid rgba(255,180,50,0.25); }
  .badge-unverified { background: rgba(45,45,45,0.07);    color: #7a7370; border: 1px solid rgba(45,45,45,0.12); }

  .up-avatar {
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg, #ff9b6a, #f4a0c0);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-playfair), Georgia, serif;
    font-size: 26px; font-weight: 700; color: white;
    box-shadow: 0 6px 20px rgba(255,155,106,0.3);
    flex-shrink: 0;
  }

  .up-divider { border: none; border-top: 1.5px solid rgba(45,45,45,0.07); margin: 4px 0; }
`;

function verificationBadgeClass(status?: string, isVerified?: boolean) {
  if (isVerified) return "badge-verified";
  if (status === "PENDING") return "badge-pending";
  return "badge-unverified";
}

export default function UserProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [driverStatus, setDriverStatus] = useState<DriverStatus | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    clearAuthSession();
    router.replace("/login");
  };

  useEffect(() => {
    if (!getAuthToken()) { router.replace("/login"); return; }
    const load = async () => {
      setLoading(true); setError("");
      try {
        const [pRes, sRes] = await Promise.all([
          fetch(apiUrl("/auth/me"), { headers: getAuthHeaders() }),
          fetch(apiUrl("/users/driver-status"), { headers: getAuthHeaders() }),
        ]);
        if (!pRes.ok || !sRes.ok) throw new Error();
        setProfile((await pRes.json()) as UserProfile);
        setDriverStatus((await sRes.json()) as DriverStatus);
      } catch {
        setError("Session expired.");
        clearAuthSession();
        router.replace("/login");
      } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fdf6ec 0%,#fef3e8 50%,#fdf0f8 100%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{styles}</style>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>👤</div>
          <p className="font-body" style={{ color:"#a09890", fontSize:15 }}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fdf6ec 0%,#fef3e8 50%,#fdf0f8 100%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{styles}</style>
        <p className="font-body" style={{ color:"#a09890" }}>{error || "Profile not available"}</p>
      </div>
    );
  }

  const initials = profile.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const personalFields = [
    { label: "Full Name",    value: profile.name },
    { label: "Email",        value: profile.email },
    { label: "Ride OTP",     value: profile.rideOtp || "-" },
    { label: "Phone Number", value: profile.phoneNumber || "-" },
    { label: "Student ID",   value: profile.studentId || "-" },
    { label: "Gender",       value: profile.gender || "-" },
    { label: "Role",         value: profile.role || "-" },
  ];

  const driverFields = [
    { label: "Vehicle Number",  value: profile.vehicleNumber || driverStatus?.vehicleNumber || "-" },
    { label: "Vehicle Model",   value: profile.vehicleModel || driverStatus?.vehicleModel || "-" },
    { label: "Driving License", value: profile.drivingLicense || driverStatus?.drivingLicense || "-" },
    { label: "Details Submitted", value: driverStatus?.detailsSubmitted ? "Yes" : "No" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#fdf6ec 0%,#fef3e8 55%,#fdf0f8 100%)" }}>
      <style>{styles}</style>

      {/* Header */}
      <header style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", borderBottom:"1.5px solid rgba(255,255,255,0.9)", boxShadow:"0 2px 16px rgba(180,140,100,0.08)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:860, margin:"0 auto", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
            <div style={{ width:34, height:34, background:"#2d2d2d", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 10px rgba(45,45,45,0.18)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13" stroke="#fdf6ec" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="3" y="13" width="18" height="5" rx="2.5" fill="#fdf6ec"/>
                <circle cx="7.5" cy="18" r="1.7" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1"/>
                <circle cx="16.5" cy="18" r="1.7" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1"/>
              </svg>
            </div>
            <span className="font-display" style={{ fontSize:17, fontWeight:700, color:"#2d2d2d", letterSpacing:"-0.3px" }}>RideMate</span>
          </Link>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button className="up-btn up-btn-red" onClick={handleLogout} disabled={loggingOut}>
              <LogOut size={14} />
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
            <Link href="/dashboard" style={{ textDecoration:"none" }}>
              <button className="up-btn up-btn-dark">
                <ArrowLeft size={14} />
                <span className="hidden md:inline" style={{ display:"inline" }}>Dashboard</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:860, margin:"0 auto", padding:"32px 24px", display:"flex", flexDirection:"column", gap:24 }}>

        {/* Profile hero card */}
        <div className="up-card fade-up-1" style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div className="up-avatar">{initials}</div>
          <div style={{ flex:1, minWidth:180 }}>
            <h1 className="font-display" style={{ fontSize:26, fontWeight:800, color:"#1e1e1e", letterSpacing:"-0.8px", marginBottom:4 }}>
              {profile.name}
            </h1>
            <p className="font-body" style={{ fontSize:14, color:"#a09890", marginBottom:10 }}>{profile.email}</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {/* Role badge */}
              <span className="up-badge" style={{ background:"rgba(255,155,106,0.1)", color:"#cc6b3d", border:"1px solid rgba(255,155,106,0.25)" }}>
                {profile.role || "Student"}
              </span>
              {/* Driver verification badge */}
              <span className={`up-badge ${verificationBadgeClass(profile.verificationStatus, profile.verifiedDriver)}`}>
                {profile.verifiedDriver
                  ? "✓ Verified Driver"
                  : profile.verificationStatus === "PENDING"
                  ? "⏳ Verification Pending"
                  : "Not a Driver"}
              </span>
            </div>
          </div>
          {/* ID chip */}
          <div style={{ background:"rgba(45,45,45,0.05)", border:"1.5px solid rgba(45,45,45,0.08)", borderRadius:12, padding:"8px 14px", textAlign:"center" }}>
            <span className="up-label" style={{ marginBottom:2 }}>User ID</span>
            <p className="font-display" style={{ fontSize:18, fontWeight:700, color:"#1e1e1e" }}>#{profile.id}</p>
          </div>
        </div>

        {/* Personal details */}
        <div className="up-section fade-up-2">
          <h2 className="font-display" style={{ fontSize:19, fontWeight:800, color:"#1e1e1e", letterSpacing:"-0.4px", marginBottom:20 }}>
            Personal Details
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:12 }}>
            {personalFields.map(({ label, value }) => (
              <div key={label} className="up-field">
                <span className="up-label">{label}</span>
                <span className="up-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Driver details */}
        <div className="up-section fade-up-3">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginBottom:20 }}>
            <h2 className="font-display" style={{ fontSize:19, fontWeight:800, color:"#1e1e1e", letterSpacing:"-0.4px" }}>
              Driver Details
            </h2>
            <span className={`up-badge ${verificationBadgeClass(driverStatus?.verificationStatus, driverStatus?.isVerifiedDriver)}`}>
              {driverStatus?.isVerifiedDriver
                ? "✓ Verified"
                : driverStatus?.verificationStatus === "PENDING"
                ? "⏳ Pending Approval"
                : driverStatus?.detailsSubmitted
                ? "Submitted"
                : "Not Submitted"}
            </span>
          </div>

          {!driverStatus?.detailsSubmitted ? (
            <div style={{ background:"rgba(255,180,50,0.07)", border:"1.5px solid rgba(255,180,50,0.2)", borderRadius:14, padding:"16px 20px" }}>
              <p className="font-body" style={{ fontSize:14, color:"#a07010", lineHeight:1.6 }}>
                No driver details submitted yet. Go to <strong>Make a Ride</strong> on the dashboard to submit your vehicle details for verification.
              </p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:12 }}>
              {driverFields.map(({ label, value }) => (
                <div key={label} className="up-field">
                  <span className="up-label">{label}</span>
                  <span className="up-value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}