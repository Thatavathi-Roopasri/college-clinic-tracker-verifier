import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['clinic', 'faculty', 'student', 'hod'], required: true },
    name: { type: String, default: '' }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
