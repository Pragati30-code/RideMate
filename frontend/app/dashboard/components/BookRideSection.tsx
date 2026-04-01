import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map, MapControls, MapMarker, MapRoute,
  MarkerContent, MarkerLabel, type MapRef,
} from "@/components/ui/map";
import { Ride, SearchRideResult } from "../types";

type NominatimSuggestion = { display_name: string; lat: string; lon: string };
const DEFAULT_MAP_CENTER: [number, number] = [77.2090, 28.6139];

function parseCoordinate(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(latitude))}&lon=${encodeURIComponent(String(longitude))}`
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { display_name?: string };
    return data.display_name?.trim() || null;
  } catch {
    return null;
  }
}

type BookRideSectionProps = {
  searchSource: string;
  searchDestination: string;
  searchSourceLatitude: string;
  searchSourceLongitude: string;
  searchDestinationLatitude: string;
  searchDestinationLongitude: string;
  searchedRides: SearchRideResult[];
  activeRides: Ride[];
  onSearchSourceChange: (value: string) => void;
  onSearchDestinationChange: (value: string) => void;
  onSearchSourceLatitudeChange: (value: string) => void;
  onSearchSourceLongitudeChange: (value: string) => void;
  onSearchDestinationLatitudeChange: (value: string) => void;
  onSearchDestinationLongitudeChange: (value: string) => void;
  onSearch: () => void;
  onBookRide: (rideId: number, seats: number) => void;
  bookingRideId: number | null;
};

function RideCard({
  ride, estimatedFare, segmentDistanceKm, seatsByRide, setSeatsByRide, onBookRide, bookingRideId,
}: {
  ride: SearchRideResult["ride"] | Ride;
  estimatedFare?: number;
  segmentDistanceKm?: number;
  seatsByRide?: Record<number, string>;
  setSeatsByRide?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onBookRide?: (rideId: number, seats: number) => void;
  bookingRideId?: number | null;
}) {
  const seatsValue = Math.max(1, Number(seatsByRide?.[ride.id] ?? "1") || 1);
  const seatsExceeded = typeof ride.availableSeats === "number" && ride.availableSeats > 0
    ? seatsValue > ride.availableSeats : false;

  const statusColor = ride.status === "ACTIVE" ? "#3a8a3a" : "#a07010";
  const statusBg   = ride.status === "ACTIVE" ? "rgba(120,200,120,0.12)" : "rgba(255,180,50,0.1)";

  return (
    <div className="d-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Route */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#1e1e1e" }}>
          {ride.source}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff9b6a" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#1e1e1e" }}>
          {ride.destination}
        </span>
        <span style={{
          marginLeft: "auto", background: statusBg, color: statusColor,
          border: `1px solid ${statusColor}30`, borderRadius: 50,
          padding: "2px 10px", fontSize: 11, fontWeight: 600,
          fontFamily: "var(--font-dm), sans-serif", textTransform: "uppercase", letterSpacing: "0.3px",
        }}>
          {ride.status ?? "-"}
        </span>
      </div>

      {/* Meta grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 6 }}>
        {[
          { label: "Driver",   val: ride.driver?.name || "-" },
          { label: "Gender",   val: ride.driver?.gender || "-" },
          { label: "Phone",    val: ride.driver?.phoneNumber || "-" },
          { label: "Vehicle",  val: `${ride.driver?.vehicleModel || "-"} (${ride.driver?.vehicleNumber || "-"})` },
          { label: "Seats",    val: String(ride.availableSeats ?? "-") },
          ...(ride.departureTime ? [{ label: "Departure", val: new Date(ride.departureTime).toLocaleString() }] : []),
          ...(typeof (ride as Ride).distanceKm === "number" ? [{ label: "Distance", val: `${((ride as Ride).distanceKm!).toFixed(2)} km` }] : []),
        ].map(({ label, val }) => (
          <div key={label}>
            <span className="d-label" style={{ marginBottom: 0 }}>{label}</span>
            <span className="font-body" style={{ fontSize: 13, color: "#3a3530" }}> {val}</span>
          </div>
        ))}
      </div>

      {/* Fare */}
      {estimatedFare !== undefined && (
        <div style={{
          background: "rgba(255,155,106,0.08)", border: "1px solid rgba(255,155,106,0.2)",
          borderRadius: 12, padding: "10px 14px", display: "flex", gap: 20, flexWrap: "wrap",
        }}>
          <div>
            <span className="d-label" style={{ marginBottom: 0 }}>Fare / seat</span>
            <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#cc6b3d" }}> ₹{Number(estimatedFare).toFixed(2)}</span>
          </div>
          <div>
            <span className="d-label" style={{ marginBottom: 0 }}>Segment</span>
            <span className="font-body" style={{ fontSize: 13, color: "#cc6b3d", fontWeight: 600 }}> {Number(segmentDistanceKm).toFixed(2)} km</span>
          </div>
          <div>
            <span className="d-label" style={{ marginBottom: 0 }}>Total ({seatsValue} seat{seatsValue > 1 ? "s" : ""})</span>
            <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#cc6b3d" }}> ₹{(estimatedFare * seatsValue).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Book row */}
      {onBookRide && seatsByRide && setSeatsByRide && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", paddingTop: 4 }}>
          <div>
            <label className="d-label">Seats</label>
            <input
              type="number" min={1}
              value={seatsByRide[ride.id] ?? "1"}
              onChange={e => setSeatsByRide(prev => ({ ...prev, [ride.id]: e.target.value }))}
              className="d-input"
              style={{ width: 80 }}
            />
          </div>
          <button
            className="d-btn"
            onClick={() => onBookRide(ride.id, Number(seatsByRide[ride.id] ?? "1"))}
            disabled={bookingRideId === ride.id || ride.status !== "ACTIVE" || (ride.availableSeats ?? 0) <= 0 || seatsExceeded}
          >
            {bookingRideId === ride.id ? (
              <>
                <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Booking...
              </>
            ) : "Book Ride →"}
          </button>
        </div>
      )}

      {seatsExceeded && <p className="d-error-text">Selected seats exceed available seats.</p>}
      {ride.status !== "ACTIVE" && onBookRide && (
        <p className="font-body" style={{ fontSize: 12, color: "#a07010" }}>
          This ride is currently {ride.status}. Booking only available for ACTIVE rides.
        </p>
      )}
    </div>
  );
}

export default function BookRideSection({
  searchSource, searchDestination,
  searchSourceLatitude, searchSourceLongitude,
  searchDestinationLatitude, searchDestinationLongitude,
  searchedRides, activeRides,
  onSearchSourceChange, onSearchDestinationChange,
  onSearchSourceLatitudeChange, onSearchSourceLongitudeChange,
  onSearchDestinationLatitudeChange, onSearchDestinationLongitudeChange,
  onSearch, onBookRide, bookingRideId,
}: BookRideSectionProps) {
  const [sourceSuggestions, setSourceSuggestions] = useState<NominatimSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [seatsByRide, setSeatsByRide] = useState<Record<number, string>>({});
  const mapRef = useRef<MapRef | null>(null);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const resolvedLocation = await reverseGeocode(latitude, longitude);

        onSearchSourceChange(resolvedLocation ?? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        onSearchSourceLatitudeChange(String(latitude));
        onSearchSourceLongitudeChange(String(longitude));
        setSourceSuggestions([]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const sourcePoint = useMemo(() => {
    const lat = parseCoordinate(searchSourceLatitude), lon = parseCoordinate(searchSourceLongitude);
    return lat !== null && lon !== null ? { latitude: lat, longitude: lon } : null;
  }, [searchSourceLatitude, searchSourceLongitude]);

  const destinationPoint = useMemo(() => {
    const lat = parseCoordinate(searchDestinationLatitude), lon = parseCoordinate(searchDestinationLongitude);
    return lat !== null && lon !== null ? { latitude: lat, longitude: lon } : null;
  }, [searchDestinationLatitude, searchDestinationLongitude]);

  const routeCoordinates = useMemo<[number, number][]>(() => {
    if (!sourcePoint || !destinationPoint) return [];
    return [[sourcePoint.longitude, sourcePoint.latitude], [destinationPoint.longitude, destinationPoint.latitude]];
  }, [sourcePoint, destinationPoint]);

  useEffect(() => {
    const trimmed = searchSource.trim();
    if (trimmed.length < 3) { setSourceSuggestions([]); return; }
    const id = setTimeout(async () => {
      setIsSearchingSource(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(trimmed)}`);
        setSourceSuggestions(res.ok ? (await res.json()) as NominatimSuggestion[] : []);
      } catch { setSourceSuggestions([]); } finally { setIsSearchingSource(false); }
    }, 350);
    return () => clearTimeout(id);
  }, [searchSource]);

  useEffect(() => {
    const trimmed = searchDestination.trim();
    if (trimmed.length < 3) { setDestinationSuggestions([]); return; }
    const id = setTimeout(async () => {
      setIsSearchingDestination(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(trimmed)}`);
        setDestinationSuggestions(res.ok ? (await res.json()) as NominatimSuggestion[] : []);
      } catch { setDestinationSuggestions([]); } finally { setIsSearchingDestination(false); }
    }, 350);
    return () => clearTimeout(id);
  }, [searchDestination]);

  useEffect(() => {
    if (!mapRef.current || !sourcePoint || !destinationPoint) return;
    mapRef.current.fitBounds(
      [[Math.min(sourcePoint.longitude, destinationPoint.longitude), Math.min(sourcePoint.latitude, destinationPoint.latitude)],
       [Math.max(sourcePoint.longitude, destinationPoint.longitude), Math.max(sourcePoint.latitude, destinationPoint.latitude)]],
      { padding: 60, duration: 700, maxZoom: 15 }
    );
  }, [sourcePoint, destinationPoint]);

  return (
    <div className="d-section" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 className="d-section-title">Search Rides</h2>

      {/* Location inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Source */}
        <div style={{ position: "relative" }}>
          <label className="d-label">From</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={searchSource}
              onChange={e => { onSearchSourceChange(e.target.value); onSearchSourceLatitudeChange(""); onSearchSourceLongitudeChange(""); }}
              placeholder="Pickup location"
              className="d-input"
            />
            <button type="button" className="d-btn-ghost" onClick={useCurrentLocation}
              style={{ flexShrink: 0, padding: "8px 12px" }} title="Use my location">
              📍
            </button>
          </div>
          {isSearchingSource && <p className="d-muted" style={{ marginTop: 4 }}>Searching…</p>}
          {sourceSuggestions.length > 0 && (
            <div className="d-suggestions">
              {sourceSuggestions.map(s => (
                <button key={`${s.lat}-${s.lon}`} type="button" className="d-suggestion-item"
                  onClick={() => { onSearchSourceChange(s.display_name); onSearchSourceLatitudeChange(s.lat); onSearchSourceLongitudeChange(s.lon); setSourceSuggestions([]); }}>
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination */}
        <div style={{ position: "relative" }}>
          <label className="d-label">To</label>
          <input
            value={searchDestination}
            onChange={e => { onSearchDestinationChange(e.target.value); onSearchDestinationLatitudeChange(""); onSearchDestinationLongitudeChange(""); }}
            placeholder="Drop-off location"
            className="d-input"
          />
          {isSearchingDestination && <p className="d-muted" style={{ marginTop: 4 }}>Searching…</p>}
          {destinationSuggestions.length > 0 && (
            <div className="d-suggestions">
              {destinationSuggestions.map(s => (
                <button key={`${s.lat}-${s.lon}`} type="button" className="d-suggestion-item"
                  onClick={() => { onSearchDestinationChange(s.display_name); onSearchDestinationLatitudeChange(s.lat); onSearchDestinationLongitudeChange(s.lon); setDestinationSuggestions([]); }}>
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button className="d-btn-accent" onClick={onSearch} style={{ alignSelf: "flex-start" }}>
        Search Rides →
      </button>

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
            <MapControls showZoom />
          </Map>
        </div>
      </div>

      <hr className="d-divider" />

      {/* Search results */}
      <div>
        <h3 className="d-subsection-title">Search Results</h3>
        {searchedRides.length === 0
          ? <p className="d-muted">Search above to find rides on your route.</p>
          : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {searchedRides.map(({ ride, estimatedFare, segmentDistanceKm }) => (
                <RideCard key={ride.id} ride={ride} estimatedFare={estimatedFare} segmentDistanceKm={segmentDistanceKm}
                  seatsByRide={seatsByRide} setSeatsByRide={setSeatsByRide} onBookRide={onBookRide} bookingRideId={bookingRideId} />
              ))}
            </div>
        }
      </div>

      <hr className="d-divider" />

      {/* All active rides */}
      <div>
        <h3 className="d-subsection-title">All Active Rides</h3>
        {activeRides.length === 0
          ? <p className="d-muted">No active rides available right now.</p>
          : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activeRides.map(ride => <RideCard key={ride.id} ride={ride} />)}
            </div>
        }
      </div>
    </div>
  );
}