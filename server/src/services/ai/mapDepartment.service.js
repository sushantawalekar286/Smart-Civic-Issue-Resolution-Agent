const Department = require('../../models/Department');

// Prototype department configurations
const PROTOTYPE_DEPARTMENTS = {
  ROAD: {
    code: 'ROAD',
    name: 'Road / Public Works Department',
    issueTypes: ['Pothole', 'Road Damage']
  },
  SANITATION: {
    code: 'SANITATION',
    name: 'Sanitation & Solid Waste Management',
    issueTypes: ['Garbage']
  },
  ELECTRICAL: {
    code: 'ELECTRICAL',
    name: 'Electrical & Street Lighting Department',
    issueTypes: ['Damaged Streetlight']
  },
  WATER: {
    code: 'WATER',
    name: 'Water Supply & Maintenance Department',
    issueTypes: ['Water Leakage']
  },
  DRAINAGE: {
    code: 'DRAINAGE',
    name: 'Drainage & Sewerage Department',
    issueTypes: ['Drainage']
  },
  INFRASTRUCTURE: {
    code: 'INFRASTRUCTURE',
    name: 'Public Infrastructure & Engineering Department',
    issueTypes: ['Public Infrastructure Damage', 'Other']
  }
};

// Prototype Issue-to-Department Code Mapping
const ISSUE_TO_DEPT_CODE = {
  'Pothole': 'ROAD',
  'Road Damage': 'ROAD',
  'Garbage': 'SANITATION',
  'Damaged Streetlight': 'ELECTRICAL',
  'Water Leakage': 'WATER',
  'Drainage': 'DRAINAGE',
  'Public Infrastructure Damage': 'INFRASTRUCTURE',
  'Other': 'INFRASTRUCTURE'
};

/**
 * Maps an issue to a verified department record
 * Resolves against MongoDB Department collection if available, falling back to prototype catalog.
 * Arbitrary department names from AI are strictly prevented.
 *
 * @param {Object} params
 * @param {string} params.issueType
 * @param {string} [params.description]
 * @returns {Promise<{ code: string, name: string, reason: string, departmentId?: string }>}
 */
async function mapDepartment({ issueType, description = '' }) {
  const targetCode = ISSUE_TO_DEPT_CODE[issueType] || 'INFRASTRUCTURE';
  const prototypeDept = PROTOTYPE_DEPARTMENTS[targetCode] || PROTOTYPE_DEPARTMENTS.INFRASTRUCTURE;

  let dbDept = null;
  try {
    // Attempt resolving against database if connected
    if (Department && Department.db && Department.db.readyState === 1) {
      dbDept = await Department.findOne({ code: targetCode, isActive: true }).lean();
      if (!dbDept) {
        // Fallback search by issueType in issueTypes array
        dbDept = await Department.findOne({ issueTypes: issueType, isActive: true }).lean();
      }
    }
  } catch (err) {
    // Gracefully handle unseeded or test database states
    dbDept = null;
  }

  const code = dbDept ? dbDept.code : prototypeDept.code;
  const name = dbDept ? dbDept.name : prototypeDept.name;
  const departmentId = dbDept ? dbDept._id.toString() : undefined;

  const reason = `Issue type "${issueType}" is mapped to the ${name} (${code}) based on municipal jurisdiction responsibilities.`;

  return {
    code,
    name,
    reason,
    ...(departmentId && { departmentId })
  };
}

module.exports = {
  mapDepartment,
  PROTOTYPE_DEPARTMENTS,
  ISSUE_TO_DEPT_CODE
};
