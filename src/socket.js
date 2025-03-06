import { Server } from "socket.io";

let io;
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_DOMAIN, "https://admin.socket.io"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
};

export { initializeSocket, io };
