import { io } from "socket.io-client";

const url = ':3000'

export const socket = io(url, {
  forceNew: true,
  timeout : 30_000,
  transports : ["websocket"]
});
