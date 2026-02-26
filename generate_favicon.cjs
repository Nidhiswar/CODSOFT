const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const src = 'c:/Users/HP/Downloads/Projects/CodeSoft/novel/novel-exporters-hub-main/src/assets/novel-logo-final.png';
const publicDir = 'c:/Users/HP/Downloads/Projects/CodeSoft/novel/novel-exporters-hub-main/public';
const outPng = path.join(publicDir, 'favicon.png');
const outIco = path.join(publicDir, 'favicon.ico');
const tempDir = path.join(publicDir, 'temp-ico');

async function processLogo() {
    // Dynamic import for png-to-ico (ESM module)
    const pngToIco = (await import('png-to-ico')).default;
    
    try {
        // Read the source image metadata
        const metadata = await sharp(src).metadata();
        console.log(`Source image: ${metadata.width}x${metadata.height}`);

        const size = 512;
        const aspect = metadata.width / metadata.height;
        let w, h;

        if (aspect > 1) { // Wide image
            w = size;
            h = Math.round(size / aspect);
        } else { // Tall or square image
            h = size;
            w = Math.round(size * aspect);
        }

        // Resize the logo to fit within 512x512 maintaining aspect ratio
        const resizedLogo = await sharp(src)
            .resize(w, h, { fit: 'inside' })
            .toBuffer();

        // Create 512x512 square PNG with transparent background and centered logo
        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
            .composite([{
                input: resizedLogo,
                gravity: 'center'
            }])
            .png()
            .toFile(outPng);

        console.log('Saved 512x512 PNG to:', outPng);

        // Create temporary directory for multiple size PNGs
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // ICO sizes for multi-resolution: 16, 24, 32, 48, 64, 128, 256
        const icoSizes = [16, 24, 32, 48, 64, 128, 256];
        const tempFiles = [];

        for (const icoSize of icoSizes) {
            const tempFile = path.join(tempDir, `icon-${icoSize}.png`);
            
            // Calculate dimensions for this size
            let iw, ih;
            if (aspect > 1) {
                iw = icoSize;
                ih = Math.round(icoSize / aspect);
            } else {
                ih = icoSize;
                iw = Math.round(icoSize * aspect);
            }

            const resizedForIco = await sharp(src)
                .resize(iw, ih, { fit: 'inside' })
                .toBuffer();

            await sharp({
                create: {
                    width: icoSize,
                    height: icoSize,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                }
            })
                .composite([{
                    input: resizedForIco,
                    gravity: 'center'
                }])
                .png()
                .toFile(tempFile);

            tempFiles.push(tempFile);
        }

        // Convert all sizes to a single multi-resolution ICO
        const icoBuffer = await pngToIco(tempFiles);
        fs.writeFileSync(outIco, icoBuffer);
        console.log('Saved multi-size ICO (16, 24, 32, 48, 64, 128, 256) to:', outIco);

        // Cleanup temp files
        for (const tempFile of tempFiles) {
            fs.unlinkSync(tempFile);
        }
        fs.rmdirSync(tempDir);
        console.log('Cleaned up temporary files');

        console.log('\n✓ Favicon generation complete!');
        console.log('  - favicon.png: 512x512 (for Google Search & high-res displays)');
        console.log('  - favicon.ico: Multi-size (16-256px for browser compatibility)');

    } catch (err) {
        console.error('Error processing logo:', err);
    }
}

processLogo();
