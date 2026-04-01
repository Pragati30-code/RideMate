"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, getAuthHeaders, getAuthToken, clearAuthSession } from "@/lib/api";
import DashboardHeader from "./components/DashboardHeader";
import ModeSwitch from "./components/ModeSwitch";
import BookRideSection from "./components/BookRideSection";
import MakeRideSection from "./components/MakeRideSection";
import { DashboardMode, DriverStatus, Ride, SearchRideResult, defaultDriverStatus } from "./types";
import { dashboardStyles } from "./components/dashboardStyles";

export default function DashboardPage() {
  const router = useRouter();
  const [mode, setMode] = useState<DashboardMode>("book");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [driverStatus, setDriverStatus] = useState<DriverStatus>(defaultDriverStatus);
  const [searchSource, setSearchSource] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [searchSourceLatitude, setSearchSourceLatitude] = useState("");
  const [searchSourceLongitude, setSearchSourceLongitude] = useState("");
  const [searchDestinationLatitude, setSearchDestinationLatitude] = useState("");
  const [searchDestinationLongitude, setSearchDestinationLongitude] = useState("");
  const [searchedRides, setSearchedRides] = useState<SearchRideResult[]>([]);
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [bookingRideId, setBookingRideId] = useState<number | null>(null);
  const [cancellingRideId, setCancellingRideId] = useState<number | null>(null);

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const [rideSource, setRideSource] = useState("");
  const [rideDestination, setRideDestination] = useState("");
  const [sourceLatitude, setSourceLatitude] = useState("");
  const [sourceLongitude, setSourceLongitude] = useState("");
  const [destinationLatitude, setDestinationLatitude] = useState("");
  const [destinationLongitude, setDestinationLongitude] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [availableSeats, setAvailableSeats] = useState("");
  const [creatingRide, setCreatingRide] = useState(false);

  const fetchDriverStatus = async () => {
    const res = await fetch(apiUrl("/users/driver-status"), { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Could not load driver status");
    const data = (await res.json()) as DriverStatus;
    setDriverStatus(data);
    if (data.vehicleNumber) setVehicleNumber(data.vehicleNumber);
    if (data.vehicleModel) setVehicleModel(data.vehicleModel);
    if (data.drivingLicense) setDrivingLicense(data.drivingLicense);
  };

  const fetchActiveRides = async () => {
    const res = await fetch(apiUrl("/rides"), { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Could not load active rides");
    const data = (await res.json()) as Ride[];
    setActiveRides([...data].sort((a, b) => b.id - a.id));
  };

  const fetchMyRides = async () => {
    const res = await fetch(apiUrl("/rides/my-rides"), { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Could not load your rides");
    const data = (await res.json()) as Ride[];
    setMyRides([...data].sort((a, b) => b.id - a.id));
  };

  useEffect(() => {
    if (!getAuthToken()) { router.replace("/login"); return; }
    const init = async () => {
      setLoading(true);
      try { await Promise.all([fetchDriverStatus(), fetchActiveRides(), fetchMyRides()]); }
      catch { setError("Session expired. Please login again."); clearAuthSession(); router.replace("/login"); }
      finally { setLoading(false); }
    };
    void init();
  }, [router]);

  const handleSearchRides = async () => {
    setMessage(""); setError(""); setSearchedRides([]);
    const sLat = Number(searchSourceLatitude), sLon = Number(searchSourceLongitude);
    const dLat = Number(searchDestinationLatitude), dLon = Number(searchDestinationLongitude);
    if ([sLat, sLon, dLat, dLon].some(Number.isNaN)) {
      setError("Please select source and destination from suggestions."); return;
    }
    try {
      const res = await fetch(apiUrl("/rides/search"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ source: searchSource, sourceLatitude: sLat, sourceLongitude: sLon, destination: searchDestination, destinationLatitude: dLat, destinationLongitude: dLon }),
      });
      if (!res.ok) { setError("Failed to search rides."); return; }
      const data = (await res.json()) as SearchRideResult[];
      setSearchedRides(data);
      setMessage(data.length ? "✅ Rides found!" : "❌ No rides found for this route.");
    } catch { setError("Unable to reach server."); }
  };

  const handleSubmitVerification = async () => {
    setMessage(""); setError(""); setSubmittingVerification(true);
    try {
      const res = await fetch(apiUrl("/users/submit-driver-details"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ vehicleNumber, vehicleModel, drivingLicense }),
      });
      if (!res.ok) { setError("Could not submit verification details."); return; }
      await fetchDriverStatus();
      setMessage("Verification submitted. Please wait for admin approval.");
    } catch { setError("Unable to submit verification details."); }
    finally { setSubmittingVerification(false); }
  };

  const handleBookRide = async (rideId: number, seats: number) => {
    setMessage(""); setError("");
    if (!Number.isFinite(seats) || seats <= 0) { setError("Please enter valid seats."); return; }
    const pLat = Number(searchSourceLatitude), pLon = Number(searchSourceLongitude);
    const dLat = Number(searchDestinationLatitude), dLon = Number(searchDestinationLongitude);
    if ([pLat, pLon, dLat, dLon].some(Number.isNaN)) { setError("Select locations from suggestions before booking."); return; }
    setBookingRideId(rideId);
    try {
      const res = await fetch(apiUrl("/bookings"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ rideId, seats, pickupName: searchSource, pickupLatitude: pLat, pickupLongitude: pLon, dropName: searchDestination, dropLatitude: dLat, dropLongitude: dLon }),
      });
      if (!res.ok) {
        let msg = "Unable to book ride. Please verify seats and ride status.";
        try {
          const body = (await res.json()) as { error?: string; message?: string };
          msg = body.error || body.message || msg;
        } catch {}
        setError(msg);
        return;
      }
      setMessage("Ride booked successfully! 🎉");
      await Promise.all([fetchActiveRides(), fetchMyRides()]);
      await handleSearchRides();
    } catch { setError("Unable to book ride."); }
    finally { setBookingRideId(null); }
  };

  const handleCreateRide = async () => {
    setMessage(""); setError(""); setCreatingRide(true);
    const parsedSeats = Number(availableSeats);
    if (!parsedSeats || parsedSeats <= 0) { setError("Please enter valid available seats."); setCreatingRide(false); return; }
    const sLat = sourceLatitude ? Number(sourceLatitude) : null;
    const sLon = sourceLongitude ? Number(sourceLongitude) : null;
    const dLat = destinationLatitude ? Number(destinationLatitude) : null;
    const dLon = destinationLongitude ? Number(destinationLongitude) : null;
    if (sLat === null || sLon === null || dLat === null || dLon === null) {
      setError("Source and destination coordinates are required."); setCreatingRide(false); return;
    }
    try {
      const res = await fetch(apiUrl("/rides"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ source: rideSource, sourceLatitude: sLat, sourceLongitude: sLon, destination: rideDestination, destinationLatitude: dLat, destinationLongitude: dLon, departureTime, availableSeats: parsedSeats }),
      });
      if (!res.ok) {
        let msg = "Failed to create ride.";
        try { const b = (await res.json()) as { error?: string; message?: string }; msg = b.error || b.message || msg; } catch {}
        setError(msg); return;
      }
      setMessage("Ride created successfully! 🚗");
      await Promise.all([fetchActiveRides(), fetchMyRides()]);
      setRideSource(""); setRideDestination(""); setSourceLatitude(""); setSourceLongitude("");
      setDestinationLatitude(""); setDestinationLongitude(""); setDepartureTime(""); setAvailableSeats("");
    } catch { setError("Unable to create ride."); }
    finally { setCreatingRide(false); }
  };

  const handleCancelCreatedRide = async (rideId: number) => {
    setMessage(""); setError("");
    setCancellingRideId(rideId);
    try {
      const res = await fetch(apiUrl(`/rides/${rideId}/cancel`), {
        method: "PUT",
        headers: { ...getAuthHeaders() },
      });

      if (!res.ok) {
        let msg = "Unable to cancel ride.";
        try {
          const body = (await res.json()) as { error?: string; message?: string };
          msg = body.error || body.message || msg;
        } catch {}
        setError(msg);
        return;
      }

      setMessage("Ride cancelled successfully.");
      await Promise.all([fetchActiveRides(), fetchMyRides()]);
    } catch {
      setError("Unable to cancel ride.");
    } finally {
      setCancellingRideId(null);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdf6ec 0%, #fef3e8 50%, #fdf0f8 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <style>{dashboardStyles}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚗</div>
          <p className="font-body" style={{ color: "#a09890", fontSize: 15 }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #fdf6ec 0%, #fef3e8 55%, #fdf0f8 100%)" }}>
      <style>{dashboardStyles}</style>

      <DashboardHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

        {/* Toast messages */}
        {(error || message) && (
          <div style={{
            marginBottom: 20,
            background: error ? "rgba(220,80,80,0.07)" : "rgba(120,200,120,0.1)",
            border: `1.5px solid ${error ? "rgba(220,80,80,0.2)" : "rgba(120,200,120,0.25)"}`,
            borderRadius: 14, padding: "12px 18px",
            fontFamily: "var(--font-dm), sans-serif",
            fontSize: 14, fontWeight: 500,
            color: error ? "#c0392b" : "#3a8a3a",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            {/* <span>{error ? "⚠️" : "✅"}</span> */}
            {error || message}
          </div>
        )}

        <ModeSwitch mode={mode} onModeChange={(m) => { setMode(m); setError(""); setMessage(""); }} />

        {mode === "book" && (
          <BookRideSection
            searchSource={searchSource} searchDestination={searchDestination}
            searchSourceLatitude={searchSourceLatitude} searchSourceLongitude={searchSourceLongitude}
            searchDestinationLatitude={searchDestinationLatitude} searchDestinationLongitude={searchDestinationLongitude}
            searchedRides={searchedRides} activeRides={activeRides}
            onSearchSourceChange={setSearchSource} onSearchDestinationChange={setSearchDestination}
            onSearchSourceLatitudeChange={setSearchSourceLatitude} onSearchSourceLongitudeChange={setSearchSourceLongitude}
            onSearchDestinationLatitudeChange={setSearchDestinationLatitude} onSearchDestinationLongitudeChange={setSearchDestinationLongitude}
            onSearch={handleSearchRides} onBookRide={handleBookRide} bookingRideId={bookingRideId}
          />
        )}

        {mode === "make" && (
          <MakeRideSection
            driverStatus={driverStatus} vehicleNumber={vehicleNumber} vehicleModel={vehicleModel}
            drivingLicense={drivingLicense} submittingVerification={submittingVerification}
            rideSource={rideSource} rideDestination={rideDestination}
            sourceLatitude={sourceLatitude} sourceLongitude={sourceLongitude}
            destinationLatitude={destinationLatitude} destinationLongitude={destinationLongitude}
            departureTime={departureTime} availableSeats={availableSeats}
            myRides={myRides} creatingRide={creatingRide} cancellingRideId={cancellingRideId}
            onVehicleNumberChange={setVehicleNumber} onVehicleModelChange={setVehicleModel}
            onDrivingLicenseChange={setDrivingLicense} onSubmitVerification={handleSubmitVerification}
            onRideSourceChange={setRideSource} onRideDestinationChange={setRideDestination}
            onSourceLatitudeChange={setSourceLatitude} onSourceLongitudeChange={setSourceLongitude}
            onDestinationLatitudeChange={setDestinationLatitude} onDestinationLongitudeChange={setDestinationLongitude}
            onDepartureTimeChange={setDepartureTime} onAvailableSeatsChange={setAvailableSeats}
            onCreateRide={handleCreateRide} onCancelRide={handleCancelCreatedRide}
          />
        )}
      </main>
    </div>
  );
}