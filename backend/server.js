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
