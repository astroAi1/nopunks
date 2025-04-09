import os
import random
from PIL import Image, ImageDraw, ImageFont
import imageio
import numpy as np

def create_grid(images, grid_size=(4, 5), image_size=(300, 200), text="No-Punks", 
               font_path='/Users/danriding/Desktop/no-punks 0b0b0d with metadata 2/Jersey10-Regular.ttf', 
               text_color='#58A6FF',  # Cryptopunks Blue (example hex)
               text_area_height=40):
    """
    Create a grid image with text below each image.
    
    Parameters:
    - images: List of PIL Image objects.
    - grid_size: Tuple indicating (columns, rows).
    - image_size: Tuple indicating size (width, height) for each image.
    - text: Text to display below each image.
    - font_path: Path to the .ttf font file.
    - text_color: Hex color code for the text.
    - text_area_height: Height allocated for the text below each image.
    
    Returns:
    - A PIL Image object representing the grid.
    """
    cols, rows = grid_size
    img_width, img_height = image_size
    grid_width = cols * img_width
    grid_height = rows * (img_height + text_area_height)
    
    # Create a new canvas
    grid_image = Image.new('RGBA', (grid_width, grid_height), (255, 255, 255, 255))
    
    # Load the font
    try:
        font_size = 20  # Adjust as needed
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        print(f"Font file not found at {font_path}. Please check the path.")
        return None
    
    draw = ImageDraw.Draw(grid_image)
    
    for idx, img in enumerate(images):
        # Resize image
        img_resized = img.resize(image_size, Image.ANTIALIAS)
        
        # Calculate position
        col = idx % cols
        row = idx // cols
        x = col * img_width
        y = row * (img_height + text_area_height)
        
        # Paste the image
        grid_image.paste(img_resized, (x, y))
        
        # Add text below the image
        text_width, text_height = draw.textsize(text, font=font)
        text_x = x + (img_width - text_width) / 2
        text_y = y + img_height + (text_area_height - text_height) / 2
        
        draw.text((text_x, text_y), text, font=font, fill=text_color)
    
    return grid_image

def add_fade_out(frames, fade_duration=10):
    """
    Adds fade-out frames to the end of the GIF.
    
    Parameters:
    - frames: List of PIL Image objects.
    - fade_duration: Number of frames for the fade-out.
    
    Returns:
    - Updated list of frames with fade-out added.
    """
    if not frames:
        return frames
    
    last_frame = frames[-1].convert('RGBA')
    for i in range(1, fade_duration + 1):
        alpha = 1 - (i / (fade_duration + 1))
        faded = last_frame.copy()
        overlay = Image.new('RGBA', faded.size, (0, 0, 0, int(255 * alpha)))
        faded = Image.alpha_composite(faded, overlay)
        frames.append(faded.convert('P', palette=Image.ADAPTIVE))
    
    return frames

def main():
    # Define directories and paths
    image_dir = '/Users/danriding/Desktop/no-punks 0b0b0d with metadata 2'
    font_path = '/Users/danriding/Desktop/no-punks 0b0b0d with metadata 2/Jersey10-Regular.ttf'
    desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
    output_gif_path = os.path.join(desktop_path, "NoPunks_GIF.gif")
    
    # Supported image extensions
    supported_extensions = ('.png', '.jpg', '.jpeg', '.bmp', '.gif')
    
    # List all image files
    all_files = os.listdir(image_dir)
    image_files = [file for file in all_files if file.lower().endswith(supported_extensions)]
    
    # Check if there are at least 100 images
    if len(image_files) < 100:
        print(f"Not enough images to create a GIF. Found only {len(image_files)} images.")
        # Optionally, you can repeat images to make up 100
        if len(image_files) == 0:
            print("No images found. Exiting.")
            return
        needed = 100 - len(image_files)
        image_files = image_files + random.choices(image_files, k=needed)
    
    # Shuffle the images for randomness
    random.shuffle(image_files)
    
    # Select the first 100 images
    selected_images = image_files[:100]
    
    # Load images as PIL Image objects
    loaded_images = []
    for img_name in selected_images:
        img_path = os.path.join(image_dir, img_name)
        try:
            img = Image.open(img_path).convert('RGBA')
            loaded_images.append(img)
        except Exception as e:
            print(f"Error loading image {img_name}: {e}")
    
    if not loaded_images:
        print("No images loaded successfully. Exiting.")
        return
    
    # Define grid parameters
    grid_columns = 4
    grid_rows = 5
    images_per_grid = grid_columns * grid_rows  # 20
    total_grids = 5  # To make 100 images total
    
    # Define image and text parameters
    image_size = (300, 200)  # Width, Height
    text = "No-Punks"
    text_color = "#58A6FF"  # Example Cryptopunks Blue (adjust as needed)
    fade_out_frames = 20  # Number of frames for fade-out
    
    # Create grid images
    grid_frames = []
    for grid_num in range(total_grids):
        start_idx = grid_num * images_per_grid
        end_idx = start_idx + images_per_grid
        grid_images = loaded_images[start_idx:end_idx]
        
        grid_image = create_grid(
            grid_images,
            grid_size=(grid_columns, grid_rows),
            image_size=image_size,
            text=text,
            font_path=font_path,
            text_color=text_color,
            text_area_height=40  # Adjust as needed
        )
        
        if grid_image:
            grid_frames.append(grid_image.convert('P', palette=Image.ADAPTIVE))
    
    if not grid_frames:
        print("No grid frames created successfully. Exiting.")
        return
    
    # Add fade-out frames
    grid_frames = add_fade_out(grid_frames, fade_duration=fade_out_frames)
    
    # Save frames as GIF using imageio
    try:
        # Convert PIL Images to NumPy arrays
        frames_np = [np.array(frame.convert('RGB')) for frame in grid_frames]
        
        # Create GIF
        imageio.mimsave(output_gif_path, frames_np, format='GIF', duration=0.5)
        print(f"GIF successfully saved to {output_gif_path}")
    except Exception as e:
        print(f"Failed to save GIF: {e}")

if __name__ == "__main__":
    main()