import app from './app.js';
import mongoose from 'mongoose';
import { startTempCleanupCron } from './utils/cleanup.util.js';

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || !process.env.GROQ_API_KEY) {
  console.error('FATAL ERROR: JWT_SECRET or GROQ_API_KEY is not defined.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      startTempCleanupCron();
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
