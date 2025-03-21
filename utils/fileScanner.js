const fs = require('fs');
const path = require('path');

// Directory to scan for videos
const VIDEO_DIRECTORY = '/home/streams/processed';

/**
 * Recursively scan a directory for MP4 files
 * @param {string} dir - Directory to scan
 * @param {string} baseDir - Base directory for relative paths
 * @returns {Array} - Array of video file objects
 */
function scanDirectory(dir = VIDEO_DIRECTORY, baseDir = VIDEO_DIRECTORY) {
  let results = [];
  
  try {
    // Check if directory exists
    if (!fs.existsSync(dir)) {
      console.error(`Directory not found: ${dir}`);
      return results;
    }
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        results = results.concat(scanDirectory(filePath, baseDir));
      } else if (path.extname(file).toLowerCase() === '.mp4') {
        // Get relative path from base directory
        const relativePath = path.relative(baseDir, filePath);
        
        // Add video file to results
        results.push({
          name: file,
          path: relativePath
        });
      }
    }
  } catch (error) {
    console.error('Error scanning directory:', error);
  }
  
  return results;
}

/**
 * Get a list of all available videos
 * @returns {Array} - Array of video file objects
 */
function getVideos() {
  return scanDirectory();
}

/**
 * Get the full path of a video file
 * @param {string} filename - Relative path of the video file
 * @returns {string|null} - Full path of the video file or null if not found
 */
function getVideoPath(filename) {
  const fullPath = path.join(VIDEO_DIRECTORY, filename);
  
  try {
    // Check if file exists
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
  } catch (error) {
    console.error('Error getting video path:', error);
  }
  
  return null;
}

module.exports = {
  getVideos,
  getVideoPath,
  VIDEO_DIRECTORY
};
