import request from "./axios";

export function uploadWord(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request.post("/upload/word", formData);
}

export function generateContent(type, payload) {
  return request.post(`/generate/${type}`, payload);
}

export function reviewContent(payload) {
  return request.post("/ai/review", payload);
}

export function generateChart(payload) {
  return request.post("/chart/generate", payload);
}

export function getHistory() {
  return request.get("/history");
}

export function exportWord(content) {
  return `/api/export/word?content=${encodeURIComponent(content || "")}`;
}

export function exportCode() {
  return "/api/export/code";
}
