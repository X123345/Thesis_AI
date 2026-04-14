const fs = require("fs");
const path = require("path");

function readPrompt(promptName) {
  const filePath = path.resolve(__dirname, `../../prompts/${promptName}`);
  if (!fs.existsSync(filePath)) {
    return "";
  }
  return fs.readFileSync(filePath, "utf-8");
}

module.exports = {
  readPrompt
};
