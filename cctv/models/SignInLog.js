import mongoose from 'mongoose';

const SignInLogSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    roleTried: { type: String },
    success: { type: Boolean, required: true },
    ip: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

const SignInLog = mongoose.models.SignInLog || mongoose.model('SignInLog', SignInLogSchema);
export default SignInLog;
