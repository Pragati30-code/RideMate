"use client";

import { useEffect, useState } from "react";

import { subscribe } from "./ws";

export type DriverPos = {
  lat: number;
  lng: number;
  speedKmh: number | null;
  ts: number;
};

export type EtaSnapshot = {
  etaSeconds: number;
  distanceM: number;
  ts: number;
};

type Options = {
  rideId: number | null;
  bookingId: number | null;
};

export function useRideLiveLocation({ rideId, bookingId }: Options) {
  const [driverPos, setDriverPos] = useState<DriverPos | null>(null);
  const [eta, setEta] = useState<EtaSnapshot | null>(null);

  useEffect(() => {
    if (!rideId) {
      setDriverPos(null);
      return;
    }
    let sub: { unsubscribe: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const s = await subscribe<DriverPos>(`/topic/rides/${rideId}/location`, (payload) => {
          setDriverPos(payload);
        });
        if (cancelled) {
          s.unsubscribe();
          return;
        }
        sub = s;
      } catch {
        // Silent — UI just won't show a moving dot
      }
    })();
    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, [rideId]);

  useEffect(() => {
    if (!bookingId) {
      setEta(null);
      return;
    }
    let sub: { unsubscribe: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const s = await subscribe<{ etaSeconds: number; distanceM: number }>(
          `/topic/bookings/${bookingId}/eta`,
          (payload) => {
            setEta({ etaSeconds: payload.etaSeconds, distanceM: payload.distanceM, ts: Date.now() });
          },
        );
        if (cancelled) {
          s.unsubscribe();
          return;
        }
        sub = s;
      } catch {
        // Silent
      }
    })();
    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, [bookingId]);

  return { driverPos, eta };
}
