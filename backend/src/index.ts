import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import profileRouter from "./routes/profile";
import presenceRouter from "./routes/presence";
import searchRouter from "./routes/search";
import meetupsRouter from "./routes/meetups";
import postsRouter from "./routes/posts";
import followRouter from "./routes/follow";
import groupsRouter from "./routes/groups";
import { startBot } from "./bot";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/profile", profileRouter);
app.use("/api/presence", presenceRouter);
app.use("/api/search", searchRouter);
app.use("/api/meetups", meetupsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/follow", followRouter);
app.use("/api/groups", groupsRouter);

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
  startBot();
});
