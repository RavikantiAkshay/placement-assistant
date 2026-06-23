import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  content: { type: String, required: true },
  inputMode: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
  imageUrl: { type: String },
  audioUrl: { type: String }
});

const doubtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  messages: [messageSchema],
  status: { type: String, enum: ['open', 'resolved'], default: 'open' }
}, { timestamps: true });

export default mongoose.model('Doubt', doubtSchema);
