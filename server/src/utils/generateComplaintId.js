/**
 * Generates a human-readable unique complaint ID
 * Format: CIV-YYYYMMDD-XXXX (e.g., CIV-20260920-0001)
 */
const generateComplaintId = async (ComplaintModel) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const prefix = `CIV-${dateStr}-`;
  
  // Find the highest sequence number for today
  const lastComplaint = await ComplaintModel.findOne(
    { complaintId: { $regex: `^${prefix}` } },
    { complaintId: 1 }
  ).sort({ complaintId: -1 });

  let sequenceNumber = 1;
  if (lastComplaint && lastComplaint.complaintId) {
    const lastSequence = parseInt(lastComplaint.complaintId.split('-')[2], 10);
    if (!isNaN(lastSequence)) {
      sequenceNumber = lastSequence + 1;
    }
  }

  const sequenceStr = String(sequenceNumber).padStart(4, '0');
  return `${prefix}${sequenceStr}`;
};

module.exports = generateComplaintId;
