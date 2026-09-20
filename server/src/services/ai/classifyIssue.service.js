const geminiClient = require('./gemini.client');

const ALLOWED_ISSUE_TYPES = [
  'Pothole',
  'Road Damage',
  'Garbage',
  'Damaged Streetlight',
  'Water Leakage',
  'Drainage',
  'Public Infrastructure Damage',
  'Other'
];

/**
 * Deterministic fallback issue classifier for offline/test environments
 * @param {string} description
 * @returns {{ issueType: string, confidence: number, reason: string }}
 */
function classifyFallback(description = '') {
  const text = (description || '').toLowerCase();

  // Water Leakage check
  if (/\b(leak|leakage|pipe burst|water line|pipeline burst|drinking water|water supply|burst pipe|gushing water)\b/.test(text)) {
    return {
      issueType: 'Water Leakage',
      confidence: 0.91,
      reason: 'Citizen description reports visible water pipe leakage or water supply disruption.'
    };
  }

  // Drainage check
  if (/\b(drain|drainage|sewage|sewer|clogged drain|gutter overflow|manhole)\b/.test(text)) {
    return {
      issueType: 'Drainage',
      confidence: 0.90,
      reason: 'Citizen description reports blocked or overflowing municipal drainage/sewage.'
    };
  }

  // Damaged Streetlight check
  if (/\b(streetlight|street light|streetlamp|lamp post|pole light|light bulb)\b/.test(text)) {
    return {
      issueType: 'Damaged Streetlight',
      confidence: 0.93,
      reason: 'Citizen description indicates a broken, non-functional, or damaged streetlight.'
    };
  }

  // Garbage check
  if (/\b(garbage|trash|waste|debris|litter|dump|rubbish|dumpster)\b/.test(text)) {
    return {
      issueType: 'Garbage',
      confidence: 0.94,
      reason: 'Citizen description reports accumulated garbage or uncollected waste.'
    };
  }

  // Pothole check
  if (/\bpothole(s)?\b/.test(text)) {
    return {
      issueType: 'Pothole',
      confidence: 0.92,
      reason: 'Citizen description explicitly mentions pothole on the roadway.'
    };
  }

  // Road Damage check
  if (/\b(road|asphalt|pavement|crack(s)?|cave-in)\b/.test(text)) {
    return {
      issueType: 'Road Damage',
      confidence: 0.88,
      reason: 'Citizen description indicates structural damage or cracks on the road surface.'
    };
  }
  if (/\b(bridge|bench|bus stop|footpath|sidewalk|divider|railing|park equipment)\b/.test(text)) {
    return {
      issueType: 'Public Infrastructure Damage',
      confidence: 0.85,
      reason: 'Citizen description refers to damage to public municipal infrastructure.'
    };
  }

  return {
    issueType: 'Other',
    confidence: 0.50,
    reason: 'Citizen description does not cleanly match primary civic categories; classified as Other.'
  };
}

/**
 * Classify civic issue using Gemini AI with fallback
 * @param {Object} params
 * @param {string} params.description - Citizen description
 * @param {Array} [params.evidence] - Evidence array
 * @returns {Promise<{ issueType: string, confidence: number, reason: string }>}
 */
async function classifyIssue({ description, evidence = [] }) {
  const fallback = classifyFallback(description);

  const systemInstruction = `You are a municipal civic issue classification agent.
Analyze the citizen complaint description and classify it into EXACTLY ONE of the following issue categories:
- Pothole
- Road Damage
- Garbage
- Damaged Streetlight
- Water Leakage
- Drainage
- Public Infrastructure Damage
- Other

Rules:
1. "confidence" must be a floating point number strictly between 0.0 and 1.0.
2. "reason" must be concise and strictly grounded in the citizen's words. Do NOT invent unsupported facts.
3. If ambiguous or unclear, classify as "Other" with appropriate confidence.
4. Output JSON schema:
{
  "issueType": "Pothole",
  "confidence": 0.94,
  "reason": "..."
}`;

  const prompt = `Classify this complaint:
Description: "${description}"
Evidence items: ${evidence.length} provided.`;

  const result = await geminiClient.generateStructuredJson({
    prompt,
    systemInstruction,
    fallbackData: fallback
  });

  // Normalize issueType and confidence
  let issueType = ALLOWED_ISSUE_TYPES.includes(result?.issueType) ? result.issueType : fallback.issueType;
  let confidence = typeof result?.confidence === 'number' ? Math.max(0, Math.min(1, result.confidence)) : fallback.confidence;
  let reason = (result?.reason && typeof result.reason === 'string') ? result.reason.trim() : fallback.reason;

  return {
    issueType,
    confidence: Number(confidence.toFixed(2)),
    reason
  };
}

module.exports = {
  classifyIssue,
  classifyFallback,
  ALLOWED_ISSUE_TYPES
};
