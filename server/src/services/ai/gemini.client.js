const fs = require('fs');
const path = require('path');

/**
 * Gemini Client
 * Centralizes Gemini AI communication using Node native fetch / REST API.
 * Never exposes API key to client or logs.
 */
class GeminiClient {
  constructor() {
    this.apiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.lastProvider = 'FALLBACK';
  }

  /**
   * Dynamically fetch API key from process environment
   */
  get apiKey() {
    return (process.env.GEMINI_API_KEY || '').trim();
  }

  /**
   * Dynamically fetch model from process environment
   */
  get model() {
    return (process.env.GEMINI_MODEL || 'gemini-flash-latest').trim();
  }

  /**
   * Check if Gemini API key is configured with a valid non-placeholder value
   */
  isConfigured() {
    const key = this.apiKey;
    return Boolean(
      key &&
      key.length > 10 &&
      key !== 'your_gemini_api_key' &&
      key !== 'YOUR_GEMINI_API_KEY'
    );
  }

  /**
   * Get the provider used in the most recent analysis operation ('GEMINI' or 'FALLBACK')
   */
  getLastUsedProvider() {
    return this.lastProvider;
  }

  /**
   * Convert evidence items (local path or remote URL) to Gemini inlineData parts
   * @param {Array} evidence
   * @returns {Promise<Array>} [{ mimeType, data }]
   */
  async prepareImageParts(evidence = []) {
    const imageParts = [];
    if (!Array.isArray(evidence) || evidence.length === 0) {
      return imageParts;
    }

    const imageItems = evidence.filter(e => e && (e.type === 'image' || e.mimetype?.startsWith('image/') || e.mimeType?.startsWith('image/')));

    for (const item of imageItems) {
      try {
        const mimeType = item.mimeType || item.mimetype || 'image/jpeg';

        // 1. Try direct buffer
        if (item.buffer && Buffer.isBuffer(item.buffer)) {
          imageParts.push({
            inlineData: {
              mimeType,
              data: item.buffer.toString('base64')
            }
          });
          continue;
        }

        // 2. Try local file path if available
        const localPath = item.filePath || item.path;
        if (localPath && fs.existsSync(localPath)) {
          const buffer = fs.readFileSync(localPath);
          imageParts.push({
            inlineData: {
              mimeType,
              data: buffer.toString('base64')
            }
          });
          continue;
        }

        // 3. Try fetching from remote URL (e.g. Cloudinary)
        if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
          const res = await fetch(item.url);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            imageParts.push({
              inlineData: {
                mimeType: res.headers.get('content-type') || mimeType,
                data: Buffer.from(arrayBuffer).toString('base64')
              }
            });
            continue;
          }
        }
      } catch (err) {
        // Safe logging of image preparation issue without crashing
        console.warn(`[GEMINI_IMAGE_PREP_WARNING] Could not convert evidence item to inline data: ${err.message}`);
      }
    }

    return imageParts;
  }

  /**
   * Safely extract and parse JSON from Gemini text output
   * Handles markdown code fences (```json ... ```) and surrounding commentary.
   * @param {string} rawText
   * @returns {Object}
   */
  extractJson(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('No text content returned from Gemini model.');
    }

    let cleaned = rawText.trim();

    // Strip markdown code fences if present
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    try {
      return JSON.parse(cleaned);
    } catch (parseErr) {
      // Look for the first outer JSON object {...}
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const candidate = cleaned.substring(firstBrace, lastBrace + 1);
        return JSON.parse(candidate);
      }
      throw new Error(`Failed to parse Gemini output as JSON: ${parseErr.message}`);
    }
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
      this.lastProvider = 'FALLBACK';
      if (fallbackData !== null) {
        return fallbackData;
      }
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    const modelsToTry = [
      this.model,
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-3.6-flash'
    ];
    // De-duplicate model list
    const candidateModels = [...new Set(modelsToTry)];

    const contents = [];
    const parts = [];

    // Add inline image parts if provided
    if (Array.isArray(imageParts) && imageParts.length > 0) {
      for (const img of imageParts) {
        if (img && img.inlineData) {
          parts.push(img);
        } else if (img && img.mimeType && img.data) {
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

    let lastError = null;

    // Attempt candidate models
    for (const currentModel of candidateModels) {
      const endpoint = `${this.apiBaseUrl}/${currentModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

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
          let waitMs = 1000;

          try {
            const errObj = JSON.parse(errorText);
            const retryInfo = errObj?.error?.details?.find(d => d && d['@type'] && d['@type'].includes('RetryInfo'));
            if (retryInfo?.retryDelay) {
              const sec = parseFloat(retryInfo.retryDelay.replace('s', ''));
              if (!isNaN(sec) && sec > 0 && sec <= 3) {
                waitMs = Math.ceil(sec * 1000) + 200;
              }
            }
          } catch (_) {}

          // If model is not found (404), high demand (503), or quota exceeded (429), try next candidate model
          if ([404, 429, 503].includes(response.status) && candidateModels.indexOf(currentModel) < candidateModels.length - 1) {
            console.warn(`[GEMINI_MODEL_RETRY] Model "${currentModel}" returned ${response.status}. Waiting ${waitMs}ms before trying alternative model...`);
            lastError = new Error(`Gemini API error [${response.status}]: ${errorText}`);
            await new Promise(r => setTimeout(r, waitMs));
            continue;
          }
          throw new Error(`Gemini API error [${response.status}]: ${errorText}`);
        }

        const data = await response.json();
        const textParts = data?.candidates?.[0]?.content?.parts || [];
        let rawText = '';
        for (const part of textParts) {
          if (part?.text) {
            rawText += part.text;
          }
        }

        const parsedJson = this.extractJson(rawText);
        this.lastProvider = 'GEMINI';
        return parsedJson;
      } catch (err) {
        lastError = err;
        const isRetryable = err.message.includes('[404]') || err.message.includes('[429]') || err.message.includes('[503]');
        if (!isRetryable) {
          break;
        }
      }
    }

    // If Gemini execution failed and fallbackData was provided, revert gracefully
    if (fallbackData !== null) {
      console.warn(`[GEMINI_FALLBACK_TRIGGERED] Live Gemini request failed (${lastError?.message || 'unknown error'}). Using deterministic fallback.`);
      this.lastProvider = 'FALLBACK';
      return fallbackData;
    }

    throw lastError || new Error('Gemini API generation request failed.');
  }
}

module.exports = new GeminiClient();
