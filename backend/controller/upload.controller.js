const mammoth = require("mammoth");

async function uploadWord(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "请上传 .docx 文件" });
    }

    const result = await mammoth.extractRawText({ path: req.file.path });
    return res.json({
      fileName: req.file.originalname,
      extractedText: result.value || "",
      warnings: result.messages || []
    });
  } catch (error) {
    return res.status(500).json({ message: "Word 解析失败", error: error.message });
  }
}

module.exports = {
  uploadWord
};
import fs from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), "uploads");

await fs.mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

export const upload = multer({ storage });

export async function parseWord(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "请上传 Word 文件" });
    }

    const result = await mammoth.extractRawText({ path: req.file.path });
    res.json({
      message: "Word 解析成功",
      fileName: req.file.originalname,
      text: result.value || ""
    });
  } catch (error) {
    next(error);
  }
}
