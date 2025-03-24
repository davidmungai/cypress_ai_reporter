import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
from PIL import Image
import pickle

# Load a pre-trained CNN for feature extraction
def build_feature_extractor():
    base_model = tf.keras.applications.InceptionV3(include_top=False, weights='imagenet')
    output = base_model.output
    output = tf.keras.layers.GlobalAveragePooling2D()(output)
    return tf.keras.models.Model(inputs=base_model.input, outputs=output)

# Inference function for generating captions
def generate_caption(image_path, model, tokenizer, max_length=26):  # Updated max_length to match model
    feature_extractor = build_feature_extractor()
    img = Image.open(image_path).convert('RGB').resize((299, 299))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    img_features = feature_extractor.predict(img_array).flatten().reshape(1, -1)

    caption = ['<start>']
    for _ in range(max_length):
        sequence = tokenizer.texts_to_sequences([caption])[0]
        padded_sequence = pad_sequences([sequence], maxlen=max_length, padding='post')
        y_pred = model.predict([img_features, padded_sequence], verbose=0)
        predicted_word = np.argmax(y_pred[0, -1, :])
        word = tokenizer.index_word.get(predicted_word, '<end>')
        caption.append(word)
        if word == '<end>':
            break

    return ' '.join(caption[1:-1])

# Load model and tokenizer for prediction
model = load_model('image_caption.h5')
with open('tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)

# Example prediction
image_path = 'training/10.png'  # Replace with your image path
caption = generate_caption(image_path, model, tokenizer)
print(f"Generated Caption: {caption}")