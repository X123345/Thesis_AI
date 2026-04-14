const { readPrompt } = require("../service/prompt.service");
const { addHistory } = require("../service/history.service");
const { callAiModel } = require("../config/ai.config");

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
    const {
      chartType = "系统架构图",
      topic = "论文主题",
      provider = "mermaid",
      model = "deepseek",
      context = ""
    } = req.body || {};
    const prompt = readPrompt("chart.prompt.txt");

    let imageUrl = "";
    const fallbackMermaidCode = toMermaid(chartType, topic);
    let mermaidCode = fallbackMermaidCode;
    const useAiMermaid = provider === "ai" || provider === "llm";

    if (useAiMermaid) {
      const userPrompt = [
        `图表类型：${chartType}`,
        `论文主题：${topic}`,
        "补充上下文：",
        context || "无",
        "",
        "请仅输出 Mermaid 代码，不要输出解释文字。"
      ].join("\n");

      const aiMermaid = await callAiModel({
        modelName: model,
        systemPrompt: prompt,
        userPrompt,
        temperature: 0.4
      });

      if (aiMermaid) {
        mermaidCode = String(aiMermaid)
          .replace(/^```mermaid\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
      }
    }

    if (provider === "ernie" && process.env.BAIDU_FANYI_API_KEY) {
      imageUrl = "https://via.placeholder.com/1024x768.png?text=ERNIE+Image+Placeholder";
    } else {
      // 不阻塞请求校验远程渲染服务，避免网络波动导致接口失败。
      const encoded = Buffer.from(mermaidCode).toString("base64");
      imageUrl = `https://mermaid.ink/img/${encoded}`;

      if (!mermaidCode.includes("flowchart") && !mermaidCode.includes("graph")) {
        mermaidCode = fallbackMermaidCode;
        const fallbackEncoded = Buffer.from(mermaidCode).toString("base64");
        imageUrl = `https://mermaid.ink/img/${fallbackEncoded}`;
      }
    }

    addHistory({ stage: "chart", chartType, topic, provider, model, prompt });
    res.json({ chartType, topic, provider, model, mermaidCode, imageUrl });
  } catch (error) {
    res.status(500).json({ message: "图表生成失败", error: error.message });
  }
}

module.exports = {
  generateChart
};
