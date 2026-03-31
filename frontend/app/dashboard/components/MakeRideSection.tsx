import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map, MapControls, MapMarker, MapRoute,
  MarkerContent, MarkerLabel, type MapRef,
} from "@/components/ui/map";
import { DriverStatus, Ride } from "../types";

const DEFAULT_MAP_CENTER: [number, number] = [77.2090, 28.6139];
type NominatimSuggestion = { display_name: string; lat: string; lon: string };

function parseCoordinate(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type MakeRideSectionProps = {
  driverStatus: DriverStatus;
  vehicleNumber: string; vehicleModel: string; drivingLicense: string;
  submittingVerification: boolean;
  rideSource: string; rideDestination: string;
  sourceLatitude: string; sourceLongitude: string;
  destinationLatitude: string; destinationLongitude: string;
  departureTime: string; availableSeats: string;
  myRides: Ride[]; creatingRide: boolean;
  onVehicleNumberChange: (v: string) => void;
  onVehicleModelChange: (v: string) => void;
  onDrivingLicenseChange: (v: string) => void;
  onSubmitVerification: () => void;
  onRideSourceChange: (v: string) => void;
  onRideDestinationChange: (v: string) => void;
  onSourceLatitudeChange: (v: string) => void;
  onSourceLongitudeChange: (v: string) => void;
  onDestinationLatitudeChange: (v: string) => void;
  onDestinationLongitudeChange: (v: string) => void;
  onDepartureTimeChange: (v: string) => void;
  onAvailableSeatsChange: (v: string) => void;
  onCreateRide: () => void;
};

export default function MakeRideSection({
  driverStatus, vehicleNumber, vehicleModel, drivingLicense, submittingVerification,
  rideSource, rideDestination, sourceLatitude, sourceLongitude,
  destinationLatitude, destinationLongitude, departureTime, availableSeats,
  myRides, creatingRide,
  onVehicleNumberChange, onVehicleModelChange, onDrivingLicenseChange, onSubmitVerification,
  onRideSourceChange, onRideDestinationChange,
  onSourceLatitudeChange, onSourceLongitudeChange,
  onDestinationLatitudeChange, onDestinationLongitudeChange,
  onDepartureTimeChange, onAvailableSeatsChange, onCreateRide,
}: MakeRideSectionProps) {
  const [sourceSuggestions, setSourceSuggestions] = useState<NominatimSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const mapRef = useRef<MapRef | null>(null);

  const sourcePoint = useMemo(() => {
    const lat = parseCoordinate(sourceLatitude), lon = parseCoordinate(sourceLongitude);
    return lat !== null && lon !== null ? { latitude: lat, longitude: lon } : null;
  }, [sourceLatitude, sourceLongitude]);

  const destinationPoint = useMemo(() => {
    const lat = parseCoordinate(destinationLatitude), lon = parseCoordinate(destinationLongitude);
    return lat !== null && lon !== null ? { latitude: lat, longitude: lon } : null;
  }, [destinationLatitude, destinationLongitude]);

  const routeCoordinates = useMemo<[number, number][]>(() => {
    if (!sourcePoint || !destinationPoint) return [];
    return [[sourcePoint.longitude, sourcePoint.latitude], [destinationPoint.longitude, destinationPoint.latitude]];
  }, [sourcePoint, destinationPoint]);

  useEffect(() => {
    if (!mapRef.current || !sourcePoint || !destinationPoint) return;
    mapRef.current.fitBounds(
      [[Math.min(sourcePoint.longitude, destinationPoint.longitude), Math.min(sourcePoint.latitude, destinationPoint.latitude)],
       [Math.max(sourcePoint.longitude, destinationPoint.longitude), Math.max(sourcePoint.latitude, destinationPoint.latitude)]],
      { padding: 60, duration: 700, maxZoom: 15 }
    );
  }, [sourcePoint, destinationPoint]);

  useEffect(() => {
    if (!driverStatus.isVerifiedDriver) return;
    const trimmed = rideSource.trim();
    if (trimmed.length < 3) { setSourceSuggestions([]); return; }
    const id = setTimeout(async () => {
      setIsSearchingSource(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(trimmed)}`);
        setSourceSuggestions(res.ok ? (await res.json()) as NominatimSuggestion[] : []);
      } catch { setSourceSuggestions([]); } finally { setIsSearchingSource(false); }
    }, 350);
    return () => clearTimeout(id);
  }, [rideSource, driverStatus.isVerifiedDriver]);

  useEffect(() => {
    if (!driverStatus.isVerifiedDriver) return;
    const trimmed = rideDestination.trim();
    if (trimmed.length < 3) { setDestinationSuggestions([]); return; }
    const id = setTimeout(async () => {
      setIsSearchingDestination(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(trimmed)}`);
        setDestinationSuggestions(res.ok ? (await res.json()) as NominatimSuggestion[] : []);
      } catch { setDestinationSuggestions([]); } finally { setIsSearchingDestination(false); }
    }, 350);
    return () => clearTimeout(id);
  }, [rideDestination, driverStatus.isVerifiedDriver]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      onRideSourceChange("Current Location");
      onSourceLatitudeChange(String(pos.coords.latitude));
      onSourceLongitudeChange(String(pos.coords.longitude));
      setSourceSuggestions([]);
    }, () => {}, { enableHighAccuracy: true, timeout: 10000 });
  };

  return (
    <div className="d-section" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 className="d-section-title">Create a Ride</h2>

      {/* ---- Verification required ---- */}
      {!driverStatus.isVerifiedDriver && (
        <div className="d-warn-box" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <div>
              <p className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#1e1e1e" }}>
                Driver verification required
              </p>
              <p className="d-muted">Submit your details for admin approval before creating rides.</p>
            </div>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,180,50,0.12)", border: "1px solid rgba(255,180,50,0.25)",
            borderRadius: 50, padding: "4px 12px",
            fontFamily: "var(--font-dm), sans-serif", fontSize: 12, fontWeight: 600, color: "#a07010",
          }}>
            Status: {driverStatus.verificationStatus || "NOT SUBMITTED"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            {[
              { label: "Vehicle Number",  val: vehicleNumber,  set: onVehicleNumberChange,  ph: "e.g. MH12AB1234" },
              { label: "Vehicle Model",   val: vehicleModel,   set: onVehicleModelChange,   ph: "e.g. Swift Dzire" },
              { label: "Driving License", val: drivingLicense, set: onDrivingLicenseChange, ph: "License number" },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="d-label">{label}</label>
                <input value={val} onChange={e => set(e.target.value)} placeholder={ph} className="d-input" />
              </div>
            ))}
          </div>

          <button
            className="d-btn"
            onClick={onSubmitVerification}
            disabled={submittingVerification || !vehicleNumber || !vehicleModel || !drivingLicense}
            style={{ alignSelf: "flex-start" }}
          >
            {submittingVerification ? "Submitting…" : "Submit for Verification →"}
          </button>
        </div>
      )}

      {/* ---- Create ride form ---- */}
      {driverStatus.isVerifiedDriver && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <p className="d-muted">
            Type at least 3 letters to get location suggestions, then select to preview route on map.
          </p>

          {/* Source + Destination */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <label className="d-label">From</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={rideSource}
                  onChange={e => { onRideSourceChange(e.target.value); onSourceLatitudeChange(""); onSourceLongitudeChange(""); }}
                  placeholder="Pickup location"
                  className="d-input"
                />
                <button className="d-btn-ghost" onClick={useCurrentLocation} style={{ flexShrink: 0, padding: "8px 12px" }} title="Use my location">
                  📍
                </button>
              </div>
              {isSearchingSource && <p className="d-muted" style={{ marginTop: 4 }}>Searching…</p>}
              {sourceSuggestions.length > 0 && (
                <div className="d-suggestions">
                  {sourceSuggestions.map(s => (
                    <button key={`${s.lat}-${s.lon}`} type="button" className="d-suggestion-item"
                      onClick={() => { onRideSourceChange(s.display_name); onSourceLatitudeChange(s.lat); onSourceLongitudeChange(s.lon); setSourceSuggestions([]); }}>
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <label className="d-label">To</label>
              <input
                value={rideDestination}
                onChange={e => { onRideDestinationChange(e.target.value); onDestinationLatitudeChange(""); onDestinationLongitudeChange(""); }}
                placeholder="Drop-off location"
                className="d-input"
              />
              {isSearchingDestination && <p className="d-muted" style={{ marginTop: 4 }}>Searching…</p>}
              {destinationSuggestions.length > 0 && (
                <div className="d-suggestions">
                  {destinationSuggestions.map(s => (
                    <button key={`${s.lat}-${s.lon}`} type="button" className="d-suggestion-item"
                      onClick={() => { onRideDestinationChange(s.display_name); onDestinationLatitudeChange(s.lat); onDestinationLongitudeChange(s.lon); setDestinationSuggestions([]); }}>
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div>
            <label className="d-label" style={{ marginBottom: 8 }}>Route Preview</label>
            <div className="d-map">
              <Map ref={mapRef} center={sourcePoint ? [sourcePoint.longitude, sourcePoint.latitude] : DEFAULT_MAP_CENTER} zoom={10} theme="light">
                {sourcePoint && (
                  <MapMarker longitude={sourcePoint.longitude} latitude={sourcePoint.latitude}>
                    <MarkerContent>
                      <div className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white/80" />
                      <MarkerLabel>Pickup</MarkerLabel>
                    </MarkerContent>
                  </MapMarker>
                )}
                {destinationPoint && (
                  <MapMarker longitude={destinationPoint.longitude} latitude={destinationPoint.latitude}>
                    <MarkerContent>
                      <div className="h-3 w-3 rounded-full bg-rose-400 ring-2 ring-white/80" />
                      <MarkerLabel>Drop-off</MarkerLabel>
                    </MarkerContent>
                  </MapMarker>
                )}
                {routeCoordinates.length === 2 && <MapRoute coordinates={routeCoordinates} color="#ff9b6a" width={4} opacity={0.85} />}
                <MapControls showZoom showLocate onLocate={({ latitude, longitude }) => {
                  onRideSourceChange("Current Location");
                  onSourceLatitudeChange(String(latitude));
                  onSourceLongitudeChange(String(longitude));
                  setSourceSuggestions([]);
                }} />
              </Map>
            </div>
          </div>

          {/* Departure + Seats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="d-label">Departure Time</label>
              <input type="datetime-local" value={departureTime} onChange={e => onDepartureTimeChange(e.target.value)} className="d-input" />
            </div>
            <div>
              <label className="d-label">Available Seats</label>
              <input type="number" value={availableSeats} onChange={e => onAvailableSeatsChange(e.target.value)} placeholder="e.g. 3" className="d-input" />
            </div>
          </div>

          <button
            className="d-btn"
            onClick={onCreateRide}
            disabled={creatingRide || !rideSource || !rideDestination || !departureTime}
            style={{ alignSelf: "flex-start" }}
          >
            {creatingRide ? (
              <>
                <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Creating…
              </>
            ) : "Create Ride →"}
          </button>

          <hr className="d-divider" />

          {/* My rides */}
          <div>
            <h3 className="d-subsection-title">My Created Rides</h3>
            {myRides.length === 0
              ? <p className="d-muted">You haven't created any rides yet.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {myRides.map(ride => (
                    <div key={ride.id} className="d-card">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#1e1e1e" }}>
                          {ride.source}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff9b6a" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#1e1e1e" }}>
                          {ride.destination}
                        </span>
                        <span style={{
                          marginLeft: "auto",
                          background: ride.status === "ACTIVE" ? "rgba(120,200,120,0.12)" : "rgba(45,45,45,0.07)",
                          color: ride.status === "ACTIVE" ? "#3a8a3a" : "#7a7370",
                          border: `1px solid ${ride.status === "ACTIVE" ? "rgba(120,200,120,0.3)" : "rgba(45,45,45,0.12)"}`,
                          borderRadius: 50, padding: "2px 10px",
                          fontSize: 11, fontWeight: 600,
                          fontFamily: "var(--font-dm), sans-serif",
                          textTransform: "uppercase" as const, letterSpacing: "0.3px",
                        }}>
                          {ride.status ?? "-"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
                        <div>
                          <span className="d-label" style={{ marginBottom: 0 }}>Seats</span>
                          <span className="font-body" style={{ fontSize: 13, color: "#3a3530" }}> {ride.availableSeats ?? "-"}</span>
                        </div>
                        {ride.departureTime && (
                          <div>
                            <span className="d-label" style={{ marginBottom: 0 }}>Departure</span>
                            <span className="font-body" style={{ fontSize: 13, color: "#3a3530" }}> {new Date(ride.departureTime).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <Link href={`/driver-dashboard?rideId=${ride.id}`} style={{ textDecoration: "none" }}>
                        <button className="d-btn-ghost" style={{ fontSize: 13 }}>
                          Track Passengers →
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}