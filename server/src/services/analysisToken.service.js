const jwt = require('jsonwebtoken');

class AnalysisTokenService {
  constructor() {
    this.secret = process.env.ANALYSIS_TOKEN_SECRET || 'fallback_secret_for_tests';
    this.expiresIn = '15m'; // Short expiration for security
  }

  /**
   * Generate a signed analysis token
   * @param {string} citizenId 
   * @param {Object} input - original complaint input
   * @param {Object} analysis - validated AI output
   * @returns {string} Signed JWT token
   */
  generateToken(citizenId, input, analysis) {
    if (!citizenId || !input || !analysis) {
      throw new Error('Missing required payload fields for analysis token');
    }

    const payload = {
      sub: citizenId,
      type: 'civic-complaint-analysis',
      input: input,
      analysis: analysis
    };

    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  /**
   * Verify and decode the analysis token
   * @param {string} token 
   * @param {string} citizenId - The ID of the citizen verifying the token
   * @returns {Object} decoded payload
   */
  verifyToken(token, citizenId) {
    if (!token) {
      throw new Error('Token is missing');
    }

    try {
      const decoded = jwt.verify(token, this.secret);

      if (decoded.type !== 'civic-complaint-analysis') {
        throw new Error('Invalid token type');
      }

      if (decoded.sub !== citizenId) {
        throw new Error('Token does not belong to the current user');
      }

      if (!decoded.input || !decoded.analysis) {
        throw new Error('Malformed token payload');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Analysis token expired. Please analyze again.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid analysis token signature');
      }
      throw error;
    }
  }
}

module.exports = new AnalysisTokenService();
