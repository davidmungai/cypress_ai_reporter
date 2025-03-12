const VideoProcessor = require('./utils/VideoProcessor');

const videoDir = './videos';   // Path to videos
const outputDir = './frames';  // Path to save extracted frames

const processor = new VideoProcessor(videoDir, outputDir);

// Clean up (optional)
// processor.cleanup();

// Extract frames (Automatically performs clean up)
// frameRate - How many snapshots to generate in 1s
// number - The total number of snapshots to generate
processor.extractFrames({ frameRate: 1, number: 41 });
