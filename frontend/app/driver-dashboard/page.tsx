"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Map, MapControls, MapMarker,
  MarkerContent, MarkerLabel, type MapRef,
} from "@/components/ui/map";
import { apiUrl, clearAuthSession, getAuthHeaders, getAuthToken } from "@/lib/api";
import { DriverRideBooking, Ride } from "../dashboard/types";

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

  .dd-card {
    background: rgba(255,255,255,0.68);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255,255,255,0.95);
    border-radius: 20px;
    padding: 22px;
    box-shadow: 0 4px 20px rgba(180,140,100,0.08);
  }

  .dd-section {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.9);
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 4px 24px rgba(180,140,100,0.07);
  }

  .dd-label {
    font-family: var(--font-dm), sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #8a8380;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    display: block;
    margin-bottom: 4px;
  }

  .dd-value {
    font-family: var(--font-dm), sans-serif;
    font-size: 14px;
    color: #3a3530;
  }

  .dd-btn {
    display: inline-flex; align-items: center; gap: 7px;
    border: none; border-radius: 50px; cursor: pointer;
    font-family: var(--font-dm), sans-serif; font-weight: 600;
    font-size: 13px; padding: 9px 20px; transition: all 0.22s;
    white-space: nowrap;
  }
  .dd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .dd-btn-dark  { background: #2d2d2d; color: #fdf6ec; }
  .dd-btn-dark:hover:not(:disabled)  { background: #1a1a1a; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(45,45,45,0.18); }
  .dd-btn-green { background: rgba(100,200,120,0.12); color: #2e7d32; border: 1.5px solid rgba(100,200,120,0.3); }
  .dd-btn-green:hover:not(:disabled) { background: rgba(100,200,120,0.2); transform: translateY(-1px); }
  .dd-btn-red   { background: rgba(220,80,80,0.1);  color: #b71c1c; border: 1.5px solid rgba(220,80,80,0.25); }
  .dd-btn-red:hover:not(:disabled)   { background: rgba(220,80,80,0.18); transform: translateY(-1px); }
  .dd-btn-blue  { background: rgba(80,150,220,0.1); color: #1a5ea8; border: 1.5px solid rgba(80,150,220,0.25); }
  .dd-btn-blue:hover:not(:disabled)  { background: rgba(80,150,220,0.18); transform: translateY(-1px); }

  .dd-stat-card {
    background: rgba(255,255,255,0.68);
    backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.95);
    border-radius: 18px;
    padding: 18px 20px;
    box-shadow: 0 4px 16px rgba(180,140,100,0.07);
  }

  .dd-map {
    height: 300px; overflow: hidden;
    border-radius: 16px;
    border: 1.5px solid rgba(45,45,45,0.1);
  }

  .dd-table { width: 100%; border-collapse: collapse; }
  .dd-table th {
    font-family: var(--font-dm), sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.4px;
    text-transform: uppercase; color: #8a8380;
    padding: 12px 16px; text-align: left;
    background: rgba(255,255,255,0.6);
    border-bottom: 1.5px solid rgba(45,45,45,0.07);
  }
  .dd-table td {
    font-family: var(--font-dm), sans-serif;
    font-size: 13px; color: #3a3530;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(45,45,45,0.06);
  }
  .dd-table tr:last-child td { border-bottom: none; }
  .dd-table tr:hover td { background: rgba(255,155,106,0.04); }

  .dd-route-block {
    background: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(45,45,45,0.08);
    border-radius: 12px; padding: 10px 14px;
  }

  .dd-status-badge {
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

  .dd-divider { border: none; border-top: 1.5px solid rgba(45,45,45,0.07); margin: 0; }
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

export default function DriverDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapRef = useRef<MapRef | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [bookings, setBookings] = useState<DriverRideBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [rideActionLoading, setRideActionLoading] = useState<"start" | "end" | null>(null);
  const [passengerActionLoadingId, setPassengerActionLoadingId] = useState<number | null>(null);

  const dropMarkers = useMemo(
    () => bookings.filter(b => typeof b.dropLatitude === "number" && typeof b.dropLongitude === "number"),
    [bookings]
  );

  const passengerStats = useMemo(() => ({
    total:     bookings.length,
    confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
    pickedUp:  bookings.filter(b => b.status === "PICKED_UP").length,
    dropped:   bookings.filter(b => b.status === "DROPPED").length,
  }), [bookings]);

  const fetchMyRides = async () => {
    const res = await fetch(apiUrl("/rides/my-rides"), { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Could not load rides");
    const data = (await res.json()) as Ride[];
    return [...data].sort((a, b) => b.id - a.id);
  };

  const fetchRideBookings = async (rideId: number) => {
    setLoadingBookings(true); setError("");
    try {
      const res = await fetch(apiUrl(`/bookings/driver/ride/${rideId}`), { headers: getAuthHeaders() });
      if (!res.ok) { setError("Unable to load passengers."); setBookings([]); return; }
      setBookings((await res.json()) as DriverRideBooking[]);
    } catch { setError("Unable to load passengers."); setBookings([]); }
    finally { setLoadingBookings(false); }
  };

  const loadRideData = async (rideId: number) => {
    const rides = await fetchMyRides();
    const matched = rides.find(r => r.id === rideId) ?? null;
    if (!matched) { setError("Ride not found."); setSelectedRide(null); setBookings([]); return; }
    setSelectedRide(matched);
    await fetchRideBookings(rideId);
  };

  useEffect(() => {
    if (!getAuthToken()) { router.replace("/login"); return; }
    const init = async () => {
      setLoading(true);
      try {
        const rideId = Number(searchParams.get("rideId"));
        if (!Number.isFinite(rideId)) { setError("No ride selected. Open from Track Passengers."); return; }
        await loadRideData(rideId);
      } catch { clearAuthSession(); router.replace("/login"); }
      finally { setLoading(false); }
    };
    void init();
  }, [router, searchParams]);

  useEffect(() => {
    if (!mapRef.current || !selectedRide) return;
    const points: [number, number][] = [];
    if (typeof selectedRide.sourceLongitude === "number" && typeof selectedRide.sourceLatitude === "number")
      points.push([selectedRide.sourceLongitude, selectedRide.sourceLatitude]);
    dropMarkers.forEach(b => points.push([b.dropLongitude as number, b.dropLatitude as number]));
    if (!points.length) return;
    if (points.length === 1) { mapRef.current.flyTo({ center: points[0], zoom: 13, duration: 600 }); return; }
    const lons = points.map(p => p[0]), lats = points.map(p => p[1]);
    mapRef.current.fitBounds([[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]], { padding: 60, duration: 700, maxZoom: 14 });
  }, [selectedRide, dropMarkers]);

  const handleStartRide = async () => {
    if (!selectedRide) return;
    setRideActionLoading("start"); setError("");
    try {
      const res = await fetch(apiUrl(`/rides/${selectedRide.id}/start`), { method: "POST", headers: getAuthHeaders() });
      if (!res.ok) { setError("Unable to start ride."); return; }
      await loadRideData(selectedRide.id);
    } catch { setError("Unable to start ride."); }
    finally { setRideActionLoading(null); }
  };

  const handleEndRide = async () => {
    if (!selectedRide) return;
    setRideActionLoading("end"); setError("");
    try {
      const res = await fetch(apiUrl(`/rides/${selectedRide.id}/end`), { method: "POST", headers: getAuthHeaders() });
      if (!res.ok) { setError("Unable to end ride."); return; }
      await loadRideData(selectedRide.id);
    } catch { setError("Unable to end ride."); }
    finally { setRideActionLoading(null); }
  };

  const handlePickupPassenger = async (bookingId: number) => {
    if (!selectedRide) return;
    setPassengerActionLoadingId(bookingId); setError("");
    try {
      const res = await fetch(apiUrl(`/bookings/${bookingId}/pickup`), { method: "PUT", headers: getAuthHeaders() });
      if (!res.ok) { setError("Unable to mark passenger as picked up."); return; }
      await loadRideData(selectedRide.id);
    } catch { setError("Unable to mark passenger as picked up."); }
    finally { setPassengerActionLoadingId(null); }
  };

  const handleDropPassenger = async (bookingId: number) => {
    if (!selectedRide) return;
    setPassengerActionLoadingId(bookingId); setError("");
    try {
      const res = await fetch(apiUrl(`/bookings/${bookingId}/drop`), { method: "PUT", headers: getAuthHeaders() });
      if (!res.ok) { setError("Unable to end passenger ride."); return; }
      await loadRideData(selectedRide.id);
    } catch { setError("Unable to end passenger ride."); }
    finally { setPassengerActionLoadingId(null); }
  };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fdf6ec 0%,#fef3e8 50%,#fdf0f8 100%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{styles}</style>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🚗</div>
          <p className="font-body" style={{ color:"#a09890", fontSize:15 }}>Loading driver dashboard…</p>
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
            <span className="font-display" style={{ fontSize:16, fontWeight:700, color:"#6b6560", letterSpacing:"-0.2px" }}>Driver Dashboard</span>
          </div>
          <Link href="/dashboard" style={{ textDecoration:"none" }}>
            <button className="dd-btn dd-btn-dark" style={{ padding:"8px 18px", fontSize:13 }}>← Back to Dashboard</button>
          </Link>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px", display:"flex", flexDirection:"column", gap:24 }}>

        {/* Toast */}
        {error && (
          <div style={{ background:"rgba(220,80,80,0.07)", border:"1.5px solid rgba(220,80,80,0.2)", borderRadius:14, padding:"12px 18px", fontFamily:"var(--font-dm),sans-serif", fontSize:14, color:"#c0392b", display:"flex", alignItems:"center", gap:8 }}>
            ⚠️ {error}
          </div>
        )}

        {!selectedRide && !error && (
          <div className="dd-section">
            <p className="font-body" style={{ color:"#a09890", fontSize:15 }}>No ride selected. Open this page from <strong>Track Passengers</strong> on your dashboard.</p>
          </div>
        )}

        {selectedRide && (
          <>
            {/* Top info grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16 }}>

              {/* Route */}
              <div className="dd-card">
                <span className="dd-label">Route</span>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:10 }}>
                  <div className="dd-route-block">
                    <span className="dd-label" style={{ marginBottom:2 }}>From</span>
                    <p className="font-body" style={{ fontSize:14, fontWeight:600, color:"#1e1e1e" }}>{selectedRide.source}</p>
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", color:"#ff9b6a", fontSize:18 }}>↓</div>
                  <div className="dd-route-block">
                    <span className="dd-label" style={{ marginBottom:2 }}>To</span>
                    <p className="font-body" style={{ fontSize:14, fontWeight:600, color:"#1e1e1e" }}>{selectedRide.destination}</p>
                  </div>
                </div>
              </div>

              {/* Ride status + actions */}
              <div className="dd-card" style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <span className="dd-label">Ride Status</span>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span className={`dd-status-badge ${statusBadgeClass(selectedRide.status)}`}>{selectedRide.status ?? "-"}</span>
                  <span className="font-body" style={{ fontSize:13, color:"#a09890" }}>#{selectedRide.id}</span>
                </div>
                <div>
                  <span className="dd-label">Seats Left</span>
                  <span className="font-display" style={{ fontSize:22, fontWeight:700, color:"#1e1e1e" }}>{selectedRide.availableSeats ?? "-"}</span>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {(selectedRide.status === "ACTIVE" || selectedRide.status === "FULL") && (
                    <button className="dd-btn dd-btn-green" onClick={handleStartRide} disabled={rideActionLoading !== null}>
                      {rideActionLoading === "start" ? (
                        <><svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Starting…</>
                      ) : "▶ Start Ride"}
                    </button>
                  )}
                  {selectedRide.status === "IN_PROGRESS" && (
                    <button className="dd-btn dd-btn-red" onClick={handleEndRide} disabled={rideActionLoading !== null}>
                      {rideActionLoading === "end" ? "Ending…" : "⏹ End Ride"}
                    </button>
                  )}
                </div>
              </div>

              {/* Driver info */}
              <div className="dd-card" style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <span className="dd-label">Driver</span>
                <p className="font-display" style={{ fontSize:17, fontWeight:700, color:"#1e1e1e", marginBottom:4 }}>{selectedRide.driver?.name || "-"}</p>
                {[
                  { l:"Email",   v: selectedRide.driver?.email },
                  { l:"Phone",   v: selectedRide.driver?.phoneNumber },
                  { l:"Gender",  v: selectedRide.driver?.gender },
                  { l:"Vehicle", v: `${selectedRide.driver?.vehicleModel || "-"} · ${selectedRide.driver?.vehicleNumber || "-"}` },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <span className="dd-label" style={{ marginBottom:0 }}>{l} </span>
                    <span className="dd-value">{v || "-"}</span>
                  </div>
                ))}
              </div>

              {/* Passenger stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { label:"Total",     value: passengerStats.total,     color:"#1e1e1e" },
                  { label:"Confirmed", value: passengerStats.confirmed, color:"#1a5ea8" },
                  { label:"Picked Up", value: passengerStats.pickedUp,  color:"#a07010" },
                  { label:"Dropped",   value: passengerStats.dropped,   color:"#2e7d32" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="dd-stat-card">
                    <span className="dd-label">{label}</span>
                    <p className="font-display" style={{ fontSize:26, fontWeight:800, color, marginTop:4 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="dd-section">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h2 className="font-display" style={{ fontSize:19, fontWeight:800, color:"#1e1e1e", letterSpacing:"-0.4px" }}>Passenger Drop Map</h2>
                <span className="font-body" style={{ fontSize:12, color:"#a09890" }}>Source + all drop points</span>
              </div>
              <div className="dd-map">
                <Map
                  ref={mapRef}
                  center={typeof selectedRide.sourceLongitude === "number" && typeof selectedRide.sourceLatitude === "number"
                    ? [selectedRide.sourceLongitude, selectedRide.sourceLatitude]
                    : DEFAULT_MAP_CENTER}
                  zoom={10} theme="light"
                >
                  {typeof selectedRide.sourceLongitude === "number" && typeof selectedRide.sourceLatitude === "number" && (
                    <MapMarker longitude={selectedRide.sourceLongitude} latitude={selectedRide.sourceLatitude}>
                      <MarkerContent>
                        <div className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white/80" />
                        <MarkerLabel>Source</MarkerLabel>
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

            {/* Passenger table */}
            <div className="dd-section">
              <h2 className="font-display" style={{ fontSize:19, fontWeight:800, color:"#1e1e1e", letterSpacing:"-0.4px", marginBottom:20 }}>Passenger Details</h2>
              {loadingBookings ? (
                <p className="font-body" style={{ color:"#a09890", fontSize:14 }}>Loading passengers…</p>
              ) : bookings.length === 0 ? (
                <p className="font-body" style={{ color:"#a09890", fontSize:14 }}>No bookings yet for this ride.</p>
              ) : (
                <div style={{ overflowX:"auto", borderRadius:16, border:"1.5px solid rgba(45,45,45,0.08)" }}>
                  <table className="dd-table">
                    <thead>
                      <tr>
                        {["Passenger","Pickup","Drop","Seats","Fare (₹)","Status","Action"].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
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
                            <span className={`dd-status-badge ${statusBadgeClass(b.status)}`}>{b.status || "-"}</span>
                          </td>
                          <td>
                            {selectedRide.status !== "IN_PROGRESS" ? (
                              <span style={{ fontSize:12, color:"#c0b8b2" }}>Start ride first</span>
                            ) : b.status === "CONFIRMED" ? (
                              <button className="dd-btn dd-btn-blue" onClick={() => handlePickupPassenger(b.id)} disabled={passengerActionLoadingId === b.id}>
                                {passengerActionLoadingId === b.id ? "Updating…" : "Picked Up"}
                              </button>
                            ) : b.status === "PICKED_UP" ? (
                              <button className="dd-btn dd-btn-red" onClick={() => handleDropPassenger(b.id)} disabled={passengerActionLoadingId === b.id}>
                                {passengerActionLoadingId === b.id ? "Ending…" : "Drop Off"}
                              </button>
                            ) : (
                              <span style={{ fontSize:12, color:"#c0b8b2" }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}