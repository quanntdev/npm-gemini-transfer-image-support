
const axios = require('axios');

function createAxiosInstance(apiKey) {
    if (!apiKey) {
        throw new Error('API key is required to create axios instance!');
    }
    return axios.create({
        headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
        }
    });
}

module.exports = createAxiosInstance;