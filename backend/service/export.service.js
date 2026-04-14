import fs from "node:fs";
import fsPromise from "node:fs/promises";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { Document, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";
import ZipStream from "zip-stream";

const generatedDir = path.resolve(process.cwd(), "generated");
const templatePath = path.resolve(process.cwd(), "templates", "thesis-template.docx");

async function ensureGeneratedDir() {
  await fsPromise.mkdir(generatedDir, { recursive: true });
}

async function buildDocxByTemplater(thesisText) {
  try {
    const content = await fsPromise.readFile(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render({ thesis: thesisText });
    return doc.getZip().generate({ type: "nodebuffer" });
  } catch {
    return null;
  }
}

async function buildDocxFallback(thesisText) {
  const lines = String(thesisText || "暂无论文内容")
    .split("\n")
    .map((line) =>
      new Paragraph({
        children: [new TextRun(line || " ")]
      })
    );
  const doc = new Document({
    sections: [{ properties: {}, children: lines }]
  });
  return Packer.toBuffer(doc);
}

export async function exportWord(thesisText) {
  await ensureGeneratedDir();
  const byTemplate = await buildDocxByTemplater(thesisText);
  const buffer = byTemplate || (await buildDocxFallback(thesisText));
  const outputPath = path.join(generatedDir, "thesis-final.docx");
  await fsPromise.writeFile(outputPath, buffer);
  return outputPath;
}

export async function exportPdf(thesisText) {
  await ensureGeneratedDir();
  const outputPath = path.join(generatedDir, "thesis-final.pdf");
  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  doc.fontSize(16).text("ThesisAI Pro 导出论文", { align: "center" });
  doc.moveDown();
  doc.fontSize(11).text(String(thesisText || "暂无内容"), { lineGap: 4 });
  doc.end();
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
  return outputPath;
}

export async function exportCodeZip(codeText = "") {
  await ensureGeneratedDir();
  const outputPath = path.join(generatedDir, "thesis-code.zip");
  const output = fs.createWriteStream(outputPath);
  const archive = new ZipStream();
  archive.pipe(output);

  await new Promise((resolve, reject) => {
    archive.entry(
      String(codeText || "// TODO: 在此放入配套代码"),
      { name: "src/main.js" },
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        archive.entry(
          "node src/main.js",
          { name: "README.md" },
          (readmeErr) => {
            if (readmeErr) {
              reject(readmeErr);
              return;
            }
            archive.finish();
          }
        );
      }
    );
    output.on("close", resolve);
    output.on("error", reject);
  });

  return outputPath;
}
