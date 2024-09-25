const axios = require("axios");
const createAxiosInstance = require("../config/gemini");
const { GEMINI_CONFIG, LANGUAGE } = require("../constants/gemini");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const {
  handleGenderSchemaRenderImage,
  handleGenderSchemaReadImage,
  handleRenderManyDataFromImage,
} = require("../prompt/gemini");

class GeminiServices {
  constructor({ apiKey, modal, lang }) {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    this.geminiModal = modal || GEMINI_CONFIG.FLASH_MODEL_TYPE;

    this.language = lang || LANGUAGE.EN;

    this.axiosInstance = createAxiosInstance(apiKey);
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.fileManager = new GoogleAIFileManager(apiKey);
  }

  async testConnection() {
    try {
      const url = GEMINI_CONFIG.BASE_GENERATE_TEXT_URL;
      const prompt = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: 'Please return "Connection Success"',
              },
            ],
          },
        ],
      };
      const { data } = await this.axiosInstance.post(url, prompt);
      if (data) {
        return "Connection Success";
      }
    } catch (e) {
      throw new Error(`Failed to call API: ${e.message}`);
    }
  }

  async #handleUploadGeminiFile(filePath) {
    if (!filePath) {
      throw new Error("File path is required");
    }

    const uploadResponse = await this.fileManager.uploadFile(filePath, {
      mimeType: "image/jpeg",
      displayName: "uploadImage",
    });

    return uploadResponse;
  }

  async handleGenerateContentFromImageCloud({
    filePath,
    numberRecords = 1,
    customTextCapture,
    feeling = [],
  }) {
    try {
      const uploadResponse = await this.#handleUploadGeminiFile(filePath);

      const modelType = this.geminiModal;

      const schema = {
        description: `List of photo information`,
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            location: {
              type: SchemaType.STRING,
              description:
                "Location in photo ( specifically in which city or country, if not a landscape photo then describe where it is )",
              nullable: false,
            },
            description: {
              type: SchemaType.STRING,
              description: "Short description of the photo",
              nullable: false,
            },
            capture: {
              type: SchemaType.STRING,
              description: `Capture of the photo, it should be a little long, can use icon`,
              nullable: false,
            },
          },
          required: ["location", "description", "capture"],
        },
      };

      const model = this.genAI.getGenerativeModel({
        model: modelType,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const prompt = `Give ${numberRecords} data records of the image
       Note:
        - Data must be translated into ${this.language}
        - ${customTextCapture}
        - ${feeling.length > 0 ? `Feeling: ${feeling.join(", ")}` : ""}
      `;

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        {
          text: prompt,
        },
      ]);

      return JSON.parse(result.response.text());
    } catch (e) {
      throw new Error(`Failed to call API: ${e.message}`);
    }
  }

  async fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }

  async handleGenerateContentFromImageLocal({
    imageFiles = [],
    numberRecords = 1,
  }) {
    const maxFiles = Math.min(imageFiles.length, 20);

    const imageParts = await Promise.all(
      imageFiles
        .slice(0, maxFiles)
        .map((file) => this.fileToGenerativePart(file, "image/jpeg"))
    );

    const modelType = this.geminiModal;
    const schema = handleGenderSchemaRenderImage();

    const model = this.genAI.getGenerativeModel({
      model: modelType,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `Give ${numberRecords} data records of images
    Note:
     - Data must be translated into ${this.language}
   `;

    const generatedContent = await model.generateContent([
      prompt,
      ...imageParts,
    ]);

    return JSON.parse(generatedContent.response.text());
  }

  // importantContentView :  is the part that the user wants to extract the most, prioritize searching for it
  // customLabelImportant : is the label that the user wants to use to describe the importantContentView in the image
  async readContentFromImage({
    imagePart,
    importantContentView = "",
    customLabelImportant = "",
  }) {
    const imageData = await this.fileToGenerativePart(imagePart, "image/jpeg");

    const modelType = this.geminiModal;
    const schema = handleGenderSchemaReadImage();

    const model = this.genAI.getGenerativeModel({
      model: modelType,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `Provide me with data as pairs of values that appear in the photo
    Note:
     - The data is an array that can have multiple items
     - label : Labels are data fields that you define yourself, labels must translate to ${
       this.language
     }
     - Value : Values are the data you collect from the image
     - Only print out the data present in the image, do not add anything that is not there
     - ${importantContentView}
     - ${
       importantContentView
         ? `${importantContentView}, the label of that item is ${customLabelImportant}`
         : ""
     }
   `;
    const generatedContent = await model.generateContent([prompt, imageData]);

    return JSON.parse(generatedContent.response.text());
  }

  async readManyDataFromImage({ imagePart, customField = [], note = "" }) {
    const imageData = await this.fileToGenerativePart(imagePart, "image/jpeg");

    const modelType = this.geminiModal;
    const schema = handleRenderManyDataFromImage(customField);

    const model = this.genAI.getGenerativeModel({
      model: modelType,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `
        Please analyze the image and return an array of items.
        Each item should consist of machine-recognized field names (fields that you determine) and their corresponding analyzed values. 

        Note
          - The amount of data in the data variable should be the same.
          - Only filter meaningful information.
          - ${note}
        Return the data as an array of objects, where each object contains multiple field-value pairs.
        Ensure that each object in the array contains the recognized field names and their associated values, and each field has an appropriate value analyzed from the image.
    `;
    const generatedContent = await model.generateContent([prompt, imageData]);

    return JSON.parse(generatedContent.response.text());
  }
}

module.exports = GeminiServices;
