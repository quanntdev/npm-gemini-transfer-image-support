const GeminiClient = require('../services/gemini')

const geminiClient = new GeminiClient({
    apiKey: "apikey",
    lang: "English"
})

const handleGetData = async () => {
    try {
        const response = await geminiClient.readContentFromImage({
            imagePart: 'png',
            importantContentView: "Custom text",
            customLabelImportant: "custom_text"
        });
        console.log('API Response:', response);
    } catch (error) {
        console.error(error.message);
    }
}

handleGetData()