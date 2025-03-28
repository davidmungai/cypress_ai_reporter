const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// ✅ Load TensorFlow.js model
async function loadModel() {
    console.log("🔄 Loading model...");
    const model = await tf.loadLayersModel('file://tfjs_model/model.json');
    console.log("✅ Model loaded successfully!");
    return model;
}

// ✅ Preprocess image (resize, normalize)
async function preprocessImage(imagePath) {
    const img = await loadImage(imagePath);
    const canvas = createCanvas(150, 150);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 150, 150);

    const imageData = ctx.getImageData(0, 0, 150, 150);
    let tensor = tf.browser.fromPixels(imageData)
        .toFloat()
        .expandDims(0);  // Add batch dimension
    tensor = tensor.div(tf.scalar(255));  // Normalize
    return tensor;
}

// ✅ Predict Class for Each Image
async function predictImages(dirPath) {
    const model = await loadModel();
    const imageFiles = fs.readdirSync(dirPath).filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    for (const file of imageFiles) {
        const imagePath = path.join(dirPath, file);
        const tensor = await preprocessImage(imagePath);
        const prediction = model.predict(tensor);
        const probabilities = await prediction.data();
        const predictedClass = probabilities.indexOf(Math.max(...probabilities));

        console.log(`🖼️ ${file} → Class ${predictedClass}, Confidence: ${Math.max(...probabilities).toFixed(4)}`);
    }
}

// ✅ Run Prediction
predictImages('./images/test');  // Change directory as needed
