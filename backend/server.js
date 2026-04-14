const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.resolve(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", require("./routes"));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "ThesisAI Pro backend running" });
});

app.listen(PORT, () => {
  console.log(`ThesisAI Pro backend listening on http://localhost:${PORT}`);
});
import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "thesis-ai-pro-backend" });
});

app.use("/api", routes);

app.use((err, _req, res, _next) => {
  console.error("[server-error]", err);
  res.status(500).json({
    message: "服务器异常",
    detail: err?.message || "Unknown error"
  });
});

app.listen(port, () => {
  console.log(`ThesisAI Pro backend running: http://localhost:${port}`);
});
