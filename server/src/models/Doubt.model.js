import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  inputMode: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
  imageUrl: { type: String }, // Base64 format if image
  timestamp: { type: Date, default: Date.now }
});

const DoubtChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Doubt' },
  subject: { type: String, default: 'General' },
  messages: [MessageSchema],
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to generate title from first user message if it's new
DoubtChatSchema.pre('save', function (next) {
  this.lastActivity = new Date();
  if (this.isNew && this.messages.length > 0 && this.title === 'New Doubt') {
    const firstMsg = this.messages.find(m => m.role === 'user');
    if (firstMsg && firstMsg.content) {
      this.title = firstMsg.content.substring(0, 30) + (firstMsg.content.length > 30 ? '...' : '');
    }
  }
  next();
});

export default mongoose.model('DoubtChat', DoubtChatSchema);
