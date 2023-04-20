import { io } from "socket.io-client";

export const socket = io("wss://c181cf175067ad.lhr.life/", {
  forceNew: true,
  timeout : 70_000,
  transports : ["websocket"]
});
