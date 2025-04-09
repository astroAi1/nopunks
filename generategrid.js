const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

// Settings
const inputDir = '/Users/danriding/Desktop/no-punks 0b0b0d with metadata 2'; // Directory containing your No-Punks PNGs
const outputFile = '/Users/danriding/Desktop/nopunks_grid_8x8.png'; // Final output file

const gridCols = 8;
const gridRows = 8;
const canvasSize = 2040; // Final canvas dimensions (2040x2040)
const tileSize = 24;     // Each original image is 24x24 pixels (if that is the case) 
                         // OR adjust here if you wish to "contain" the 1200x1200 images without stretching

// In your case, since your images are 1200x1200, we'll fit them in the cell by using the "contain" method
// assuming they must be scaled down without distortion.

async function generateGridImage() {
  try {
    // Read all PNG files from the inputDir.
    const files = fs.readdirSync(inputDir).filter(file => file.toLowerCase().endsWith('.png'));

    const totalImages = gridCols * gridRows; // For an 8x8 grid = 64 images

    if (files.length < totalImages) {
      console.error(`Need at least ${totalImages} images, but found only ${files.length}.`);
      return;
    }
    
    // Shuffle the file list randomly and select 64 images.
    const selected = files.sort(() => 0.5 - Math.random()).slice(0, totalImages);

    // Calculate the dimensions of each cell:
    const cellWidth = Math.floor(canvasSize / gridCols);
    const cellHeight = Math.floor(canvasSize / gridRows);

    // Create a blank canvas with a black background.
    const grid = new Jimp(canvasSize, canvasSize, 0x000000FF);

    // Process each selected image.
    for (let i = 0; i < selected.length; i++) {
      const imgPath = path.join(inputDir, selected[i]);
      const img = await Jimp.read(imgPath);

      // Since your original images are 1200x1200, we need to scale them proportionally to fit in the cell.
      // We use 'contain' so that the image is resized to fit within cellWidth x cellHeight,
      // preserving its aspect ratio. The black background of the cell will fill any extra space.
      const cell = new Jimp(cellWidth, cellHeight, 0x000000FF);
      img.contain(cellWidth, cellHeight, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
      cell.composite(img, 0, 0);

      // Calculate the position for this cell in the grid.
      const x = (i % gridCols) * cellWidth;
      const y = Math.floor(i / gridCols) * cellHeight;
      grid.composite(cell, x, y);
    }

    // Save the final grid image.
    await grid.writeAsync(outputFile);
    console.log(`✅ Saved 8x8 No-Punks grid image at: ${outputFile}`);
  } catch (err) {
    console.error("Error generating grid image:", err);
  }
}

generateGridImage();