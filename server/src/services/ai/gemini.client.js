const https = require('https');

/**
 * Gemini Client
 * Centralizes Gemini AI communication using Node native fetch / REST API.
 * Never exposes API key to client or logs.
 */
class GeminiClient {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.apiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  /**
   * Check if Gemini API key is configured
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && this.apiKey !== 'your_gemini_api_key');
  }

  /**
   * Generate structured JSON output from Gemini
   * @param {Object} options
   * @param {string} options.prompt - Prompt content
   * @param {string} [options.systemInstruction] - System prompt guidance
   * @param {Array} [options.imageParts] - Optional inline base64 image data [{ mimeType, data }]
   * @param {Object} [options.fallbackData] - Optional fallback response if API key is not configured or offline
   * @returns {Promise<Object>} Parsed JSON response
   */
  async generateStructuredJson({ prompt, systemInstruction = '', imageParts = [], fallbackData = null }) {
    if (!this.isConfigured()) {
      if (fallbackData !== null) {
        return fallbackData;
      }
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    const endpoint = `${this.apiBaseUrl}/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const contents = [];
    const parts = [];

    // Add image parts if provided
    if (Array.isArray(imageParts) && imageParts.length > 0) {
      for (const img of imageParts) {
        if (img && img.mimeType && img.data) {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data
            }
          });
        }
      }
    }

    // Add prompt text
    parts.push({ text: prompt });
    contents.push({ role: 'user', parts });

    const requestBody = {
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error [${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('No content returned from Gemini model.');
      }

      return JSON.parse(rawText.trim());
    } catch (err) {
      if (fallbackData !== null) {
        return fallbackData;
      }
      throw err;
    }
  }
}

module.exports = new GeminiClient();
