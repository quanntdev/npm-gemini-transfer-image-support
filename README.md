# 🌟 Gemini API Client 🌟

A **simple and powerful** client for interacting with the Gemini API to analyze data from websites.

We are testing the Gemini API for analyzing data from websites, and this package will help you do the same with ease.

---

## 📝 What You Need to Do:

1. **Get an API Key** from [Google Gemini](https://cloud.google.com/ai-platform/gemini).
2. **Install the package** using npm:

```bash
npm gemini-transfer-image-support
```

## 👨🏻‍💻 Information:
- Link Packages: [gemini-transfer-image-support](https://www.npmjs.com/package/gemini-transfer-image-support)
- Link Github: [gemini-transfer-image-support](https://github.com/quanntdev/npm-gemini-transfer-image-support)

## 📚 Usage:
### Example of `readManyDataFromImage` function:
description: The function is used to analyze data into multiple image elements.

```javascript
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
```

### Example of `handleGenerateContentFromImageLocal` function:
description: The function is used to analyze data into multiple image elements.

```javascript
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
```
