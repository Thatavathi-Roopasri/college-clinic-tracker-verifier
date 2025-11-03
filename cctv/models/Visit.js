import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    id: { type: String, required: true, index: true },
    symptoms: { type: String, default: '' },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, default: null },
    loggedBy: { type: String, default: 'Unknown' }
  },
  { timestamps: true }
);

VisitSchema.index({ id: 1, entryTime: -1 });

const Visit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);
export default Visit;
