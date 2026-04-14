const axios = require("axios");
const { readPrompt } = require("../service/prompt.service");
const { addHistory } = require("../service/history.service");

function toMermaid(type, topic) {
  if (type === "数据流程图") {
    return `flowchart LR
    A[数据源] --> B[预处理]
    B --> C[特征工程]
    C --> D[模型训练]
    D --> E[评估与可视化]
    E --> F[论文结论：${topic}]`;
  }

  if (type === "系统架构图") {
    return `flowchart TB
    U[用户] --> F[Vue 前端]
    F --> B[Express 后端]
    B --> M[AI 模型网关]
    M --> D1[DeepSeek]
    M --> D2[Kimi]
    M --> D3[豆包]
    B --> S[导出与存储]
    S --> W[Word/PDF/ZIP]`;
  }

  return `flowchart TD
  A[需求输入] --> B[论文生成]
  B --> C[AI 评审]
  C --> D[图表生成]
  D --> E[导出提交]
  E --> F[${topic}]`;
}

async function generateChart(req, res) {
  try {
    const { chartType = "系统架构图", topic = "论文主题", provider = "mermaid" } = req.body;
    const prompt = readPrompt("chart.prompt.txt");

    let imageUrl = "";
    let mermaidCode = toMermaid(chartType, topic);

    if (provider === "ernie" && process.env.BAIDU_FANYI_API_KEY) {
      imageUrl = "https://via.placeholder.com/1024x768.png?text=ERNIE+Image+Placeholder";
    } else {
      const encoded = Buffer.from(mermaidCode).toString("base64");
      imageUrl = `https://mermaid.ink/img/${encoded}`;
      await axios.get(imageUrl, { timeout: 15000 });
    }

    addHistory({ stage: "chart", chartType, topic, provider, prompt });
    res.json({ chartType, topic, provider, mermaidCode, imageUrl });
  } catch (error) {
    res.status(500).json({ message: "图表生成失败", error: error.message });
  }
}

module.exports = {
  generateChart
};
import { generateChartSpec } from "../service/chart.service.js";

export async function generateChart(req, res, next) {
  try {
    const {
      modelProvider = "deepseek",
      chartType = "系统架构图",
      context = ""
    } = req.body || {};

    const chart = await generateChartSpec({
      modelProvider,
      chartType,
      context
    });

    res.json({
      message: "图表生成成功",
      ...chart
    });
  } catch (error) {
    next(error);
  }
}
