import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    date: { type: String, index: true }, // yyyy-mm-dd
    section: { type: String, index: true },
    records: { type: Object }, // map of roll -> status ('present'|'absent'|'sick')
    by: { type: String }
  },
  { timestamps: true }
);

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
