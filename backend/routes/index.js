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
router.get("/history", (req, res) => res.json({ items: listHistory() }));

module.exports = router;
import { Router } from "express";
import { upload, parseWord } from "../controller/upload.controller.js";
import {
  generateMid,
  generateProposal,
  generateThesis
} from "../controller/generate.controller.js";
import { aiReview } from "../controller/review.controller.js";
import { generateChart } from "../controller/chart.controller.js";
import {
  exportCodeFile,
  exportPdfFile,
  exportWordFile
} from "../controller/export.controller.js";

const router = Router();

router.post("/upload/word", upload.single("file"), parseWord);

router.post("/generate/thesis", generateThesis);
router.post("/generate/proposal", generateProposal);
router.post("/generate/mid", generateMid);

router.post("/ai/review", aiReview);
router.post("/chart/generate", generateChart);

router.get("/export/word", exportWordFile);
router.get("/export/pdf", exportPdfFile);
router.get("/export/code", exportCodeFile);

export default router;
