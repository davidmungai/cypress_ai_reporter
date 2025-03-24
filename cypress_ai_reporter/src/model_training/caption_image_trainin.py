import tensorflow as tf
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Input, Dense, Embedding, LSTM, Add, Lambda, Reshape, TimeDistributed, RepeatVector, Concatenate
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
import numpy as np
import os
from PIL import Image
import matplotlib.pyplot as plt
import pickle # Import pickle

# Load a pre-trained CNN (e.g., InceptionV3) for feature extraction
def build_feature_extractor():
    base_model = tf.keras.applications.InceptionV3(include_top=False, weights='imagenet')
    output = base_model.output
    output = tf.keras.layers.GlobalAveragePooling2D()(output)
    return Model(inputs=base_model.input, outputs=output)

# Define the RNN decoder
def build_captioning_model(vocab_size, embedding_dim, rnn_units, max_length):
    # Image feature input
    image_input = Input(shape=(2048,))
    image_embedding = Dense(embedding_dim, activation='relu')(image_input)
    image_embedding_expanded = RepeatVector(max_length)(image_embedding)  # Repeat for max_length

    # Text input
    text_input = Input(shape=(max_length,))
    text_embedding = Embedding(vocab_size, embedding_dim)(text_input)

    # Concatenate image embedding with text embeddings along the time axis
    combined = Concatenate(axis=1)([image_embedding_expanded, text_embedding])

    # Decoder LSTM
    decoder = LSTM(rnn_units, return_sequences=True)(combined)
    output = TimeDistributed(Dense(vocab_size, activation='softmax'))(decoder)

    # Define the model
    model = Model(inputs=[image_input, text_input], outputs=output)
    model.compile(loss='categorical_crossentropy', optimizer='adam')

    return model

# Tokenizer setup
def create_tokenizer(captions):
    tokenizer = Tokenizer(oov_token="<unk>")
    tokenizer.fit_on_texts(captions)
    tokenizer.word_index['<start>'] = len(tokenizer.word_index) + 1
    tokenizer.word_index['<end>'] = len(tokenizer.word_index) + 1
    return tokenizer

# Custom image and caption loader (reads from 'training' directory)
def load_images_and_captions(directory):
    images, captions = [], []
    feature_extractor = build_feature_extractor()

    for file in os.listdir(directory):
        if file.endswith('.png') or file.endswith('.jpg'):
            img_path = os.path.join(directory, file)
            try:
                img = Image.open(img_path).convert('RGB').resize((299, 299))
                img_array = np.array(img) / 255.0
                img_array = np.expand_dims(img_array, axis=0)
                img_features = feature_extractor.predict(img_array)
                images.append(img_features.flatten())

                caption_file = file.rsplit('.', 1)[0] + '.txt'
                caption_path = os.path.join(directory, caption_file)
                with open(caption_path, 'r') as f:
                    captions.append(f.read().strip())
            except Exception as e:
                print(f"Error loading {file}: {e}")

    return images, captions

# Load data and prepare model
train_images, train_captions = load_images_and_captions('training')

# Tokenize captions
tokenizer = create_tokenizer(train_captions)
vocab_size = len(tokenizer.word_index) + 1
train_sequences = tokenizer.texts_to_sequences(train_captions)
max_length = max(len(seq) for seq in train_sequences) + 2 #add 2 for start and end token.
train_padded_seqs = pad_sequences(train_sequences, padding='post', maxlen=max_length)

# Build model
embedding_dim = 256
rnn_units = 512
captioning_model = build_captioning_model(vocab_size, embedding_dim, rnn_units, max_length)

# Prepare target data
train_targets = np.zeros((len(train_padded_seqs), max_length, vocab_size))
for i, seq in enumerate(train_padded_seqs):
    for j, word_idx in enumerate(seq):
        if j > 0:
            train_targets[i, j - 1, word_idx] = 1

#adjust the target shape
train_targets_adjusted = np.zeros((train_targets.shape[0], max_length*2, vocab_size))
train_targets_adjusted[:,max_length:,:] = train_targets

# Split data into train/val
split_idx = int(0.8 * len(train_images))
train_data = (np.array(train_images[:split_idx]), np.array(train_padded_seqs[:split_idx]))
val_data = (np.array(train_images[split_idx:]), np.array(train_padded_seqs[split_idx:]))
train_targets_train = train_targets_adjusted[:split_idx]
train_targets_val = train_targets_adjusted[split_idx:]

# Train the model with training progress visualization
history = captioning_model.fit(
    [train_data[0], train_data[1]],
    train_targets_train,
    validation_data=([val_data[0], val_data[1]], train_targets_val),
    epochs=10,
    batch_size=64,
    callbacks=[ModelCheckpoint('image_caption.h5', save_best_only=True), EarlyStopping(patience=3)]
)

# Save the final model
captioning_model.save('image_caption.h5')
print("Model saved as image_caption.h5")

#save the tokenizer.
with open('tokenizer.pickle', 'wb') as handle:
    pickle.dump(tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)
print("Tokenizer saved as tokenizer.pickle")

# Inference function for generating captions
def generate_caption(image_path, model, tokenizer, max_length=20):
    feature_extractor = build_feature_extractor()
    img = Image.open(image_path).convert('RGB').resize((299, 299))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    img_features = feature_extractor.predict(img_array).flatten().reshape(1, -1)

    caption = ['<start>']
    for _ in range(max_length):
        sequence = tokenizer.texts_to_sequences([caption])[0]
        padded_sequence = pad_sequences([sequence], maxlen=max_length * 2, padding='post')
        y_pred = model.predict([img_features, padded_sequence], verbose=0)
        predicted_word = np.argmax(y_pred[0, -1, :])
        word = tokenizer.index_word.get(predicted_word, '<end>')
        caption.append(word)
        if word == '<end>':
            break

    return ' '.join(caption[1:-1])

# Plot training history
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()
plt.title('Training and Validation Loss Over Epochs')
plt.show()