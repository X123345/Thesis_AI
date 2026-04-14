const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ZipStreamModule = require("zip-stream");
const { listHistory, addHistory } = require("../service/history.service");
const { readPrompt } = require("../service/prompt.service");
const { callAiModel } = require("../config/ai.config");

function exportWord(req, res) {
  const content = req.query.content || req.body?.content || "暂无论文内容";
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

  const ZipStream = ZipStreamModule.default || ZipStreamModule;
  const archive = new ZipStream();
  archive.pipe(res);

  const model = (req.query.model || req.body?.model || "deepseek").toString();
  const projectName = (req.query.projectName || req.body?.projectName || "thesis-sample-code").toString();
  const content = (req.query.content || req.body?.content || "").toString();
  const requirementText = (req.query.requirementText || req.body?.requirementText || "").toString();
  const codeText = (req.query.codeText || req.body?.codeText || "").toString();

  const samplePackage = JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      scripts: { start: "node src/main.js" }
    },
    null,
    2
  );

  const history = JSON.stringify(listHistory(), null, 2);
  const systemPrompt = readPrompt("code.prompt.txt");

  const buildAndWriteZip = (mainCode) => {
    const readmeContent = [
      `# ${projectName}`,
      "",
      "该代码由 ThesisAI Pro 按论文内容生成。",
      "",
      "## 使用方式",
      "",
      "```bash",
      "npm install",
      "npm run start",
      "```"
    ].join("\n");

    archive.entry(samplePackage, { name: "package.json" }, (pkgErr) => {
      if (pkgErr) {
        res.status(500).end("生成 ZIP 失败");
        return;
      }
      archive.entry(mainCode, { name: "src/main.js" }, (mainErr) => {
        if (mainErr) {
          res.status(500).end("生成 ZIP 失败");
          return;
        }
        archive.entry(readmeContent, { name: "README.md" }, (readmeErr) => {
          if (readmeErr) {
            res.status(500).end("生成 ZIP 失败");
            return;
          }
          archive.entry(history, { name: "history.json" }, () => {
            archive.finalize();
          });
        });
      });
    });
  };

  if (codeText) {
    addHistory({
      stage: "export-code",
      model,
      source: "custom-code",
      projectName
    });
    buildAndWriteZip(codeText);
    return;
  }

  const promptText = [
    `项目名：${projectName}`,
    "论文内容：",
    content || "无",
    "",
    "需求说明：",
    requirementText || "无",
    "",
    "请直接输出可运行的 JavaScript 源码（单文件）"
  ].join("\n");

  callAiModel({
    modelName: model,
    systemPrompt,
    userPrompt: promptText,
    temperature: 0.3,
    maxTokens: 3072
  })
    .then((aiCode) => {
      const generatedCode =
        String(aiCode || "")
          .replace(/^```javascript\s*/i, "")
          .replace(/^```js\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/, "")
          .trim() ||
        'console.log("No code generated.");';

      addHistory({
        stage: "export-code",
        model,
        source: "ai",
        projectName,
        contentLength: content.length,
        requirementLength: requirementText.length
      });

      buildAndWriteZip(generatedCode);
    })
    .catch((error) => {
      res.status(500).json({ message: "导出代码包失败", error: error.message });
    });
}

module.exports = {
  exportWord,
  exportCode
};
