from PIL import Image
import os

# Input folder: your original 1200x1200 images
input_folder = '/Users/danriding/Desktop/no-punks 0b0b0d with metadata'
# Output folder: will contain resized 24x24 images
resized_folder = '/Users/danriding/Desktop/nopunks2'

if not os.path.exists(resized_folder):
    os.makedirs(resized_folder)

# Process all images in the input folder
for filename in os.listdir(input_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        image_path = os.path.join(input_folder, filename)
        img = Image.open(image_path)
        # Resize to 24x24 using NEAREST neighbor to preserve the pixel art look
        img_small = img.resize((24, 24), Image.NEAREST)
        output_path = os.path.join(resized_folder, filename)
        img_small.save(output_path)

print("Resizing complete for all images.")