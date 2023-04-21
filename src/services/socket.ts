import { io } from "socket.io-client";

export const socket = io(":3000", {
  forceNew: true,
  timeout : 70_000,
  transports : ["websocket"]
});
