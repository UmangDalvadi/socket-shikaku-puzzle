import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import expressLayouts from "express-ejs-layouts";
import { generateShikakuBoard } from "./controllers/generateGrid.js";

dotenv.config();
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again after 15 minutes.",
});
app.use(limiter);

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(expressLayouts);
app.set("layout", "./layout.ejs");

app.use(express.static("./src/public"));

app.get("/", (req, res) => {
  res.render("game/home");
});

app.get("/play-ground", (req, res) => {
  const size = parseInt(req.query.size) || 5;
  const board = generateShikakuBoard(size, size);
  console.log("=============================================");
  console.log(board.map((row) => row.join(" ")).join("\n"));
  console.log("=============================================");
  res.render("game/game", { board, size });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is UP" });
});

app.get("*", (req, res) => {
  res.send("404 Not Found");
});

export default app;
