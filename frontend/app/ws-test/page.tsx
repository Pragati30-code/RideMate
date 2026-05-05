"use client";

import { useEffect, useRef, useState } from "react";

import { connectWs, disconnectWs, publish, subscribe } from "@/lib/ws";

type PongMessage = {
  pong: boolean;
  user: string;
  ts: number;
};

type LogEntry = {
  level: "info" | "error" | "msg";
  text: string;
  at: number;
};

export default function WsTestPage() {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [log, setLog] = useState<LogEntry[]>([]);
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);

  const append = (level: LogEntry["level"], text: string) =>
    setLog((prev) => [{ level, text, at: Date.now() }, ...prev].slice(0, 50));

  useEffect(() => {
    let cancelled = false;
    setStatus("connecting");
    append("info", "Connecting to /ws...");

    (async () => {
      try {
        await connectWs();
        if (cancelled) return;
        const sub = await subscribe<PongMessage>("/topic/ping", (payload) => {
          append(
            "msg",
            `pong from ${payload.user} (round-trip ts=${payload.ts})`,
          );
        });
        subRef.current = sub;
        setStatus("connected");
        append("info", "Connected and subscribed to /topic/ping");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        append("error", err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
      subRef.current?.unsubscribe();
      disconnectWs();
    };
  }, []);

  const sendPing = async () => {
    try {
      await publish("/app/ping");
      append("info", "Sent ping");
    } catch (err) {
      append("error", err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-4">
      <h1 className="text-2xl font-semibold">WebSocket Test</h1>
      <p className="text-sm text-gray-600">
        Status: <span className="font-mono">{status}</span>
      </p>
      <button
        onClick={sendPing}
        disabled={status !== "connected"}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        Send ping
      </button>
      <div className="rounded border p-3 text-sm font-mono space-y-1 max-h-96 overflow-auto">
        {log.length === 0 && <div className="text-gray-400">No events yet</div>}
        {log.map((entry, i) => (
          <div
            key={i}
            className={
              entry.level === "error"
                ? "text-red-600"
                : entry.level === "msg"
                  ? "text-green-700"
                  : "text-gray-700"
            }
          >
            [{new Date(entry.at).toLocaleTimeString()}] {entry.text}
          </div>
        ))}
      </div>
    </main>
  );
}
