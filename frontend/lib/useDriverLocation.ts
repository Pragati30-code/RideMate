"use client";

import { useEffect, useRef } from "react";

import { publish } from "./ws";

const MIN_PUBLISH_INTERVAL_MS = 800;

type Options = {
  rideId: number | null;
  enabled: boolean;
};

export function useDriverLocation({ rideId, enabled }: Options): void {
  const lastPublishedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !rideId) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    let cancelled = false;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (cancelled) return;
        const now = Date.now();
        if (now - lastPublishedAtRef.current < MIN_PUBLISH_INTERVAL_MS) return;
        lastPublishedAtRef.current = now;

        const speedMps = pos.coords.speed;
        const speedKmh =
          typeof speedMps === "number" && Number.isFinite(speedMps) && speedMps >= 0
            ? speedMps * 3.6
            : null;

        void publish(`/app/rides/${rideId}/location`, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speedKmh,
          ts: now,
        }).catch(() => {
          // Connection hiccups will be retried by the next watchPosition tick.
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          console.warn("Location permission denied; live driver location disabled");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      },
    );

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [rideId, enabled]);
}
