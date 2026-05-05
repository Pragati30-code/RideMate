import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { getAuthToken } from "./api";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

let client: Client | null = null;
let connectPromise: Promise<Client> | null = null;

function buildClient(token: string): Client {
  return new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
}

export function connectWs(): Promise<Client> {
  if (client?.active) return Promise.resolve(client);
  if (connectPromise) return connectPromise;

  const token = getAuthToken();
  if (!token) return Promise.reject(new Error("No auth token"));

  const c = buildClient(token);
  connectPromise = new Promise<Client>((resolve, reject) => {
    c.onConnect = () => {
      client = c;
      connectPromise = null;
      resolve(c);
    };
    c.onStompError = (frame) => {
      connectPromise = null;
      reject(new Error(frame.headers["message"] || "STOMP error"));
    };
    c.onWebSocketError = () => {
      connectPromise = null;
      reject(new Error("WebSocket error"));
    };
    c.activate();
  });
  return connectPromise;
}

export async function subscribe<T = unknown>(
  destination: string,
  handler: (payload: T, message: IMessage) => void,
): Promise<StompSubscription> {
  const c = await connectWs();
  return c.subscribe(destination, (msg) => {
    try {
      handler(JSON.parse(msg.body) as T, msg);
    } catch {
      handler(msg.body as unknown as T, msg);
    }
  });
}

export async function publish(destination: string, body?: unknown): Promise<void> {
  const c = await connectWs();
  c.publish({
    destination,
    body: body === undefined ? "" : JSON.stringify(body),
  });
}

export function disconnectWs(): void {
  client?.deactivate();
  client = null;
  connectPromise = null;
}
