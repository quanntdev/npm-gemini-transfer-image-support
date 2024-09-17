const GeminiClient = require('../services/gemini')

const geminiClient = new GeminiClient({
    apiKey: "apikey",
    lang: "Vietnamese"
})

const handleGetData = async () => {
    try {
        const response = await geminiClient.handleGenerateContentFromImageCloud({
            filePath: 'jpg',
            numberRecords: 6,
            feeling: ["respect", "pride"]
        });
        console.log('API Response:', response);
    } catch (error) {
        console.error(error.message);
    }
}

handleGetData()