"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Map, MapControls, MapMarker,
  MarkerContent, MarkerLabel, type MapRef,
} from "@/components/ui/map";
import { apiUrl, clearAuthSession, getAuthHeaders, getAuthToken } from "@/lib/api";
import { CurrentUserBooking, DriverRideBooking } from "../dashboard/types";

const DEFAULT_MAP_CENTER: [number, number] = [77.2090, 28.6139];

const styles = `
  .font-display { font-family: var(--font-playfair), Georgia, serif; }
  .font-body    { font-family: var(--font-dm), sans-serif; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fade-up 0.5s ease-out both; }
  .spin    { animation: spin 0.8s linear infinite; }

  .mrd-card {
    background: rgba(255,255,255,0.68);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255,255,255,0.95);
    border-radius: 20px;
    padding: 22px;
    box-shadow: 0 4px 20px rgba(180,140,100,0.08);
  }

  .mrd-section {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.9);
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 4px 24px rgba(180,140,100,0.07);
  }

  .mrd-label {
    font-family: var(--font-dm), sans-serif;
    font-size: 11px; font-weight: 600; color: #8a8380;
    letter-spacing: 0.5px; text-transform: uppercase;
    display: block; margin-bottom: 4px;
  }

  .mrd-value {
    font-family: var(--font-dm), sans-serif;
    font-size: 14px; color: #3a3530;
  }

  .mrd-btn {
    display: inline-flex; align-items: center; gap: 7px;
    border: none; border-radius: 50px; cursor: pointer;
    font-family: var(--font-dm), sans-serif; font-weight: 600;
    font-size: 13px; padding: 10px 22px; transition: all 0.22s;
    white-space: nowrap; width: 100%; justify-content: center;
  }
  .mrd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .mrd-btn-dark   { background: #2d2d2d; color: #fdf6ec; }
  .mrd-btn-dark:hover:not(:disabled)   { background: #1a1a1a; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(45,45,45,0.18); }
  .mrd-btn-accent { background: #ff9b6a; color: white; }
  .mrd-btn-accent:hover:not(:disabled) { background: #f08550; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,155,106,0.28); }
  .mrd-btn-red    { background: rgba(220,80,80,0.1); color: #b71c1c; border: 1.5px solid rgba(220,80,80,0.25); }
  .mrd-btn-red:hover:not(:disabled)    { background: rgba(220,80,80,0.18); transform: translateY(-1px); }
  .mrd-btn-green  { background: rgba(100,200,120,0.12); color: #2e7d32; border: 1.5px solid rgba(100,200,120,0.3); }
  .mrd-btn-green:hover:not(:disabled)  { background: rgba(100,200,120,0.2); transform: translateY(-1px); }

  .mrd-stat-card {
    background: rgba(255,255,255,0.68);
    backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.95);
    border-radius: 18px; padding: 18px 20px;
    box-shadow: 0 4px 16px rgba(180,140,100,0.07);
  }

  .mrd-map {
    height: 300px; overflow: hidden;
    border-radius: 16px;
    border: 1.5px solid rgba(45,45,45,0.1);
  }

  .mrd-table { width: 100%; border-collapse: collapse; }
  .mrd-table th {
    font-family: var(--font-dm), sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.4px;
    text-transform: uppercase; color: #8a8380;
    padding: 12px 16px; text-align: left;
    background: rgba(255,255,255,0.6);
    border-bottom: 1.5px solid rgba(45,45,45,0.07);
  }
  .mrd-table td {
    font-family: var(--font-dm), sans-serif;
    font-size: 13px; color: #3a3530;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(45,45,45,0.06);
  }
  .mrd-table tr:last-child td { border-bottom: none; }
  .mrd-table tr:hover td { background: rgba(255,155,106,0.04); }

  .mrd-route-block {
    background: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(45,45,45,0.08);
    border-radius: 12px; padding: 10px 14px;
  }

  .mrd-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 50px;
    font-family: var(--font-dm), sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .badge-active     { background: rgba(100,200,120,0.12); color: #2e7d32; border: 1px solid rgba(100,200,120,0.28); }
  .badge-progress   { background: rgba(80,150,220,0.12);  color: #1a5ea8; border: 1px solid rgba(80,150,220,0.28); }
  .badge-ended      { background: rgba(45,45,45,0.07);    color: #7a7370; border: 1px solid rgba(45,45,45,0.12); }
  .badge-confirmed  { background: rgba(80,150,220,0.1);   color: #1a5ea8; border: 1px solid rgba(80,150,220,0.2); }
  .badge-picked     { background: rgba(255,180,50,0.12);  color: #a07010; border: 1px solid rgba(255,180,50,0.25); }
  .badge-dropped    { background: rgba(100,200,120,0.12); color: #2e7d32; border: 1px solid rgba(100,200,120,0.25); }
  .badge-paid       { background: rgba(100,200,120,0.12); color: #2e7d32; border: 1px solid rgba(100,200,120,0.25); }
  .badge-unpaid     { background: rgba(255,180,50,0.12);  color: #a07010; border: 1px solid rgba(255,180,50,0.25); }

  .mrd-fare-box {
    background: rgba(255,155,106,0.08);
    border: 1.5px solid rgba(255,155,106,0.2);
    border-radius: 14px; padding: 14px 18px;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  }
`;

