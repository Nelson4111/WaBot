import { createCanvas, loadImage, GlobalFonts, Canvas, Image } from '@napi-rs/canvas';

const registerFont = (path, options) => {
    try {
        GlobalFonts.registerFromPath(path, options ? options.family : undefined);
    } catch (e) {
        console.error('Failed to register font:', e);
    }
};

export {
    createCanvas,
    loadImage,
    registerFont,
    Canvas,
    Image,
    GlobalFonts
};

export default {
    createCanvas,
    loadImage,
    registerFont,
    Canvas,
    Image,
    GlobalFonts
};
