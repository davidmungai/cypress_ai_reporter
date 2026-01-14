import sys
import os
import glob
import subprocess
import cv2
import numpy as np
import json
import shutil

def process_videos(setup_dir):
    try:
        video_files = glob.glob(os.path.join(setup_dir, "*.mp4"))
        results = []
        
        for video_path in video_files:
            filename = os.path.basename(video_path)
            base_name = os.path.splitext(filename)[0]
            output_dir = os.path.join(setup_dir, "chunks_" + base_name)
            
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir)
            os.makedirs(output_dir)
            
            # FFmpeg chunking (5 second chunks)
            chunk_pattern = os.path.join(output_dir, "chunk_%03d.mp4")
            subprocess.run([
                "ffmpeg", "-i", video_path, "-c", "copy", "-map", "0", 
                "-segment_time", "5", "-f", "segment", chunk_pattern,
                "-loglevel", "error"
            ], check=True)
            
            chunk_files = sorted(glob.glob(os.path.join(output_dir, "*.mp4")))
            
            for i, chunk_path in enumerate(chunk_files):
                # Process with OpenCV
                cap = cv2.VideoCapture(chunk_path)
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                
                # Try to get middle frame
                if frame_count > 1:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count // 2)
                
                ret, frame = cap.read()
                cap.release()

                if ret:
                     # Calculate histogram for each channel
                    hist_b = cv2.calcHist([frame], [0], None, [256], [0, 256])
                    hist_g = cv2.calcHist([frame], [1], None, [256], [0, 256])
                    hist_r = cv2.calcHist([frame], [2], None, [256], [0, 256])
                    
                    hist = np.concatenate([hist_b, hist_g, hist_r]).flatten()
                    norm = np.linalg.norm(hist)
                    if norm > 0:
                        hist = hist / norm
                    embedding = hist.tolist()
                    
                    results.append({
                        "videoName": filename,
                        "chunkIndex": i,
                        "chunkPath": chunk_path,
                        "testTitle": f"Video Chunk {i} of {filename}",
                        "status": "passed", 
                        "timestamp": "2026-01-01T00:00:00Z",
                        "image_embedding": embedding
                    })
            
        print(json.dumps(results))
    except Exception as e:
        sys.stderr.write(str(e))
        print("[]") # Return empty array on error to prevent plugin crash

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_videos.py <setup_dir>")
        sys.exit(1)
    process_videos(sys.argv[1])
