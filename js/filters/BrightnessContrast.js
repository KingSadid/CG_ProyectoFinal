// BrightnessContrast.js — ajuste combinado de brillo y contraste
// fórmula: v = contrast * (x + brightness - 128) + 128

import { PixelFilterBase } from './PixelFilterBase.js';
import { ColorUtils } from '../utils/ColorUtils.js';

export class BrightnessContrast extends PixelFilterBase {
    constructor(brightness, contrast) {
        super();
        this.brightness = brightness;
        this.contrastFactor = Math.max(0.1, 1 + (contrast / 100) * 1.5);
    }

    processPixel(r, g, b, a) {
        const f = (c) => ColorUtils.clampByte(this.contrastFactor * (c + this.brightness - 128) + 128);
        return { r: f(r), g: f(g), b: f(b), a };
    }
}
