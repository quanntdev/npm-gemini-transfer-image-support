const transferTextToJson = (text) => {
  const clearText = text.replace(/^```json\s*/, "").replace(/```$/, "");
  return JSON.parse(clearText)
};

module.exports = {
    transferTextToJson
};