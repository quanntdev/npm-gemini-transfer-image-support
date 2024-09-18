const axios = require("axios");
const createAxiosInstance = require("../config/gemini");
const { GEMINI_CONFIG, LANGUAGE } = require("../constants/gemini");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const { handleGenderSchemaRenderImage } = require("../prompt/gemini");

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

  async handleGenerateContentFromImageLocal({imageFiles = [],  numberRecords = 1,}) {
    const maxFiles = Math.min(imageFiles.length, 20);

    const imageParts = await Promise.all(
      imageFiles
        .slice(0, maxFiles)
        .map((file) => this.fileToGenerativePart(file, "image/jpeg"))
    );

    const modelType = this.geminiModal;
    const schema = handleGenderSchemaRenderImage()

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
}

module.exports = GeminiServices;
