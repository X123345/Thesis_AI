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

export async function generateChartSpec({ modelProvider, chartType, context }) {
  const chartPrompt = await readPrompt(
    "chart.prompt.txt",
    "请生成可用于 Mermaid 的图表描述。"
  );

  const { content } = await chatCompletion({
    provider: modelProvider,
    systemPrompt: chartPrompt,
    userPrompt: `图表类型：${chartType}\n\n上下文：${context}`
  });

  return {
    chartType,
    mermaid:
      content ||
      "flowchart TD\nA[开始] --> B[上传需求]\nB --> C[AI生成论文]\nC --> D[评审调优]\nD --> E[导出结果]"
  };
}
