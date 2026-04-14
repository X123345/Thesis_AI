const history = [];

function addHistory(record) {
  history.unshift({
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...record
  });
  if (history.length > 50) {
    history.pop();
  }
}

function listHistory() {
  return history;
}

module.exports = {
  addHistory,
  listHistory
};
