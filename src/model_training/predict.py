import tensorflow as tf
import numpy as np
import os
from PIL import Image

# ✅ Load the trained model
model = tf.keras.models.load_model("inceptionv3_model.h5")
print("✅ Model Loaded Successfully!")

# ✅ Function to preprocess image
def preprocess_image(image_path, target_size=(150, 150)):
    img = Image.open(image_path).convert("RGB")  # Ensure 3 channels (RGB)
    img = img.resize(target_size)  # Resize to model input shape
    img_array = np.array(img) / 255.0  # Normalize (0-1)
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

# ✅ Function to predict image class
def predict_image(image_path):
    img_array = preprocess_image(image_path)
    prediction = model.predict(img_array)
    predicted_class = np.argmax(prediction)  # Get class with highest probability
    confidence = np.max(prediction)  # Get confidence score
    return predicted_class, confidence

# ✅ Predict for all images in a directory
def predict_images_from_directory(directory):
    image_files = [f for f in os.listdir(directory) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    for file in image_files:
        image_path = os.path.join(directory, file)
        predicted_class, confidence = predict_image(image_path)
        print(f"🖼️ {file} → Class {predicted_class}, Confidence: {confidence:.4f}")

# ✅ Run predictions on test images
predict_images_from_directory("frames/images")  # Change to your image directory
