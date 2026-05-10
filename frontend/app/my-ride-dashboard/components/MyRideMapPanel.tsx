import { CurrentUserBooking, DriverRideBooking } from "@/app/dashboard/types";
import { Map, MapControls, MapMarker, MarkerContent, MarkerLabel, type MapRef } from "@/components/ui/map";
import type { DriverPos, EtaSnapshot } from "@/lib/useRideLiveLocation";
import { RefObject } from "react";

const DEFAULT_MAP_CENTER: [number, number] = [77.209, 28.6139];

type MyRideMapPanelProps = {
  currentBooking: CurrentUserBooking;
  mapRef: RefObject<MapRef | null>;
  dropMarkers: DriverRideBooking[];
  driverPos?: DriverPos | null;
  eta?: EtaSnapshot | null;
};

function formatEta(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hours}h` : `${hours}h ${rem}m`;
}

export default function MyRideMapPanel({ currentBooking, mapRef, dropMarkers, driverPos, eta }: MyRideMapPanelProps) {
  const isLive = currentBooking.ride.status === "IN_PROGRESS" && !!driverPos;

  return (
    <div className="mrd-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 className="font-display" style={{ fontSize: 19, fontWeight: 800, color: "#1e1e1e", letterSpacing: "-0.4px" }}>
          Live Passenger Map
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isLive && (
            <span
              className="font-body"
              style={{
                fontSize: 12,
                color: "#2e7d32",
                background: "rgba(100,200,120,0.12)",
                border: "1px solid rgba(100,200,120,0.28)",
                padding: "3px 9px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "#2e7d32",
                  display: "inline-block",
                  animation: "mrd-pulse 1.4s ease-in-out infinite",
                }}
              />
              Driver live
            </span>
          )}
          {isLive && eta && (
            <span
              className="font-body"
              style={{
                fontSize: 12,
                color: "#444",
                background: "rgba(255,155,106,0.12)",
                border: "1px solid rgba(255,155,106,0.3)",
                padding: "3px 9px",
                borderRadius: 999,
              }}
            >
              ETA {formatEta(eta.etaSeconds)} · {(eta.distanceM / 1000).toFixed(1)} km
            </span>
          )}
          {!isLive && (
            <span className="font-body" style={{ fontSize: 12, color: "#a09890" }}>
              Source + all passenger drops
            </span>
          )}
        </div>
      </div>
      <style>{`@keyframes mrd-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: 0.5; } }`}</style>
      <div className="mrd-map">
        <Map
          ref={mapRef}
          center={
            typeof currentBooking.ride.sourceLongitude === "number" && typeof currentBooking.ride.sourceLatitude === "number"
              ? [currentBooking.ride.sourceLongitude, currentBooking.ride.sourceLatitude]
              : DEFAULT_MAP_CENTER
          }
          zoom={10}
          theme="light"
        >
          {typeof currentBooking.ride.sourceLongitude === "number" && typeof currentBooking.ride.sourceLatitude === "number" && (
            <MapMarker longitude={currentBooking.ride.sourceLongitude} latitude={currentBooking.ride.sourceLatitude}>
              <MarkerContent>
                <div className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white/80" />
                <MarkerLabel>Ride Source</MarkerLabel>
              </MarkerContent>
            </MapMarker>
          )}
          {dropMarkers.map((b) => (
            <MapMarker key={b.id} longitude={b.dropLongitude as number} latitude={b.dropLatitude as number}>
              <MarkerContent>
                <div className="h-3 w-3 rounded-full ring-2 ring-white/80" style={{ background: "#ff9b6a" }} />
                <MarkerLabel>{b.user?.name || `Booking ${b.id}`}</MarkerLabel>
              </MarkerContent>
            </MapMarker>
          ))}
          {isLive && driverPos && (
            <MapMarker longitude={driverPos.lng} latitude={driverPos.lat}>
              <MarkerContent>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    background: "#2563eb",
                    boxShadow: "0 0 0 4px rgba(37,99,235,0.25), 0 0 0 8px rgba(37,99,235,0.12)",
                    border: "2px solid white",
                  }}
                />
                <MarkerLabel>Driver</MarkerLabel>
              </MarkerContent>
            </MapMarker>
          )}
          <MapControls showZoom />
        </Map>
      </div>
    </div>
  );
}
