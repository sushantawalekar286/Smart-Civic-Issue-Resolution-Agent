const geminiClient = require('./gemini.client');

const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * Deterministic fallback severity assessment
 * @param {string} description
 * @param {string} issueType
 * @returns {{ severity: string, reason: string }}
 */
function assessSeverityFallback(description = '', issueType = 'Other') {
  const text = (description || '').toLowerCase();

  // Check for critical indicators: immediate danger, live wire, open manhole, flooding
  if (/\b(danger|fatal|hazard|emergency|injury|shock|exposed wire|spark|deep crater|severe flood|collapse)\b/.test(text)) {
    return {
      severity: 'CRITICAL',
      reason: 'Complaint description indicates immediate safety risks, hazards, or severe disruption.'
    };
  }

  // Check for high severity indicators: major road block, large pothole, pipe burst, darkness on main road
  if (/\b(urgent|large pothole|heavy|burst|overflow|blocking|accident|major|deep)\b/.test(text)) {
    return {
      severity: 'HIGH',
      reason: 'Complaint indicates significant physical impact, active leakage, or elevated risk of accident.'
    };
  }

  // Check for medium severity
  if (/\b(broken|dark|smell|stray|moderate|inconvenience|garbage pile|leak)\b/.test(text)) {
    return {
      severity: 'MEDIUM',
      reason: 'Complaint involves ongoing civic disruption requiring municipal maintenance within standard turnaround.'
    };
  }

  // Check low severity default
  return {
    severity: 'LOW',
    reason: 'Issue is classified as low impact or routine civic maintenance based on provided description.'
  };
}

/**
 * Assess complaint severity using Gemini AI or fallback
 * @param {Object} params
 * @param {string} params.description
 * @param {string} params.issueType
 * @param {Array} [params.evidence]
 * @returns {Promise<{ severity: string, reason: string }>}
 */
async function assessSeverity({ description, issueType = 'Other', evidence = [] }) {
  const fallback = assessSeverityFallback(description, issueType);

  const systemInstruction = `You are a municipal civic issue severity assessment agent.
Assess the urgency and safety impact of the reported civic issue into EXACTLY ONE of the following prototype severity levels:
- LOW: Minor aesthetic or non-disruptive issue (e.g. small litter, minor fading).
- MEDIUM: Standard civic issue causing moderate inconvenience without immediate hazard.
- HIGH: Significant issue creating safety risks, traffic obstruction, or active property degradation.
- CRITICAL: Immediate life/safety hazard, structural collapse, high-voltage live wire, or severe hazard.

NOTE: These are prototype evaluation thresholds for civic triage, not official government standards.
Reasoning must be strictly grounded in the citizen's complaint and evidence.

Output JSON schema:
{
  "severity": "HIGH",
  "reason": "..."
}`;

  const prompt = `Issue Type: "${issueType}"
Complaint Description: "${description}"
Evidence: ${evidence.length > 0 ? `${evidence.length} evidence item(s)` : 'No image'}`;

  const result = await geminiClient.generateStructuredJson({
    prompt,
    systemInstruction,
    fallbackData: fallback
  });

  const upperSeverity = typeof result?.severity === 'string' ? result.severity.trim().toUpperCase() : fallback.severity;
  const severity = SEVERITY_LEVELS.includes(upperSeverity) ? upperSeverity : fallback.severity;
  const reason = (result?.reason && typeof result.reason === 'string') ? result.reason.trim() : fallback.reason;

  return {
    severity,
    reason
  };
}

module.exports = {
  assessSeverity,
  assessSeverityFallback,
  SEVERITY_LEVELS
};
