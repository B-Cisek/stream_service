// DOM elements
const videoPlayer = document.getElementById('videoPlayer');
const videoTitle = document.getElementById('videoTitle');
const videoList = document.getElementById('videoList');

// API endpoints
const API_URL = '/api';
const VIDEOS_ENDPOINT = `${API_URL}/videos`;

// Current video state
let currentVideo = null;

/**
 * Fetch the list of available videos from the API
 */
async function fetchVideos() {
  try {
    const response = await fetch(VIDEOS_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const videos = await response.json();
    displayVideos(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    videoList.innerHTML = `
      <div class="error">
        Failed to load videos. Please try again later.
      </div>
    `;
  }
}

/**
 * Display the list of videos in the UI
 * @param {Array} videos - Array of video objects
 */
function displayVideos(videos) {
  if (videos.length === 0) {
    videoList.innerHTML = '<p>No videos found.</p>';
    return;
  }
  
  // Clear the loading message
  videoList.innerHTML = '';
  
  // Create a video item for each video
  videos.forEach(video => {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.textContent = video.name;
    videoItem.dataset.path = video.path;
    
    // Add click event to play the video
    videoItem.addEventListener('click', () => {
      playVideo(video);
      
      // Mark this video as active
      document.querySelectorAll('.video-item').forEach(item => {
        item.classList.remove('active');
      });
      videoItem.classList.add('active');
    });
    
    videoList.appendChild(videoItem);
  });
}

/**
 * Play the selected video
 * @param {Object} video - Video object
 */
function playVideo(video) {
  currentVideo = video;
  
  // Update the video source
  const videoSource = `${VIDEOS_ENDPOINT}/${encodeURIComponent(video.path)}`;
  videoPlayer.innerHTML = `<source src="${videoSource}" type="video/mp4">`;
  
  // Update the video title
  videoTitle.textContent = video.name;
  
  // Load and play the video
  videoPlayer.load();
  videoPlayer.play().catch(error => {
    console.error('Error playing video:', error);
  });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  fetchVideos();
  
  // Add event listener for video errors
  videoPlayer.addEventListener('error', () => {
    console.error('Video playback error');
    videoTitle.textContent = 'Error playing video';
  });
});
