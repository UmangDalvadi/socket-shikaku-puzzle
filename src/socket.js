import { Server } from "socket.io";
import redisClient from "./config/redis.js";
import os from "os";
import GameData from "./models/game.model.js";

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

    socket.on("save-selected-area", async (selectedAreas) => {
      const hostname = os.hostname();
      const key = `selectedAreas:${hostname}`;

      const redisResponse = await redisClient.set(
        key,
        JSON.stringify(selectedAreas)
      );
      // console.log("👍 Redis Response:", redisResponse);
    });

    socket.on("submit-game", async (cb) => {
      try {
        const hostname = os.hostname();
        const key = `selectedAreas:${hostname}`;

        const redisResponse = await redisClient.get(key);
        const redisSelectedAreas = redisResponse
          ? JSON.parse(redisResponse)
          : null;

        if (!redisSelectedAreas || redisSelectedAreas.length === 0) {
          return cb({ error: "🛑 Failed to save game data." });
        }

        const game = new GameData({
          hostname,
          selectedAreas: redisSelectedAreas,
        });
        await game.save();

        await redisClient.del(key);

        cb({ message: "🎉 Game data saved successfully!" });
      } catch (error) {
        console.error("Error saving game:", error);
        cb({ error: "🛑 Internal server error." });
      }
    });

    socket.on("disconnect", async () => {
      console.log("🔴 Client disconnected:", socket.id);

      const hostname = os.hostname();
      const key = `selectedAreas:${hostname}`;

      await redisClient.del(key);
    });
  });
};

export { initializeSocket, io };
