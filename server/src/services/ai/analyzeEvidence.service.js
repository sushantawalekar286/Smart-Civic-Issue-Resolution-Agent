const geminiClient = require('./gemini.client');

/**
 * Generate fallback evidence analysis grounded solely on provided data
 * @param {string} description
 * @param {Array} evidence
 * @returns {{ summary: string, findings: string[] }}
 */
function analyzeEvidenceFallback(description = '', evidence = []) {
  const images = (evidence || []).filter(e => e && e.type === 'image');
  const hasImage = images.length > 0;

  if (!hasImage) {
    return {
      summary: 'Analysis conducted solely on citizen text description. No photographic evidence was attached to the complaint.',
      findings: [
        `Citizen reported: "${description.trim().substring(0, 150)}${description.trim().length > 150 ? '...' : ''}"`,
        'No visual media provided to inspect physical dimensions or structural depth.'
      ]
    };
  }

  const firstImg = images[0];
  const fileName = firstImg.fileName || 'uploaded image';

  return {
    summary: `Analysis based on citizen description and attached photographic evidence (${fileName}).`,
    findings: [
      `Citizen reported: "${description.trim().substring(0, 150)}${description.trim().length > 150 ? '...' : ''}"`,
      `Photographic evidence provided (${fileName}) confirms visual documentation submitted by citizen.`
    ]
  };
}

/**
 * Analyze evidence grounded in description and images
 * @param {Object} params
 * @param {string} params.description
 * @param {Array} [params.evidence]
 * @returns {Promise<{ summary: string, findings: string[] }>}
 */
async function analyzeEvidence({ description, evidence = [] }) {
  const fallback = analyzeEvidenceFallback(description, evidence);
  const images = (evidence || []).filter(e => e && e.type === 'image');
  const hasImage = images.length > 0;

  const systemInstruction = `You are a municipal civic issue evidence analysis agent.
Analyze the complaint description and any attached evidence.

CRITICAL GROUNDING RULES:
1. Findings MUST be strictly grounded in the supplied text and evidence.
2. If NO image is provided, you MUST explicitly state that only text evidence was analyzed. DO NOT invent or fabricate image contents.
3. If an image is referenced, describe only verifiable aspects without making wild unsupported claims.
4. Output JSON schema:
{
  "summary": "...",
  "findings": [
    "...",
    "..."
  ]
}`;

  const prompt = `Complaint Description: "${description}"
Attached Evidence: ${hasImage ? `${images.length} image(s) provided: ${images.map(img => img.fileName || img.url).join(', ')}` : 'None. No image attached.'}`;

  const imageParts = await geminiClient.prepareImageParts(evidence);

  const result = await geminiClient.generateStructuredJson({
    prompt,
    systemInstruction,
    imageParts,
    fallbackData: fallback
  });

  const summary = (result?.summary && typeof result.summary === 'string')
    ? result.summary.trim()
    : fallback.summary;

  let findings = Array.isArray(result?.findings)
    ? result.findings.filter(f => typeof f === 'string' && f.trim().length > 0).map(f => f.trim())
    : fallback.findings;

  if (findings.length === 0) {
    findings = fallback.findings;
  }

  // Ensure non-fabrication rule if no image is present
  if (!hasImage) {
    // If the model hallucinated image details despite instructions, enforce the fallback
    const hallucinatedImage = findings.some(f => /shows a photo|in the image|image depicts|photo displays/i.test(f));
    if (hallucinatedImage) {
      return fallback;
    }
  }

  return {
    summary,
    findings
  };
}

module.exports = {
  analyzeEvidence,
  analyzeEvidenceFallback
};
