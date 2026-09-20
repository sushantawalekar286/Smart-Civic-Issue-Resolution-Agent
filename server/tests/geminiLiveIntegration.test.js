const geminiClient = require('../src/services/ai/gemini.client');
const agentOrchestrator = require('../src/services/ai/agentOrchestrator.service');
const fs = require('fs');
const path = require('path');

describe('Gemini AI Analysis & Multimodal Pipeline', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  describe('1. JSON Extraction & Normalization', () => {
    it('should parse raw clean JSON', () => {
      const input = '{"status":"ok","confidence":0.95}';
      const parsed = geminiClient.extractJson(input);
      expect(parsed).toEqual({ status: 'ok', confidence: 0.95 });
    });

    it('should strip markdown json fences', () => {
      const input = '```json\n{"issueType":"Pothole","confidence":0.92}\n```';
      const parsed = geminiClient.extractJson(input);
      expect(parsed).toEqual({ issueType: 'Pothole', confidence: 0.92 });
    });

    it('should extract JSON embedded in surrounding explanatory text', () => {
      const input = 'Here is the analysis:\n{"severity":"HIGH","reason":"Deep road hazard."}\nThank you.';
      const parsed = geminiClient.extractJson(input);
      expect(parsed).toEqual({ severity: 'HIGH', reason: 'Deep road hazard.' });
    });
  });

  describe('2. Multimodal Evidence Preparation', () => {
    it('should return empty array when no evidence is provided', async () => {
      const parts = await geminiClient.prepareImageParts([]);
      expect(parts).toEqual([]);
    });

    it('should prepare inlineData from a local file path', async () => {
      const tempPath = path.join(__dirname, 'temp_test_image.jpg');
      fs.writeFileSync(tempPath, Buffer.from('fake-image-bytes-jpeg'));

      try {
        const parts = await geminiClient.prepareImageParts([{
          type: 'image',
          filePath: tempPath,
          mimeType: 'image/jpeg'
        }]);

        expect(parts.length).toBe(1);
        expect(parts[0].inlineData).toBeDefined();
        expect(parts[0].inlineData.mimeType).toBe('image/jpeg');
        expect(parts[0].inlineData.data).toBe(Buffer.from('fake-image-bytes-jpeg').toString('base64'));
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    });

    it('should prepare inlineData from a direct Buffer', async () => {
      const buffer = Buffer.from('png-pixel-data');
      const parts = await geminiClient.prepareImageParts([{
        type: 'image',
        buffer,
        mimeType: 'image/png'
      }]);

      expect(parts.length).toBe(1);
      expect(parts[0].inlineData).toBeDefined();
      expect(parts[0].inlineData.mimeType).toBe('image/png');
      expect(parts[0].inlineData.data).toBe(buffer.toString('base64'));
    });
  });

  describe('3. Fallback and Key Management', () => {
    it('should recognize placeholder key as unconfigured and use fallback', async () => {
      process.env.GEMINI_API_KEY = 'your_gemini_api_key';
      expect(geminiClient.isConfigured()).toBe(false);

      const fallbackData = { status: 'fallback_active' };
      const res = await geminiClient.generateStructuredJson({
        prompt: 'Test',
        fallbackData
      });

      expect(res).toEqual(fallbackData);
      expect(geminiClient.getLastUsedProvider()).toBe('FALLBACK');
    });

    it('should safely fall back when an invalid API key encounters an API error', async () => {
      process.env.GEMINI_API_KEY = 'AIzaSyDummyInvalidKeyForFallbackVerification123456';
      expect(geminiClient.isConfigured()).toBe(true);

      const fallbackData = { issueType: 'Pothole', confidence: 0.9 };
      const res = await geminiClient.generateStructuredJson({
        prompt: 'Classify complaint',
        fallbackData
      });

      expect(res).toEqual(fallbackData);
      expect(geminiClient.getLastUsedProvider()).toBe('FALLBACK');
    });
  });

  describe('4. End-to-End Orchestrator Pipeline', () => {
    it('should analyze text-only complaint without failure', async () => {
      const result = await agentOrchestrator.analyzeComplaint({
        description: 'There is a large pothole near the main market entrance causing traffic jams.',
        location: { latitude: 16.705, longitude: 74.243, address: 'Market Road' }
      });

      expect(result.issueType).toBe('Pothole');
      expect(result.severity.level).toBeDefined();
      expect(result.department.code).toBe('ROAD');
      expect(result.generatedComplaint).toContain('Market Road');
    });

    it('should analyze complaint with image evidence without failure', async () => {
      const tempPath = path.join(__dirname, 'temp_orchestrator_img.png');
      fs.writeFileSync(tempPath, Buffer.from('mock-png-evidence'));

      try {
        const result = await agentOrchestrator.analyzeComplaint({
          description: 'Garbage dumping on sidewalk causing bad smell.',
          location: { latitude: 16.705, longitude: 74.243, address: 'Station Road' },
          evidence: [{
            type: 'image',
            filePath: tempPath,
            mimeType: 'image/png',
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
          }]
        });

        expect(result.issueType).toBe('Garbage');
        expect(result.department.code).toBe('SANITATION');
        expect(result.evidenceAnalysis.findings.length).toBeGreaterThan(0);
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    });
  });
});
