import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.inception_v3 import preprocess_input
import cv2  # OpenCV to check for corrupt images

class CustomImageDataGenerator(tf.keras.utils.Sequence):
    def __init__(self, directory, batch_size=32, target_size=(150, 150), shuffle=True):
        self.directory = directory
        self.batch_size = batch_size
        self.target_size = target_size  # ✅ Ensure this matches model input
        self.shuffle = shuffle
        self.image_paths, self.labels = self._load_image_paths()
        self.indexes = np.arange(len(self.image_paths))
        if self.shuffle:
            np.random.shuffle(self.indexes)

    def _load_image_paths(self):
        """Loads valid image file paths and labels."""
        image_paths = []
        labels = []
        class_names = sorted(os.listdir(self.directory))  # Get class names

        for label, class_name in enumerate(class_names):
            class_dir = os.path.join(self.directory, class_name)

            # ✅ Ensure it's a valid directory
            if not os.path.isdir(class_dir):
                print(f"⚠️ Skipping non-directory: {class_dir}")
                continue

            for fname in os.listdir(class_dir):
                file_path = os.path.join(class_dir, fname)

                # ✅ Skip non-image files
                if not file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                    print(f"⚠️ Skipping non-image file: {file_path}")
                    continue

                # ✅ Check if the image is corrupted (OpenCV)
                if cv2.imread(file_path) is None:
                    print(f"❌ Corrupted image skipped: {file_path}")
                    continue

                image_paths.append(file_path)
                labels.append(label)

        print(f"✅ Loaded {len(image_paths)} valid images from {self.directory}")
        return image_paths, np.array(labels, dtype=np.int32)

    def __len__(self):
        """Number of batches per epoch."""
        return int(np.floor(len(self.image_paths) / self.batch_size))

    def __getitem__(self, index):
        """Generate one batch of data."""
        batch_indexes = self.indexes[index * self.batch_size:(index + 1) * self.batch_size]
        batch_paths = [self.image_paths[i] for i in batch_indexes]
        batch_labels = self.labels[batch_indexes]

        images = []
        valid_labels = []

        for p, label in zip(batch_paths, batch_labels):
            try:
                # ✅ Load, Resize, Convert to Array & Preprocess
                img = load_img(p, target_size=self.target_size)
                img = img_to_array(img, dtype="float32")  # Ensure correct dtype
                img = preprocess_input(img)  # Normalize for InceptionV3

                images.append(img)
                valid_labels.append(label)
            except Exception as e:
                print(f"❌ Error loading image {p}: {e}")

        # ✅ Ensure batch isn't empty
        if not images:
            raise ValueError("❌ No valid images found in this batch!")

        return np.array(images, dtype="float32"), np.array(valid_labels, dtype="int32")

    def on_epoch_end(self):
        """Shuffle dataset after each epoch."""
        if self.shuffle:
            np.random.shuffle(self.indexes)
