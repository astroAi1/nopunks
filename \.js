const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const QRCode = require('qrcode');

// Define paths
const sourceDir = '/Users/danriding/Desktop/no-punks 0b0b0d with metadata 2';
const outputDir = path.join('/Users/danriding/Desktop', `premium_glossy_trading_cards_${Date.now()}`);

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Output directory created at: ${outputDir}`);
}

// URL for No-Punks Collection on OpenSea
const noPunksCollectionUrl = 'https://opensea.io/collection/nopunkism';

// Function to generate a QR code for the collection link
const generateQRCode = async (nftUrl) => {
    try {
        const qrCanvas = createCanvas(100, 100);
        await QRCode.toCanvas(qrCanvas, nftUrl, { width: 80 });
        return qrCanvas;
    } catch (err) {
        console.error('Error generating QR code:', err);
        return null;
    }
};

// Function to create a premium collectible trading card
const createPremiumCard = async (imgPath, metadata, outputPath) => {
    try {
        const cardWidth = 720;
        const cardHeight = 1024;
        const canvas = createCanvas(cardWidth, cardHeight);
        const ctx = canvas.getContext('2d');

        // Brushed metal gradient background
        const brushedGradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        brushedGradient.addColorStop(0, '#1c1c1c');
        brushedGradient.addColorStop(1, '#333333');
        ctx.fillStyle = brushedGradient;
        ctx.fillRect(0, 0, cardWidth, cardHeight);

        // Neon Border with Gloss Effect
        const neonColor = '#4682b4';  // Cryptopunks blue with neon effect
        ctx.strokeStyle = neonColor;
        ctx.shadowColor = neonColor;
        ctx.shadowBlur = 20;
        ctx.lineWidth = 12;
        ctx.strokeRect(30, 30, cardWidth - 60, cardHeight - 60);
        ctx.shadowBlur = 0;

        // Load and draw the No-Punk image in the center
        const image = await loadImage(imgPath);
        ctx.drawImage(image, 150, 140, cardWidth - 300, 480);

        // Glossy Overlay Effect
        ctx.globalAlpha = 0.15;
        const glossGradient = ctx.createLinearGradient(0, 0, cardWidth, 0);
        glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        glossGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
        ctx.fillStyle = glossGradient;
        ctx.fillRect(30, 30, cardWidth - 60, cardHeight - 60);
        ctx.globalAlpha = 1.0;

        // Add Info Box at the Bottom for Trait Count, Traits, and QR Code
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(40, 760, cardWidth - 80, 230);  // Information Box

        // Title in the Info Box
        ctx.font = 'bold 42px Arial';
        ctx.fillStyle = neonColor;
        ctx.textAlign = 'center';
        const title = metadata.name || `No-Punk #${path.basename(imgPath, '.png')}`;
        ctx.fillText(title, cardWidth / 2, 810);

        // Trait Count
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#d3d3d3';
        const validTraits = metadata.attributes.filter(attr => attr.trait_type !== 'Type');
        const traitCount = validTraits.length;
        ctx.fillText(`Trait Count: ${traitCount}`, cardWidth / 2, 860);

        // Trait Details
        ctx.font = '28px Arial';
        ctx.textAlign = 'left';
        let yPosition = 900;
        validTraits.forEach((attr, index) => {
            const xPosition = index % 2 === 0 ? 60 : cardWidth / 2;
            ctx.fillText(`${attr.trait_type}: ${attr.value}`, xPosition, yPosition);
            if (index % 2 === 1) {
                yPosition += 36;
            }
        });

        // Generate the QR code for the No-Punks collection link
        const qrCanvas = await generateQRCode(noPunksCollectionUrl);
        if (qrCanvas) {
            ctx.drawImage(qrCanvas, cardWidth - 140, 880, 80, 80); // QR Code in bottom-right of the box
        } else {
            console.error('Failed to generate QR code for No-Punks collection');
        }

        // Save the card as PNG
        const buffer = canvas.toBuffer('image/png');
        console.log(`Saving card to: ${outputPath}`);
        fs.writeFileSync(outputPath, buffer);
        console.log(`Premium card saved at: ${outputPath}`);
    } catch (err) {
        console.error(`Error creating premium card: ${err}`);
    }
};

// Function to process images and create trading cards
const processImages = async () => {
    try {
        const imageFiles = fs.readdirSync(sourceDir).filter(file => /\.(png|jpg|jpeg)$/i.test(file)).sort();
        const totalCards = imageFiles.length;

        if (totalCards === 0) {
            console.log("No image files found in the directory.");
            return;
        }

        const shuffledImages = imageFiles.sort(() => 0.5 - Math.random());
        const selectedImages = shuffledImages.slice(0, 5);  // Pick first 5 images

        for (let i = 0; i < selectedImages.length; i++) {
            const imgPath = path.join(sourceDir, selectedImages[i]);
            const outputPath = path.join(outputDir, `premium_card_${i + 1}.png`);

            console.log(`Processing image: ${selectedImages[i]}`);

            const metadata = readMetadata(imgPath);
            if (metadata) {
                await createPremiumCard(imgPath, metadata, outputPath);
            } else {
                console.log(`No metadata found for ${selectedImages[i]}, skipping.`);
            }
        }

        console.log("All premium cards created successfully.");
    } catch (err) {
        console.error('Error processing images:', err);
    }
};

// Function to read the JSON metadata file associated with an image
const readMetadata = (imgPath) => {
    const jsonPath = imgPath.replace('.png', '.json');
    if (fs.existsSync(jsonPath)) {
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        return JSON.parse(jsonData);
    }
    return null;
};

// Run the process
processImages();