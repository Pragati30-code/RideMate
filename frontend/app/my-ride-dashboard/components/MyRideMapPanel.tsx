import { CurrentUserBooking, DriverRideBooking } from "@/app/dashboard/types";
import { Map, MapControls, MapMarker, MarkerContent, MarkerLabel, type MapRef } from "@/components/ui/map";
import { RefObject } from "react";

const DEFAULT_MAP_CENTER: [number, number] = [77.209, 28.6139];

type MyRideMapPanelProps = {
  currentBooking: CurrentUserBooking;
  mapRef: RefObject<MapRef | null>;
  dropMarkers: DriverRideBooking[];
};

export default function MyRideMapPanel({ currentBooking, mapRef, dropMarkers }: MyRideMapPanelProps) {
  return (
    <div className="mrd-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 className="font-display" style={{ fontSize: 19, fontWeight: 800, color: "#1e1e1e", letterSpacing: "-0.4px" }}>
          Live Passenger Map
        </h2>
        <span className="font-body" style={{ fontSize: 12, color: "#a09890" }}>
          Source + all passenger drops
        </span>
      </div>
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
          <MapControls showZoom />
        </Map>
      </div>
    </div>
  );
}
