const { callAiModel } = require("../config/ai.config");
const { readPrompt } = require("../service/prompt.service");
const { addHistory } = require("../service/history.service");

async function generateByType(req, res, type) {
  try {
    const { model = "deepseek", requirementText = "", title = "未命名课题" } = req.body;
    const systemPrompt = readPrompt("thesis.prompt.txt");
    const userPrompt = [
      `任务类型：${type}`,
      `论文题目：${title}`,
      "需求文本：",
      requirementText || "无"
    ].join("\n");

    const content = await callAiModel({
      modelName: model,
      systemPrompt,
      userPrompt
    });

    addHistory({ stage: `generate-${type}`, model, title, content });
    res.json({ type, model, title, content });
  } catch (error) {
    res.status(500).json({ message: "论文生成失败", error: error.message });
  }
}

async function generateThesis(req, res) {
  return generateByType(req, res, "thesis");
}

async function generateProposal(req, res) {
  return generateByType(req, res, "proposal");
}

async function generateMid(req, res) {
  return generateByType(req, res, "mid");
}

module.exports = {
  generateThesis,
  generateProposal,
  generateMid
};
import { generateThesisByType } from "../service/ai.service.js";

async function generateByType(req, res, next, type) {
  try {
    const { modelProvider = "deepseek", requirementText = "" } = req.body || {};
    if (!requirementText) {
      return res.status(400).json({ message: "requirementText 不能为空" });
    }
    const content = await generateThesisByType({
      modelProvider,
      requirementText,
      type
    });
    res.json({ type, modelProvider, content });
  } catch (error) {
    next(error);
  }
}

export function generateThesis(req, res, next) {
  return generateByType(req, res, next, "thesis");
}

export function generateProposal(req, res, next) {
  return generateByType(req, res, next, "proposal");
}

export function generateMid(req, res, next) {
  return generateByType(req, res, next, "mid");
}
