const fs = require('fs');
const path = require('path');

class FileUtils {
    /**
     * Recursively lists all file paths in the specified directory.
     * @param {string} dir - The directory to search.
     * @returns {Promise<string[]>} - A promise resolving to an array of file paths.
     */
    static getPathToVideos(dir) {
        return new Promise((resolve, reject) => {
            let fileList = [];

            fs.readdir(dir, (err, files) => {
                if (err) {
                    return reject(`Failed to read directory: ${err}`);
                }

                let pending = files.length;
                if (!pending) return resolve(fileList);

                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    fs.stat(filePath, (err, stats) => {
                        if (err) {
                            console.error(`Failed to read file stats: ${err}`);
                            if (!--pending) resolve(fileList);
                            return;
                        }

                        if (stats.isFile()) {
                            fileList.push(filePath);
                        } else if (stats.isDirectory()) {
                            FileUtils.getPathToVideos(filePath)
                                .then(subFiles => {
                                    fileList = fileList.concat(subFiles);
                                    if (!--pending) resolve(fileList);
                                })
                                .catch(reject);
                        } else {
                            console.warn(`Skipping unknown file type: ${filePath}`);
                        }

                        if (!--pending) resolve(fileList);
                    });
                });
            });
        });
    }
}

module.exports = FileUtils;
