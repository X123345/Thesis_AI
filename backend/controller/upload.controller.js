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
