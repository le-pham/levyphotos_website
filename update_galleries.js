const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  // Silent fail locally if not installed, but it will be installed in GitHub Actions
}

const folders = ['birthday', 'corporation', 'event', 'instant', 'wedding'];
const imageDir = 'images';
const thumbnailDir = 'images/thumbnails';

async function updateGalleries() {
  for (const folder of folders) {
    const imagesPath = path.join(imageDir, folder);
    const thumbnailsPath = path.join(thumbnailDir, folder);
    const indexPath = path.join(folder, 'index.html');

    if (fs.existsSync(imagesPath) && fs.existsSync(indexPath)) {
      if (!fs.existsSync(thumbnailsPath)) fs.mkdirSync(thumbnailsPath, { recursive: true });

      const files = fs.readdirSync(imagesPath)
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      // Remove orphaned thumbnails
      if (fs.existsSync(thumbnailsPath)) {
        const thumbFiles = fs.readdirSync(thumbnailsPath);
        for (const thumbFile of thumbFiles) {
          if (!files.includes(thumbFile)) {
            try { fs.unlinkSync(path.join(thumbnailsPath, thumbFile)); } catch (e) {}
          }
        }
      }

      let galleryHtml = '';
      for (const file of files) {
        const fullImagePath = path.join(imagesPath, file);
        const thumbPath = path.join(thumbnailsPath, file);

        if (!fs.existsSync(thumbPath) && sharp) {
          console.log(`Generating thumbnail for ${folder}/${file}...`);
          try {
            await sharp(fullImagePath).resize(800, null, {维护: true, withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(thumbPath);
          } catch (err) {
            console.error(`Error generating thumbnail for ${file}:`, err);
          }
        }

        galleryHtml += `            <div class="gallery-item">
                <a href="/images/${folder}/${file}" data-fancybox="gallery">
                    <img src="/images/thumbnails/${folder}/${file}" alt="${folder.charAt(0).toUpperCase() + folder.slice(1)} Photo ${file.split('.')[0]}">
                </a>
            </div>\n`;
      }

      let indexContent = fs.readFileSync(indexPath, 'utf8');
      const startTag = '<!-- GALLERY GRID -->';
      const endTag = '<!-- GALLERY GRID END -->';
      
      if (indexContent.includes(startTag) && indexContent.includes(endTag)) {
          const startIdx = indexContent.indexOf(startTag) + startTag.length;
          const endIdx = indexContent.indexOf(endTag);
          const newGrid = `\n        <div class="gallery-grid" id="gallery">\n${galleryHtml}        </div>\n        `;
          indexContent = indexContent.substring(0, startIdx) + newGrid + indexContent.substring(endIdx);
          fs.writeFileSync(indexPath, indexContent);
          console.log(`Updated ${folder}/index.html with ${files.length} images.`);
      }
    }
  }
}

updateGalleries().catch(console.error);
