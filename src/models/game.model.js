// filepath: d:\CODE KA DOZE\CTPL\socket.io-shikaku\src\models\gameData.js
import mongoose from "mongoose";

const gameDataSchema = new mongoose.Schema(
  {
    hostname: { type: String, required: true },
    selectedAreas: { type: Array, required: true },
  },
  {
    timestamps: true,
  }
);

const GameData = mongoose.model("GameData", gameDataSchema);

export default GameData;
