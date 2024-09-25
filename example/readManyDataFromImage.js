const GeminiClient = require('../services/gemini')

const geminiClient = new GeminiClient({
    apiKey: "apikey",
    lang: "English"
})

const handleGetData = async () => {
    try {
        const response = await geminiClient.readManyDataFromImage({
            imagePart: 'data.png',
            customField: [
                {
                    label: "product_name",
                    description: "Name of product"
                },
                {
                    label: "product_price",
                    description: "Price of product"
                },
                {
                    label: "product_sale",
                    description: "Sale of product"
                }
            ]
        });
        console.log('API Response:', response);
    } catch (error) {
        console.error(error.message);
    }
}

handleGetData()