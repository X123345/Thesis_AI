const path = require("path");
const express = require("express");
const multer = require("multer");
const { uploadWord } = require("../controller/upload.controller");
const {
  generateThesis,
  generateProposal,
  generateMid
} = require("../controller/generate.controller");
const { aiReview } = require("../controller/review.controller");
const { generateChart } = require("../controller/chart.controller");
const { exportWord, exportCode } = require("../controller/export.controller");
const { listHistory } = require("../service/history.service");

const router = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, "../uploads"),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post("/upload/word", upload.single("file"), uploadWord);
router.post("/generate/thesis", generateThesis);
router.post("/generate/proposal", generateProposal);
router.post("/generate/mid", generateMid);
router.post("/ai/review", aiReview);
router.post("/chart/generate", generateChart);
router.get("/export/word", exportWord);
router.get("/export/code", exportCode);
router.post("/export/code", exportCode);
router.get("/history", (req, res) => res.json({ items: listHistory() }));

module.exports = router;
