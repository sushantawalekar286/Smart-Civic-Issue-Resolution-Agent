const geminiClient = require('./gemini.client');

/**
 * Format severity in Title Case (e.g. "High", "Medium", "Low", "Critical")
 * @param {string} severity
 * @returns {string}
 */
function formatSeverity(severity = '') {
  if (!severity) return 'Medium';
  const lower = severity.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Deterministic fallback for structured complaint text
 * @param {Object} params
 * @returns {string}
 */
function generateComplaintFallback({ issueType, severity, location = {}, description = '' }) {
  const cleanAddress = location.address && location.address.trim().length > 0
    ? location.address.trim()
    : (typeof location.latitude === 'number' && typeof location.longitude === 'number')
      ? `GPS (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
      : 'Location coordinates provided without street address';

  return `Issue:
${issueType || 'Civic Issue'}

Location:
${cleanAddress}

Severity:
${formatSeverity(severity)}

Description:
${description.trim()}`;
}

/**
 * Generate a clear structured complaint description using only provided details
 * @param {Object} params
 * @param {string} params.issueType
 * @param {string} params.severity
 * @param {Object} params.location
 * @param {string} params.description
 * @param {Object} [params.department]
 * @returns {Promise<string>}
 */
async function generateComplaint({ issueType, severity, location = {}, description = '', department = {} }) {
  const fallback = generateComplaintFallback({ issueType, severity, location, description });

  const systemInstruction = `You are a municipal complaint structuring agent.
Generate a structured, professional civic complaint based strictly on the provided facts.

CRITICAL NON-FABRICATION RULES:
1. DO NOT invent locations, addresses, evidence, departments, damage, or claims that were not provided.
2. If location has no street address, use the provided GPS coordinates or state "GPS coordinates provided".
3. Use the following exact format:
Issue:
<Issue Type>

Location:
<Location>

Severity:
<Severity>

Description:
<Grounded summary of citizen report>

Output JSON schema:
{
  "complaint": "..."
}`;

  const prompt = `Issue Type: ${issueType}
Severity: ${severity}
Location Info: ${JSON.stringify(location)}
Citizen Report: "${description}"
Assigned Department: ${department.name || department.code || ''}`;

  const result = await geminiClient.generateStructuredJson({
    prompt,
    systemInstruction,
    fallbackData: { complaint: fallback }
  });

  const generated = result?.complaint && typeof result.complaint === 'string'
    ? result.complaint.trim()
    : fallback;

  // Verify structure exists or revert to deterministic fallback
  if (!generated.includes('Issue:') || !generated.includes('Description:')) {
    return fallback;
  }

  return generated;
}

module.exports = {
  generateComplaint,
  generateComplaintFallback
};
