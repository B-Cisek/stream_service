const express = require('express');
const fs = require('fs');
const path = require('path');
const { getVideos, getVideoPath } = require('../utils/fileScanner');

const router = express.Router();

/**
 * GET /api/videos
 * Returns a list of all available videos
 */
router.get('/videos', (req, res) => {
  try {
    const videos = getVideos();
    res.json(videos);
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

/**
 * GET /api/videos/:filename
 * Streams the requested video
 */
router.get('/videos/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Get the full path of the video file
    const videoPath = getVideoPath(filename);
    
    if (!videoPath) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Get video file stats (size, etc.)
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      // Handle range request (partial content)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      // Set headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      });
      
      // Stream the video chunk
      file.pipe(res);
    } else {
      // Stream the entire video
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      });
      
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ error: 'Failed to stream video' });
  }
});

module.exports = router;
