const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ZipStream = require("zip-stream");
const { listHistory } = require("../service/history.service");

function exportWord(req, res) {
  const content = req.query.content || "暂无论文内容";
  const templatePath = path.resolve(__dirname, "../templates/thesis-template.docx");

  try {
    if (!fs.existsSync(templatePath)) {
      return res
        .status(200)
        .setHeader("Content-Type", "application/msword")
        .setHeader("Content-Disposition", 'attachment; filename="thesis.doc"')
        .send(content);
    }

    const binary = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(binary);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render({ thesisContent: content });
    const output = doc.getZip().generate({ type: "nodebuffer" });

    res
      .status(200)
      .setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
      .setHeader("Content-Disposition", 'attachment; filename="thesis.docx"')
      .send(output);
  } catch (error) {
    res.status(500).json({ message: "导出 Word 失败", error: error.message });
  }
}

function exportCode(req, res) {
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="thesis-code.zip"');

  const archive = new ZipStream();
  archive.pipe(res);

  const samplePackage = JSON.stringify(
    {
      name: "thesis-sample-code",
      version: "1.0.0",
      scripts: { start: "node index.js" }
    },
    null,
    2
  );

  const sampleCode = `/**
 * ThesisAI Pro 自动生成示例代码
 */
function run() {
  console.log("Hello ThesisAI Pro!");
}

run();
`;

  const history = JSON.stringify(listHistory(), null, 2);

  archive.entry(samplePackage, { name: "package.json" }, () => {
    archive.entry(sampleCode, { name: "index.js" }, () => {
      archive.entry(history, { name: "history.json" }, () => {
        archive.finalize();
      });
    });
  });
}

module.exports = {
  exportWord,
  exportCode
};
import path from "node:path";
import { exportCodeZip, exportPdf, exportWord } from "../service/export.service.js";

export async function exportWordFile(req, res, next) {
  try {
    const thesisText = req.query.thesisText || req.body?.thesisText || "";
    const filePath = await exportWord(String(thesisText));
    res.download(filePath, "thesis-final.docx");
  } catch (error) {
    next(error);
  }
}

export async function exportPdfFile(req, res, next) {
  try {
    const thesisText = req.query.thesisText || req.body?.thesisText || "";
    const filePath = await exportPdf(String(thesisText));
    res.download(filePath, "thesis-final.pdf");
  } catch (error) {
    next(error);
  }
}

export async function exportCodeFile(req, res, next) {
  try {
    const codeText = req.query.codeText || req.body?.codeText || "";
    const filePath = await exportCodeZip(String(codeText));
    res.download(filePath, path.basename(filePath));
  } catch (error) {
    next(error);
  }
}
