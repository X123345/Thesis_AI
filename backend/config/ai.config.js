const axios = require("axios");

const modelConfigMap = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    model: "deepseek-chat"
  },
  kimi: {
    apiKey: process.env.KIMI_API_KEY,
    baseUrl: process.env.KIMI_BASE_URL || "https://api.moonshot.cn",
    model: "moonshot-v1-8k"
  },
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY,
    baseUrl: process.env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
    model: "doubao-seed-1-6-flash-250715"
  }
};

function normalizeModel(modelName) {
  const key = (modelName || "deepseek").toLowerCase();
  return modelConfigMap[key] ? key : "deepseek";
}

async function callAiModel({
  modelName,
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxTokens = 2048
}) {
  const normalized = normalizeModel(modelName);
  const config = modelConfigMap[normalized];

  if (!config.apiKey) {
    return `[Mock-${normalized}]\n${userPrompt}\n\n（提示：未配置 API Key，返回了本地模拟结果）`;
  }

  const url = `${config.baseUrl.replace(/\/$/, "")}/v1/chat/completions`;
  const payload = {
    model: config.model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  };

  const { data } = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    timeout: 60000
  });

  return data?.choices?.[0]?.message?.content || "";
}

module.exports = {
  callAiModel,
  normalizeModel
};
