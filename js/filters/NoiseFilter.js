// NoiseFilter.js — inyecta ruido aleatorio uniforme sobre los canales RGB

import { PixelFilterBase } from './PixelFilterBase.js';
import { ColorUtils } from '../utils/ColorUtils.js';

export class NoiseFilter extends PixelFilterBase {
    constructor(intensity) { super(); this.intensity = Math.max(0, Math.min(100, intensity)); }

    processPixel(r, g, b, a) {
        if (this.intensity === 0) return { r, g, b, a };
        const max = this.intensity * 1.5;
        return {
            r: ColorUtils.clampByte(r + (Math.random() - 0.5) * max),
            g: ColorUtils.clampByte(g + (Math.random() - 0.5) * max),
            b: ColorUtils.clampByte(b + (Math.random() - 0.5) * max), a,
        };
    }
}
