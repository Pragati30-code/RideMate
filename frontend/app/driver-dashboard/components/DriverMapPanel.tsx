import { DriverRideBooking, Ride } from "@/app/dashboard/types";
import { Map, MapControls, MapMarker, MarkerContent, MarkerLabel, type MapRef } from "@/components/ui/map";
import { RefObject } from "react";

const DEFAULT_MAP_CENTER: [number, number] = [77.209, 28.6139];

type DriverMapPanelProps = {
  selectedRide: Ride;
  mapRef: RefObject<MapRef | null>;
  dropMarkers: DriverRideBooking[];
  locatingForMaps: boolean;
  onOpenGoogleMaps: () => void;
};

export default function DriverMapPanel({
  selectedRide,
  mapRef,
  dropMarkers,
  locatingForMaps,
  onOpenGoogleMaps,
}: DriverMapPanelProps) {
  return (
    <div className="dd-section">
      <div style={{ marginBottom: 16 }}>
        <h2 className="font-display" style={{ fontSize: 19, fontWeight: 800, color: "#1e1e1e", letterSpacing: "-0.4px" }}>
          Passenger Drop Map
        </h2>
        {selectedRide.status === "IN_PROGRESS" && (
          <p className="font-body" style={{ fontSize: 12, color: "#a09890", marginTop: 3 }}>
            🗺️ Tap the map to navigate to the nearest passenger
          </p>
        )}
      </div>

      <div
        style={{ position: "relative", cursor: selectedRide.status === "IN_PROGRESS" ? "pointer" : "default" }}
        onClick={selectedRide.status === "IN_PROGRESS" ? onOpenGoogleMaps : undefined}
        title={selectedRide.status === "IN_PROGRESS" ? "Click to open Google Maps navigation" : undefined}
      >
        <div className="dd-map">
          <Map
            ref={mapRef}
            center={
              typeof selectedRide.sourceLongitude === "number" && typeof selectedRide.sourceLatitude === "number"
                ? [selectedRide.sourceLongitude, selectedRide.sourceLatitude]
                : DEFAULT_MAP_CENTER
            }
            zoom={10}
            theme="light"
          >
            {typeof selectedRide.sourceLongitude === "number" && typeof selectedRide.sourceLatitude === "number" && (
              <MapMarker longitude={selectedRide.sourceLongitude} latitude={selectedRide.sourceLatitude}>
                <MarkerContent>
                  <div className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white/80" />
                  <MarkerLabel>Source</MarkerLabel>
                </MarkerContent>
              </MapMarker>
            )}
            {dropMarkers.map((b) => (
              <MapMarker key={b.id} longitude={b.dropLongitude as number} latitude={b.dropLatitude as number}>
                <MarkerContent>
                  <div
                    className="h-3 w-3 rounded-full ring-2 ring-white/80"
                    style={{ background: b.status === "DROPPED" ? "#a0a0a0" : b.status === "PICKED_UP" ? "#ffb347" : "#ff9b6a" }}
                  />
                  <MarkerLabel>{b.user?.name || `Booking ${b.id}`}</MarkerLabel>
                </MarkerContent>
              </MapMarker>
            ))}
            <MapControls showZoom />
          </Map>
        </div>

        {selectedRide.status === "IN_PROGRESS" && !locatingForMaps && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(45,45,45,0.82)",
              backdropFilter: "blur(8px)",
              color: "#fdf6ec",
              borderRadius: 50,
              padding: "7px 18px",
              fontFamily: "var(--font-dm),sans-serif",
              fontSize: 12,
              fontWeight: 500,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(45,45,45,0.25)",
            }}
          >
            🗺️ Tap map to navigate → nearest passenger
          </div>
        )}
        {locatingForMaps && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-dm),sans-serif",
              fontSize: 14,
              color: "#3a3530",
              fontWeight: 500,
              gap: 8,
            }}
          >
            <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Getting your location…
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        {[
          { color: "#22c55e", label: "Source" },
          { color: "#ff9b6a", label: "Confirmed (pending pickup)" },
          { color: "#ffb347", label: "Picked up (en route)" },
          { color: "#a0a0a0", label: "Dropped" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span className="font-body" style={{ fontSize: 12, color: "#a09890" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
