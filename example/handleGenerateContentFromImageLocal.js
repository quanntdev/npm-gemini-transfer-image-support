const GeminiClient = require('../services/gemini')

const geminiClient = new GeminiClient({
    apiKey: "apikey",
    lang: "Vietnamese"
})

const handleGetData = async () => {
    try {
        const response = await geminiClient.handleGenerateContentFromImageLocal({
            imageFiles: ['place1.png', 'place2.png', 'place3.png'],
            numberRecords: 4,
        });
        console.log('API Response:', response);
    } catch (error) {
        console.error(error.message);
    }
}

handleGetData()