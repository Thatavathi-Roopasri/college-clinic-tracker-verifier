import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true }, rolls: { type: [String], default: [] } },
  { timestamps: true }
);

const Section = mongoose.models.Section || mongoose.model('Section', SectionSchema);
export default Section;
