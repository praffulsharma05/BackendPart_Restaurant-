const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\praff\\.gemini\\antigravity-ide\\brain\\08caae5d-b237-483f-8730-76dad16aff6c';
const frontendImagesDir = path.join(__dirname, '../Frontend/public/images');
const backendImagesDir = path.join(__dirname, 'public/images');

if (!fs.existsSync(frontendImagesDir)) {
  fs.mkdirSync(frontendImagesDir, { recursive: true });
}
if (!fs.existsSync(backendImagesDir)) {
  fs.mkdirSync(backendImagesDir, { recursive: true });
}

const mapping = {
  chicken_kathi_roll: 'chicken_roll.png',
  mutton_kathi_roll: 'mutton_roll.png',
  tandoori_soya_chaap: 'soya_chaap.png',
  paneer_tikka_dish: 'paneer_tikka.png',
  chicken_soup_bowl: 'chicken_soup.png',
  chicken_lollipop_dish: 'chicken_lollipop.png',
  butter_chicken_dish: 'butter_chicken.png',
  mutton_curry_dish: 'mutton_curry.png',
  chicken_biryani_dish: 'biryani.png',
  steamed_momos_dish: 'momos.png',
  tandoori_roti_dish: 'tandoori_roti.png',
};

console.log('📂 Copying all food image assets to Frontend public/images & Backend public/images...');

const files = fs.readdirSync(brainDir);
for (const file of files) {
  if (file.endsWith('.png')) {
    for (const [prefix, targetName] of Object.entries(mapping)) {
      if (file.startsWith(prefix)) {
        const srcPath = path.join(brainDir, file);
        const fePath = path.join(frontendImagesDir, targetName);
        const bePath = path.join(backendImagesDir, targetName);
        fs.copyFileSync(srcPath, fePath);
        fs.copyFileSync(srcPath, bePath);
        console.log(`  ✅ ${file} -> ${targetName}`);
      }
    }
  }
}

console.log('🎉 Done! Images copied to public/images folder.');
