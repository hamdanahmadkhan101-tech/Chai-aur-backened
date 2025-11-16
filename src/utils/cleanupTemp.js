import fs from "fs";
import path from "path";

const cleanupTempFiles = () => {
  const tempDir = "./public/temp";
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  try {
    const files = fs.readdirSync(tempDir);
    
    files.forEach(file => {
      if (file === '.gitkeep') return; // Skip .gitkeep
      
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = Date.now() - stats.mtime.getTime();
      
      if (fileAge > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    });
  } catch (error) {
    console.error("Error during temp file cleanup:", error);
  }
};

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// Run cleanup on startup
cleanupTempFiles();

export default cleanupTempFiles;