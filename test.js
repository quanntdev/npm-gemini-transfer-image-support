const GeminiClient = require('./services/gemini')

const geminiClient = new GeminiClient('apiKey')

const handleGetData = async () => {
    try {
        const response = await geminiClient.handleGenerateContentFromImage("place.jpg");
        console.log('API Response:', response);
    } catch (error) {
        console.error(error.message);
    }
}

handleGetData()