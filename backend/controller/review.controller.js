const { callAiModel } = require("../config/ai.config");
const { readPrompt } = require("../service/prompt.service");
const { addHistory } = require("../service/history.service");

function splitParagraphs(text) {
  return (text || "")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function aiReview(req, res) {
  try {
    const { model = "deepseek", content = "" } = req.body;
    const paragraphs = splitParagraphs(content);
    const systemPrompt = readPrompt("review.prompt.txt");

    const reviewed = await Promise.all(
      paragraphs.map(async (paragraph, index) => {
        const aiRaw = await callAiModel({
          modelName: model,
          systemPrompt,
          userPrompt: `请评审并优化以下第${index + 1}段：\n${paragraph}`,
          temperature: 0.4
        });

        return {
          index: index + 1,
          original: paragraph,
          logicScore: Math.max(6, 10 - (paragraph.length < 80 ? 2 : 0)),
          fluencyScore: Math.max(6, 10 - (paragraph.length < 60 ? 2 : 0)),
          terminologyCheck: "建议检查专业术语是否与摘要、关键词一致。",
          suggestion: "可增加过渡句并强化因果关系。",
          optimized: aiRaw || paragraph
        };
      })
    );

    addHistory({ stage: "review", model, contentLength: content.length, reviewed });
    res.json({ model, reviewed });
  } catch (error) {
    res.status(500).json({ message: "AI 评审失败", error: error.message });
  }
}

module.exports = {
  aiReview
};
import { reviewParagraphs } from "../service/ai.service.js";

export async function aiReview(req, res, next) {
  try {
    const { modelProvider = "deepseek", text = "" } = req.body || {};
    if (!text) {
      return res.status(400).json({ message: "text 不能为空" });
    }
    const items = await reviewParagraphs({ modelProvider, text });
    res.json({
      message: "评审完成",
      modelProvider,
      items
    });
  } catch (error) {
    next(error);
  }
}
