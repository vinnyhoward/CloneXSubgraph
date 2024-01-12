const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

async function fetchImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return response.buffer();
}

async function processImage(imageId) {
  const imageUrl = `https://clonex-assets.rtfkt.com/images/${imageId}.png`;
  const outputPath = path.join("assets/base64", `${imageId}.txt`);

  try {
    const imageBuffer = await fetchImage(imageUrl);

    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(10, 10)
      .toBuffer();

    const base64Image = resizedImageBuffer.toString("base64");

    fs.writeFileSync(outputPath, base64Image);
    console.log(`Processed image ${imageId}`);
  } catch (error) {
    console.error(`Error processing image ${imageId}:`, error);
  }
}

async function processBatch(start, end) {
  const promises = [];
  for (let i = start; i <= end; i++) {
    promises.push(processImage(i));
  }
  await Promise.all(promises);
}

async function processAllImages() {
  const totalImages = 20000;
  const batchSize = 100;

  for (let i = 1; i <= totalImages; i += batchSize) {
    await processBatch(i, Math.min(i + batchSize - 1, totalImages));
    console.log(
      `Completed batch ${i} to ${Math.min(i + batchSize - 1, totalImages)}`
    );
  }
}

processAllImages();
