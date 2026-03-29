const fs = require('fs');
const path = require('path');

// Basic JPEG/PNG/WebP dimension parser
function getDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg') {
        let offset = 2;
        while (offset < buffer.length) {
            const marker = buffer.readUInt16BE(offset);
            offset += 2;
            if (marker === 0xFFC0 || marker === 0xFFC2) {
                const height = buffer.readUInt16BE(offset + 3);
                const width = buffer.readUInt16BE(offset + 5);
                return { width, height };
            }
            offset += buffer.readUInt16BE(offset);
        }
    } else if (ext === '.png') {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height };
    }
    return { width: 1200, height: 1800 }; // Fallback
}

const imagesDir = 'images';
const folders = ['birthday', 'event', 'corporation', 'wedding'];

folders.forEach(folder => {
    const dirPath = path.join(imagesDir, folder);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
        files.forEach(file => {
            const dim = getDimensions(path.join(dirPath, file));
            console.log(`${folder}/${file}: ${dim.width}x${dim.height}`);
        });
    }
});
