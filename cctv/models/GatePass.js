import mongoose from 'mongoose';

const GatePassSchema = new mongoose.Schema(
  {
    studentEmail: { type: String, index: true },
    studentName: { type: String },
    studentRoll: { type: String, index: true },
    studentYear: { type: String },
    department: { type: String },
    reason: { type: String },
    timeOut: { type: String },
    status: { type: String, default: 'pending_approval', index: true },
    userId: { type: String },
    hodSectionId: { type: String },
    hodUserId: { type: String },
    approvedAt: { type: Date },
    declinedAt: { type: Date },
    declineReason: { type: String },
    downloadedAt: { type: Date }
  },
  { timestamps: true }
);

const GatePass = mongoose.models.GatePass || mongoose.model('GatePass', GatePassSchema);
export default GatePass;
