// utils/socket.ts
import { io } from "socket.io-client";

export const socket = io("https://jarvisbackend-production.up.railway.app", {
  transports: ["websocket"],
  autoConnect: false, // so you control when to connect
});
