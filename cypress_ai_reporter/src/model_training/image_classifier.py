import tensorflowjs as tfjs

import tensorflow as tf
from tensorflow.keras.applications import InceptionV3
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Input
from tensorflow.keras.optimizers import Adam
from load_image import CustomImageDataGenerator  # ✅ Ensure correct import

# ✅ Define Input Shape (Match InceptionV3 input)
input_tensor = Input(shape=(150, 150, 3))

# ✅ Load Pretrained InceptionV3 Model (Without Top Layers)
base_model = InceptionV3(weights='imagenet', include_top=False, input_tensor=input_tensor)

# ✅ Add New Fully Connected Layers
x = base_model.output
x = GlobalAveragePooling2D()(x)  # Global pooling
x = Dense(512, activation='relu')(x)  # Fully connected layer
x = Dense(256, activation='relu')(x)  # Another dense layer
output_layer = Dense(2, activation='softmax')(x)  # Adjust output for number of classes

# ✅ Define the Final Model
model = Model(inputs=base_model.input, outputs=output_layer)

# ✅ Freeze Base Model Layers (For Transfer Learning)
for layer in base_model.layers:
    layer.trainable = False

# ✅ Compile the Model
model.compile(optimizer=Adam(learning_rate=0.0001), loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# ✅ Print Model Summary
model.summary()

# ✅ Load Training & Validation Data Using Custom Generator
train_gen = CustomImageDataGenerator('images', batch_size=32)
val_gen = CustomImageDataGenerator('images', batch_size=32, shuffle=False)  # Validation shuffle off

# ✅ Train the Model
model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=10,  # Adjust based on dataset
    steps_per_epoch=len(train_gen),
    validation_steps=len(val_gen),
    verbose=1
)

# ✅ Fine-Tune by Unfreezing Some Layers
for layer in base_model.layers[-50:]:  # Unfreeze last 50 layers
    layer.trainable = True

# ✅ Recompile with Lower Learning Rate for Fine-Tuning
model.compile(optimizer=Adam(learning_rate=1e-5), loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# ✅ Continue Training (Fine-Tuning)
model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=5,  # Adjust as needed
    steps_per_epoch=len(train_gen),
    validation_steps=len(val_gen),
    verbose=1
)

# ✅ Save the Trained Model
model.save("inceptionv3_model.h5")
