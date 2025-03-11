import tensorflow as tf
from tensorflow.keras.layers import Embedding, LSTM, Dense, Add
from tensorflow.keras.models import Model
from tensorflow.keras.applications import InceptionV3
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import Tokenizer
import numpy as np

class ImageCaptionModel:
    def __init__(self, vocab_size, max_length):
        self.vocab_size = vocab_size
        self.max_length = max_length
        self.tokenizer = Tokenizer(num_words=vocab_size, oov_token="<OOV>")
        self.image_model = self.build_image_model()
        self.caption_model = self.build_caption_model()
        self.model = self.build_model()

    def build_image_model(self):
        base_model = InceptionV3(weights='imagenet')
        base_model = Model(base_model.input, base_model.layers[-2].output)
        return base_model

    def build_caption_model(self):
        inputs = tf.keras.Input(shape=(self.max_length,))
        x = Embedding(self.vocab_size, 256, mask_zero=True)(inputs)
        x = LSTM(256, return_sequences=True)(x)
        x = LSTM(256)(x)
        return Model(inputs, x)

    def build_model(self):
        image_inputs = tf.keras.Input(shape=(2048,))
        image_features = Dense(256, activation='relu')(image_inputs)

        caption_inputs = tf.keras.Input(shape=(self.max_length,))
        caption_features = self.caption_model(caption_inputs)

        combined = Add()([image_features, caption_features])
        outputs = Dense(self.vocab_size, activation='softmax')(combined)

        model = Model(inputs=[image_inputs, caption_inputs], outputs=outputs)
        model.compile(loss='categorical_crossentropy', optimizer='adam')
        return model

    def preprocess_image(self, image_path):
        img = tf.keras.preprocessing.image.load_img(image_path, target_size=(299, 299))
        img = tf.keras.preprocessing.image.img_to_array(img)
        img = np.expand_dims(img, axis=0)
        img = tf.keras.applications.inception_v3.preprocess_input(img)
        return img

    def generate_caption(self, image_path, max_length):
        image = self.preprocess_image(image_path)
        image_features = self.image_model.predict(image)

        caption = '<start>'
        for i in range(max_length):
            sequence = self.tokenizer.texts_to_sequences([caption])[0]
            sequence = pad_sequences([sequence], maxlen=max_length)
            yhat = self.model.predict([image_features, sequence], verbose=0)
            yhat = np.argmax(yhat)
            word = self.tokenizer.index_word[yhat]
            caption += ' ' + word
            if word == '<end>':
                break
        return caption

# Example usage:
vocab_size = 5000
max_length = 34
model = ImageCaptionModel(vocab_size, max_length)
caption = model.generate_caption('path_to_image.jpg', max_length)
print(caption)

