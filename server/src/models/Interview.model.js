import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['ai', 'candidate'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  timeSpentSeconds: { type: Number },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: { type: String, required: true },
    difficulty: { type: String, default: 'Medium' },
    persona: { type: String, default: 'standard' },
    resumeText: { type: String, default: '' },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    questions: { type: [String], default: [] },
    currentQuestion: { type: Number, default: 1 },
    totalQuestions: { type: Number, required: true },
    messages: [messageSchema],
    feedback: { type: mongoose.Schema.Types.Mixed },
    overallScore: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);
