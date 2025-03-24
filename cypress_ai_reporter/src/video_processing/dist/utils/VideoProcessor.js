const FileUtils = require('./fileUtils');
const ffmpeg = require('ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegStatic;

const path = require('path');
const fs = require('fs');

class VideoProcessor {
    /**
     * Initializes the VideoProcessor with input and output directories.
     * @param {string} videoDir - Directory containing video files.
     * @param {string} outputDir - Directory where frames will be saved.
     */
    constructor(videoDir, outputDir) {
        this.videoDir = videoDir;
        this.outputDir = outputDir;
    }

    /*********************************************************
     * Removes the existing output directory before processing.
     ************************************************************/
    cleanOutputDirectory() {
        if (fs.existsSync(this.outputDir)) {
            console.log(`Cleaning up output directory: ${this.outputDir}`);
            fs.rmSync(this.outputDir, { recursive: true, force: true });
        }
        fs.mkdirSync(this.outputDir, { recursive: true });
    }

    /**
     * Extract frames from all videos in the specified directory.
     * @param {Object} options - Options for frame extraction.
     * @param {number} options.frameRate - Frames per second to extract.
     * @param {number} options.number - Maximum number of frames per video.
     * @returns {Promise<void>}
     */
    async extractFrames({ frameRate = 1, number = 5 } = {}) {
        try {
            /********************************************
            * Clean output directory before processing
            *******************************************/
            this.cleanOutputDirectory();

            /************************
            * Get all video files
            ***********************/
            const videoFiles = await FileUtils.getPathToVideos(this.videoDir);
            console.log(`Found ${videoFiles.length} video(s) to process.`);

            for (const videoPath of videoFiles) {
                await this.processVideo(videoPath, frameRate, number);
            }
        } catch (err) {
            console.error('Error extracting frames:', err);
        }
    }

    /**
     * Processes a single video to extract frames.
     * @param {string} videoPath - Path to the video file.
     * @param {number} frameRate - Frames per second to extract.
     * @param {number} number - Maximum number of frames per video.
     * @returns {Promise<void>}
     */
    async processVideo(videoPath, frameRate, number) {
        try {
            console.log(`Processing: ${videoPath}`);
            const process = new ffmpeg(videoPath);

            return process.then(video => {
                const videoName = path.basename(videoPath, path.extname(videoPath));
                const savePath = path.join(this.outputDir, videoName);

                /*********************************** 
                 Ensure output subdirectory exists
                **********************************/
                if (!fs.existsSync(savePath)) {
                    fs.mkdirSync(savePath, { recursive: true });
                }

                return new Promise((resolve, reject) => {
                    video.fnExtractFrameToJPG(savePath, {
                        frame_rate: frameRate,
                        number: number,
                        file_name: `${videoName}_%t_%s`
                    }, (error, files) => {
                        if (error) {
                            console.error(`Error processing ${videoPath}:`, error);
                            reject(error);
                        } else {
                            console.log(`Frames saved for ${videoName}:`, files);
                            resolve(files);
                        }
                    });
                });
            }).catch(err => {
                console.error(`Error loading video ${videoPath}:`, err);
            });

        } catch (err) {
            console.error(`Failed to process ${videoPath}:`, err);
        }
    }

    /********************************************************
     * Manually delete the output directory and its contents.
     ********************************************************/
    cleanup() {
        console.log(`Cleaning up: ${this.outputDir}`);
        if (fs.existsSync(this.outputDir)) {
            fs.rmSync(this.outputDir, { recursive: true, force: true });
            console.log(`Output directory ${this.outputDir} deleted.`);
        } else {
            console.log(`Output directory ${this.outputDir} does not exist.`);
        }
    }
}

module.exports = VideoProcessor;


/*******************************************************************************
✅ Auto-clean before processing – Deletes old output before starting a new run.
✅ Manual cleanup method – Call cleanup() to remove processed files.
✅ Safer directory handling – Avoids cluttering with old frames.
**********************************************************************/