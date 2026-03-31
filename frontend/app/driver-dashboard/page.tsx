"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type MapRef } from "@/components/ui/map";
import { apiUrl, clearAuthSession, getAuthHeaders, getAuthToken } from "@/lib/api";
import { DriverRideBooking, Ride } from "../dashboard/types";
import DriverDashboardHeader from "./components/DriverDashboardHeader";
import DriverRideSummary from "./components/DriverRideSummary";
import DriverMapPanel from "./components/DriverMapPanel";
import PassengerTable from "./components/PassengerTable";
import { driverDashboardStyles } from "./components/driverDashboardStyles";

function DriverDashboardLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#fdf6ec 0%,#fef3e8 50%,#fdf0f8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{driverDashboardStyles}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚗</div>
        <p className="font-body" style={{ color: "#a09890", fontSize: 15 }}>
          Loading driver dashboard…
        </p>
      </div>
    </div>
  );
}

function DriverDashboardContent() {
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
  const [locatingForMaps, setLocatingForMaps] = useState(false);

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

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const openGoogleMaps = () => {
    if (selectedRide?.status !== "IN_PROGRESS") return;

    const pending = dropMarkers.filter(
      b => b.status === "CONFIRMED" || b.status === "PICKED_UP"
    );

    if (pending.length === 0) {
      alert("No pending passengers left on this ride.");
      return;
    }

    setLocatingForMaps(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const driverLat = pos.coords.latitude;
        const driverLon = pos.coords.longitude;

        let nearest = pending[0];
        let minDist = haversine(driverLat, driverLon, nearest.dropLatitude as number, nearest.dropLongitude as number);

        for (const b of pending.slice(1)) {
          const dist = haversine(driverLat, driverLon, b.dropLatitude as number, b.dropLongitude as number);
          if (dist < minDist) { minDist = dist; nearest = b; }
        }

        const destLat = nearest.dropLatitude as number;
        const destLon = nearest.dropLongitude as number;

        const url = `https://www.google.com/maps/dir/?api=1&origin=${driverLat},${driverLon}&destination=${destLat},${destLon}&travelmode=driving`;
        window.open(url, "_blank");
        setLocatingForMaps(false);
      },
      () => {
        alert("Could not get your location. Please allow location access.");
        setLocatingForMaps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
    return <DriverDashboardLoading />;
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#fdf6ec 0%,#fef3e8 55%,#fdf0f8 100%)" }}>
      <style>{driverDashboardStyles}</style>

      <DriverDashboardHeader />

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
            <DriverRideSummary
              selectedRide={selectedRide}
              passengerStats={passengerStats}
              rideActionLoading={rideActionLoading}
              onStartRide={handleStartRide}
              onEndRide={handleEndRide}
            />

            <DriverMapPanel
              selectedRide={selectedRide}
              mapRef={mapRef}
              dropMarkers={dropMarkers}
              locatingForMaps={locatingForMaps}
              onOpenGoogleMaps={openGoogleMaps}
            />

            <PassengerTable
              loadingBookings={loadingBookings}
              bookings={bookings}
              selectedRideStatus={selectedRide.status}
              passengerActionLoadingId={passengerActionLoadingId}
              onPickupPassenger={handlePickupPassenger}
              onDropPassenger={handleDropPassenger}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default function DriverDashboardPage() {
  return (
    <Suspense fallback={<DriverDashboardLoading />}>
      <DriverDashboardContent />
    </Suspense>
  );
}