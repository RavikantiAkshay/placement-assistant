import fs from 'fs';
import os from 'os';
import path from 'path';

// Clean up orphaned audio temp files older than 1 hour
export const startTempCleanupCron = () => {
  const ONE_HOUR_MS = 60 * 60 * 1000;
  
  setInterval(() => {
    try {
      const tempUploadDir = path.join(os.tmpdir(), 'placement-assistant-uploads');
      
      if (!fs.existsSync(tempUploadDir)) return;
      
      const files = fs.readdirSync(tempUploadDir);
      const now = Date.now();
      let cleanedCount = 0;
      
      files.forEach(file => {
        const filePath = path.join(tempUploadDir, file);
        const stats = fs.statSync(filePath);
        
        // If file is older than 1 hour, delete it
        if (now - stats.mtimeMs > ONE_HOUR_MS) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`[Cleanup] Removed ${cleanedCount} orphaned temp files.`);
      }
      
    } catch (error) {
      console.error('[Cleanup Error] Failed to clean temp files:', error);
    }
  }, ONE_HOUR_MS); // Run every hour
};
