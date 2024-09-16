const axios = require("axios");
const createAxiosInstance = require("../config/gemini");
const { GEMINI_CONFIG } = require("../constants/gemini");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { transferTextToJson } = require("../helper/text-transfer");

class GeminiServices {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("API key is required");
    }

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

    return uploadResponse
  }

  async handleGenerateContentFromImage(filePath) {
    try {
      const uploadResponse = await this.#handleUploadGeminiFile(filePath)
      const modelType = GEMINI_CONFIG.BASIC_MODEL_TYPE

      const model = this.genAI.getGenerativeModel({
        model: modelType,
      });

      const prompt = `Tell me where in the photo
      and write a short capture for the photo above and return me 1 in json format, which has
      location, description about the photo, a capture to upload to Social Media`

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

      return transferTextToJson(result.response.text())
    } catch(e) {
      throw new Error(`Failed to call API: ${e.message}`);
    }
  }
}

module.exports = GeminiServices;
