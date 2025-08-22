import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, "public", "safety_net_logo.png");

const sizes = [
  { name: "safetynet_512.png", size: 512 },
  { name: "safetynet_192.png", size: 192 },
];

async function generateImages() {
  try {
    for (const { name, size } of sizes) {
      await sharp(inputPath)
        .resize(size, size)
        .toFile(path.join(__dirname, "public", name));

      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
  } catch (err) {
    console.error("❌ Error processing images:", err);
  }
}

generateImages();