function statusBadgeClass(status?: string) {
  switch (status) {
    case "ACTIVE":       return "badge-active";
    case "IN_PROGRESS":  return "badge-progress";
    case "CONFIRMED":    return "badge-confirmed";
    case "PICKED_UP":    return "badge-picked";
    case "DROPPED":      return "badge-dropped";
    default:             return "badge-ended";
  }
}

export default function MyRideDashboardPage() {
  const router = useRouter();
  const mapRef = useRef<MapRef | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentBooking, setCurrentBooking] = useState<CurrentUserBooking | null>(null);
  const [participants, setParticipants] = useState<DriverRideBooking[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  const loadRazorpayScript = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if ((window as Window & { Razorpay?: unknown }).Razorpay) return true;
    return new Promise(resolve => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true); s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  };

  const dropMarkers = useMemo(
    () => participants.filter(b => typeof b.dropLatitude === "number" && typeof b.dropLongitude === "number"),
    [participants]
  );

  const passengerStats = useMemo(() => ({
    total:     participants.length,
    confirmed: participants.filter(b => b.status === "CONFIRMED").length,
    pickedUp:  participants.filter(b => b.status === "PICKED_UP").length,
    dropped:   participants.filter(b => b.status === "DROPPED").length,
  }), [participants]);

  const fetchCurrentBooking = async (): Promise<CurrentUserBooking | null> => {
    const res = await fetch(apiUrl("/bookings/my-current"), { headers: getAuthHeaders() });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error("Could not load booking");
    return (await res.json()) as CurrentUserBooking;
  };

  const fetchParticipants = async (rideId: number) => {
    setLoadingParticipants(true);
    try {
      const res = await fetch(apiUrl(`/bookings/ride/${rideId}/participants`), { headers: getAuthHeaders() });
      if (!res.ok) { setError("Unable to load participants."); setParticipants([]); return; }
      setParticipants((await res.json()) as DriverRideBooking[]);
    } catch { setError("Unable to load participants."); setParticipants([]); }
    finally { setLoadingParticipants(false); }
  };

  const refresh = async () => {
    setLoading(true); setError(""); setMessage("");
    try {
      const booking = await fetchCurrentBooking();
      setCurrentBooking(booking);
      if (booking?.ride?.id) await fetchParticipants(booking.ride.id);
      else setParticipants([]);
    } catch { clearAuthSession(); router.replace("/login"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!getAuthToken()) { router.replace("/login"); return; }
    void refresh();
  }, [router]);

  useEffect(() => {
    if (!mapRef.current || !currentBooking?.ride) return;
    const points: [number, number][] = [];
    const r = currentBooking.ride;
    if (typeof r.sourceLongitude === "number" && typeof r.sourceLatitude === "number")
      points.push([r.sourceLongitude, r.sourceLatitude]);
    dropMarkers.forEach(b => points.push([b.dropLongitude as number, b.dropLatitude as number]));
    if (!points.length) return;
    if (points.length === 1) { mapRef.current.flyTo({ center: points[0], zoom: 13, duration: 600 }); return; }
    const lons = points.map(p => p[0]), lats = points.map(p => p[1]);
    mapRef.current.fitBounds([[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]], { padding: 60, duration: 700, maxZoom: 14 });
  }, [currentBooking, dropMarkers]);

  const handleCancelBooking = async () => {
    if (!currentBooking) return;
    setCancelling(true); setError(""); setMessage("");
    try {
      const res = await fetch(apiUrl(`/bookings/${currentBooking.id}/cancel`), { method: "PUT", headers: getAuthHeaders() });
      if (!res.ok) { setError("Unable to cancel booking."); return; }
      setMessage("Booking cancelled successfully.");
      await refresh();
    } catch { setError("Unable to cancel booking."); }
    finally { setCancelling(false); }
  };

  const handlePayWithRazorpay = async () => {
    if (!currentBooking) return;
    setPaying(true); setError(""); setMessage("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { setError("Unable to load Razorpay checkout."); return; }
      const orderRes = await fetch(apiUrl(`/bookings/${currentBooking.id}/payments/razorpay/order`), { method: "POST", headers: getAuthHeaders() });
      if (!orderRes.ok) { setError("Unable to start payment."); return; }
      const orderData = (await orderRes.json()) as { keyId: string; orderId: string; amount: number; currency: string };
      const Razorpay = (window as Window & { Razorpay: new (o: Record<string, unknown>) => { open: () => void } }).Razorpay;
      new Razorpay({
        key: orderData.keyId, amount: orderData.amount, currency: orderData.currency,
        name: "RideMate", description: `Booking #${currentBooking.id}`, order_id: orderData.orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch(apiUrl(`/bookings/${currentBooking.id}/payments/razorpay/verify`), {
            method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature }),
          });
          if (!verifyRes.ok) { setError("Payment verification failed."); return; }
          setMessage("Payment successful! 🎉"); await refresh();
        },
        prefill: { name: currentBooking.user?.name || "", email: currentBooking.user?.email || "", contact: currentBooking.user?.phoneNumber || "" },
        theme: { color: "#ff9b6a" },
        modal: { ondismiss: () => setMessage("Payment window closed.") },
      }).open();
    } catch { setError("Unable to process payment."); }
    finally { setPaying(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fdf6ec 0%,#fef3e8 50%,#fdf0f8 100%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{styles}</style>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🌸</div>
          <p className="font-body" style={{ color:"#a09890", fontSize:15 }}>Loading your ride dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#fdf6ec 0%,#fef3e8 55%,#fdf0f8 100%)" }}>
      <style>{styles}</style>

      {/* Header */}
      <header style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", borderBottom:"1.5px solid rgba(255,255,255,0.9)", boxShadow:"0 2px 16px rgba(180,140,100,0.08)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
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
            <span style={{ color:"#c0b8b2", fontSize:16 }}>·</span>
            <span className="font-display" style={{ fontSize:16, fontWeight:700, color:"#6b6560", letterSpacing:"-0.2px" }}>My Ride</span>
          </div>
          <Link href="/dashboard" style={{ textDecoration:"none" }}>
            <button className="mrd-btn mrd-btn-dark" style={{ padding:"8px 18px", fontSize:13, width:"auto" }}>← Back to Dashboard</button>
          </Link>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px", display:"flex", flexDirection:"column", gap:24 }}>

        {/* Toasts */}
        {error && (
          <div style={{ background:"rgba(220,80,80,0.07)", border:"1.5px solid rgba(220,80,80,0.2)", borderRadius:14, padding:"12px 18px", fontFamily:"var(--font-dm),sans-serif", fontSize:14, color:"#c0392b", display:"flex", gap:8 }}>
            ⚠️ {error}
          </div>
        )}
        {message && (
          <div style={{ background:"rgba(100,200,120,0.08)", border:"1.5px solid rgba(100,200,120,0.22)", borderRadius:14, padding:"12px 18px", fontFamily:"var(--font-dm),sans-serif", fontSize:14, color:"#2e7d32", display:"flex", gap:8 }}>
            ✅ {message}
          </div>
        )}

        {!currentBooking && (
          <div className="mrd-section">
            <p className="font-body" style={{ color:"#a09890", fontSize:15 }}>No active booking found. Book a ride from your dashboard to see it here.</p>
          </div>
        )}

        {currentBooking && (
          <>
            {/* Ride ID pill */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.7)", border:"1.5px solid rgba(45,45,45,0.1)", borderRadius:50, padding:"6px 16px", alignSelf:"flex-start" }}>
              <span className="mrd-label" style={{ marginBottom:0 }}>Ride</span>
              <span className="font-display" style={{ fontSize:15, fontWeight:700, color:"#1e1e1e" }}>#{currentBooking.ride.id}</span>
              <span className={`mrd-status-badge ${statusBadgeClass(currentBooking.ride.status)}`}>{currentBooking.ride.status}</span>
            </div>

            {/* Route + Driver + Your stops + Actions */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:16 }}>

              {/* Route */}
              <div className="mrd-card">
                <span className="mrd-label">Route</span>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:10 }}>
                  <div className="mrd-route-block">
                    <span className="mrd-label" style={{ marginBottom:2 }}>From</span>
                    <p className="font-body" style={{ fontSize:14, fontWeight:600, color:"#1e1e1e" }}>{currentBooking.ride.source}</p>
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", color:"#ff9b6a", fontSize:18 }}>↓</div>
                  <div className="mrd-route-block">
                    <span className="mrd-label" style={{ marginBottom:2 }}>To</span>
                    <p className="font-body" style={{ fontSize:14, fontWeight:600, color:"#1e1e1e" }}>{currentBooking.ride.destination}</p>
                  </div>
                </div>
              </div>

              {/* Driver */}
              <div className="mrd-card" style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <span className="mrd-label">Driver</span>
                <p className="font-display" style={{ fontSize:17, fontWeight:700, color:"#1e1e1e", marginBottom:4 }}>{currentBooking.ride.driver?.name || "-"}</p>
                {[
                  { l:"Email",   v: currentBooking.ride.driver?.email },
                  { l:"Phone",   v: currentBooking.ride.driver?.phoneNumber },
                  { l:"Gender",  v: currentBooking.ride.driver?.gender },
                  { l:"Vehicle", v: `${currentBooking.ride.driver?.vehicleModel || "-"} · ${currentBooking.ride.driver?.vehicleNumber || "-"}` },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <span className="mrd-label" style={{ marginBottom:0 }}>{l} </span>
                    <span className="mrd-value">{v || "-"}</span>
                  </div>
                ))}
              </div>

              {/* Your stops */}
              <div className="mrd-card" style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <span className="mrd-label">Your Journey</span>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <div className="mrd-route-block">
                    <span className="mrd-label" style={{ marginBottom:2 }}>Pickup</span>
                    <p className="font-body" style={{ fontSize:13, color:"#1e1e1e", fontWeight:500 }}>{currentBooking.pickupName || "-"}</p>
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", color:"#ff9b6a" }}>↓</div>
                  <div className="mrd-route-block">
                    <span className="mrd-label" style={{ marginBottom:2 }}>Drop</span>
                    <p className="font-body" style={{ fontSize:13, color:"#1e1e1e", fontWeight:500 }}>{currentBooking.dropName || "-"}</p>
                  </div>
                </div>
                <div className="mrd-fare-box">
                  <div>
                    <span className="mrd-label" style={{ marginBottom:0 }}>Seats</span>
                    <p className="font-display" style={{ fontSize:20, fontWeight:700, color:"#1e1e1e" }}>{currentBooking.seatsBooked}</p>
                  </div>
                  <div>
                    <span className="mrd-label" style={{ marginBottom:0 }}>Fare</span>
                    <p className="font-display" style={{ fontSize:20, fontWeight:700, color:"#cc6b3d" }}>
                      ₹{typeof currentBooking.estimatedFare === "number" ? currentBooking.estimatedFare.toFixed(2) : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="mrd-label" style={{ marginBottom:0 }}>Payment</span>
                    <span className={`mrd-status-badge ${currentBooking.paymentStatus === "PAID" ? "badge-paid" : "badge-unpaid"}`}>
                      {currentBooking.paymentStatus || "UNPAID"}
                    </span>
                  </div>
                </div>
                {currentBooking.paymentId && (
                  <p className="font-body" style={{ fontSize:12, color:"#a09890" }}>Payment ID: {currentBooking.paymentId}</p>
                )}
              </div>

              {/* Actions */}
              <div className="mrd-card" style={{ display:"flex", flexDirection:"column", gap:12, justifyContent:"space-between" }}>
                <div>
                  <span className="mrd-label">Actions</span>
                  <p className="font-body" style={{ fontSize:13, color:"#a09890", marginTop:6, lineHeight:1.6 }}>
                    {currentBooking.status === "DROPPED" && currentBooking.paymentStatus !== "PAID"
                      ? "Your ride is complete. Pay now to finish."
                      : currentBooking.status === "DROPPED"
                      ? "Ride complete and payment done. Thanks for riding! 🌸"
                      : "Payment unlocks once the driver marks your drop-off."}
                  </p>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {currentBooking.status === "DROPPED" && currentBooking.paymentStatus !== "PAID" && (
                    <button className="mrd-btn mrd-btn-accent" onClick={handlePayWithRazorpay} disabled={paying}>
                      {paying ? (
                        <><svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Opening…</>
                      ) : "💳 Pay with Razorpay"}
                    </button>
                  )}
                  {currentBooking.status === "CONFIRMED" && (
                    <button className="mrd-btn mrd-btn-red" onClick={handleCancelBooking} disabled={cancelling}>
                      {cancelling ? "Cancelling…" : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mrd-section">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h2 className="font-display" style={{ fontSize:19, fontWeight:800, color:"#1e1e1e", letterSpacing:"-0.4px" }}>Live Passenger Map</h2>
                <span className="font-body" style={{ fontSize:12, color:"#a09890" }}>Source + all passenger drops</span>
              </div>
              <div className="mrd-map">
                <Map
                  ref={mapRef}
                  center={typeof currentBooking.ride.sourceLongitude === "number" && typeof currentBooking.ride.sourceLatitude === "number"
                    ? [currentBooking.ride.sourceLongitude, currentBooking.ride.sourceLatitude]
                    : DEFAULT_MAP_CENTER}
                  zoom={10} theme="light"
                >
                  {typeof currentBooking.ride.sourceLongitude === "number" && typeof currentBooking.ride.sourceLatitude === "number" && (
                    <MapMarker longitude={currentBooking.ride.sourceLongitude} latitude={currentBooking.ride.sourceLatitude}>
                      <MarkerContent>
                        <div className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white/80" />
                        <MarkerLabel>Ride Source</MarkerLabel>
                      </MarkerContent>
                    </MapMarker>
                  )}
                  {dropMarkers.map(b => (
                    <MapMarker key={b.id} longitude={b.dropLongitude as number} latitude={b.dropLatitude as number}>
                      <MarkerContent>
                        <div className="h-3 w-3 rounded-full ring-2 ring-white/80" style={{ background:"#ff9b6a" }} />
                        <MarkerLabel>{b.user?.name || `Booking ${b.id}`}</MarkerLabel>
                      </MarkerContent>
                    </MapMarker>
                  ))}
                  <MapControls showZoom />
                </Map>
              </div>
            </div>

            {/* Participant stats + table */}
            {!loadingParticipants && participants.length > 0 && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
                  {[
                    { label:"Total",     value: passengerStats.total,     color:"#1e1e1e" },
                    { label:"Confirmed", value: passengerStats.confirmed, color:"#1a5ea8" },
                    { label:"Picked Up", value: passengerStats.pickedUp,  color:"#a07010" },
                    { label:"Dropped",   value: passengerStats.dropped,   color:"#2e7d32" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="mrd-stat-card">
                      <span className="mrd-label">{label}</span>
                      <p className="font-display" style={{ fontSize:26, fontWeight:800, color, marginTop:4 }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mrd-section">
                  <h2 className="font-display" style={{ fontSize:19, fontWeight:800, color:"#1e1e1e", letterSpacing:"-0.4px", marginBottom:20 }}>Fellow Passengers</h2>
                  <div style={{ overflowX:"auto", borderRadius:16, border:"1.5px solid rgba(45,45,45,0.08)" }}>
                    <table className="mrd-table">
                      <thead>
                        <tr>
                          {["Passenger","Pickup","Drop","Seats","Fare (₹)","Status"].map(h => <th key={h}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map(b => (
                          <tr key={b.id}>
                            <td>
                              <div style={{ fontWeight:600, color:"#1e1e1e" }}>{b.user?.name || "-"}</div>
                              <div style={{ fontSize:12, color:"#a09890" }}>{b.user?.email || "-"}</div>
                            </td>
                            <td>{b.pickupName || "-"}</td>
                            <td>{b.dropName || "-"}</td>
                            <td>{b.seatsBooked}</td>
                            <td style={{ fontWeight:600, color:"#cc6b3d" }}>
                              {typeof b.estimatedFare === "number" ? b.estimatedFare.toFixed(2) : "-"}
                            </td>
                            <td>
                              <span className={`mrd-status-badge ${statusBadgeClass(b.status)}`}>{b.status || "-"}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {loadingParticipants && (
              <div className="mrd-section">
                <p className="font-body" style={{ color:"#a09890", fontSize:14 }}>Loading participants…</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}