const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

// Define your paths
const imagesDir = '/Users/danriding/Desktop/no-punks 0b0b0d with metadata 2';
const outputPath = path.join('/Users/danriding/Desktop', 'unique_hex_colors.json');

// Set to store unique colors
const uniqueColors = new Set();

// Function to process each image and extract unique colors
const extractUniqueColors = async (imagePath) => {
    try {
        const image = await Jimp.read(imagePath);
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            // Get the RGBA values
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // Convert to hex and store in the Set
            const hexColor = Jimp.rgbaToInt(r, g, b, 255).toString(16).slice(0, 6);
            uniqueColors.add(`#${hexColor}`);
        });

        console.log(`Processed image: ${imagePath}`);
    } catch (err) {
        console.error(`Error processing image ${imagePath}:`, err);
    }
};

// Function to process all images and list unique hex colors
const processAllImages = async () => {
    try {
        const imageFiles = fs.readdirSync(imagesDir).filter(file => file.toLowerCase().endsWith('.png')).sort();

        for (let i = 0; i < imageFiles.length; i++) {
            const imgPath = path.join(imagesDir, imageFiles[i]);
            await extractUniqueColors(imgPath);
        }

        // Save the unique colors to a JSON file
        fs.writeFileSync(outputPath, JSON.stringify([...uniqueColors], null, 2));
        console.log(`Unique colors saved to ${outputPath}`);
    } catch (err) {
        console.error('Error processing images:', err);
    }
};

// Run the process
processAllImages();