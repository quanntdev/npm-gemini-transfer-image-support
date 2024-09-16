const GEMINI_CONFIG = {
    BASE_GENERATE_TEXT_URL:  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    FLASH_MODEL_TYPE: "gemini-1.5-flash",
    PRO_MODEL_TYPE: "gemini-1.5-pro"
}

const LANGUAGE = {
    VN : "Vietnamese",
    EN : "English"
}

module.exports = {
    GEMINI_CONFIG,
    LANGUAGE
};