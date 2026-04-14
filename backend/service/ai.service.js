import fs from "node:fs/promises";
import path from "node:path";
import { chatCompletion } from "../config/ai.config.js";

const promptsDir = path.resolve(process.cwd(), "..", "prompts");

async function readPrompt(fileName, fallbackText) {
  try {
    const filePath = path.join(promptsDir, fileName);
    return await fs.readFile(filePath, "utf8");
  } catch {
    return fallbackText;
  }
}

export async function generateThesisByType({
  modelProvider,
  requirementText,
  type = "thesis"
}) {
  const basePrompt = await readPrompt(
    "thesis.prompt.txt",
    "你是学术论文写作助手，请生成结构完整、学术规范的内容。"
  );
  const userPrompt = `生成类型：${type}\n\n需求文本：\n${requirementText}`;
  const { content } = await chatCompletion({
    provider: modelProvider,
    systemPrompt: basePrompt,
    userPrompt
  });

  return content;
}

export async function reviewParagraphs({ modelProvider, text }) {
  const reviewPrompt = await readPrompt(
    "review.prompt.txt",
    "你是论文质量评审专家，请逐段返回评分与优化建议。"
  );
  const paragraphs = String(text || "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const results = [];
  for (const paragraph of paragraphs) {
    const { content } = await chatCompletion({
      provider: modelProvider,
      systemPrompt: reviewPrompt,
      userPrompt: paragraph,
      temperature: 0.4
    });

    results.push({
      original: paragraph,
      review: content || "未获取到评审内容。"
    });
  }
  return results;
}
