// BiomeRenderer.js — mapea alturas 0..1 a colores RGB según biomas
// interpola linealmente entre biomas adyacentes para transiciones suaves

import { ColorUtils } from '../utils/ColorUtils.js';
import { CONFIG } from '../config.js';

export class BiomeRenderer {
    constructor(width, height) { this.width = width; this.height = height; }

    render(grid, biomes, waterLevel = CONFIG.DEFAULT_WATER_LEVEL, alphas = null) {
        const imageData = new ImageData(this.width, this.height);
        const d = imageData.data;
        const c = {
            deepWater: ColorUtils.hexToRgb(biomes.deepWater),
            shallowWater: ColorUtils.hexToRgb(biomes.shallowWater),
            sand: ColorUtils.hexToRgb(biomes.sand),
            forest: ColorUtils.hexToRgb(biomes.forest),
            mountain: ColorUtils.hexToRgb(biomes.mountain),
            snow: ColorUtils.hexToRgb(biomes.snow),
        };

        const a = alphas ? {
            deepWater: alphas.deepWater ?? 1,
            shallowWater: alphas.shallowWater ?? 1,
            sand: alphas.sand ?? 1,
            forest: alphas.forest ?? 1,
            mountain: alphas.mountain ?? 1,
            snow: alphas.snow ?? 1,
        } : { deepWater: 1, shallowWater: 1, sand: 1, forest: 1, mountain: 1, snow: 1 };

        const tDeep = waterLevel * 0.5;
        const tShallow = waterLevel;
        const tSand = waterLevel + 0.10;
        const tForest = waterLevel + 0.30;
        const tMountain = waterLevel + 0.50;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = y * this.width + x;
                const h = Math.max(0, Math.min(1, grid[idx]));
                const p = idx * 4;
                let rgb;
                let alpha;

                if (h < tDeep) {
                    rgb = c.deepWater;
                    alpha = a.deepWater;
                } else if (h < tShallow) {
                    const t = (h - tDeep) / (tShallow - tDeep || 0.001);
                    rgb = ColorUtils.lerpRgb(c.deepWater, c.shallowWater, t);
                    alpha = a.deepWater + (a.shallowWater - a.deepWater) * t;
                } else if (h < tSand) {
                    const t = (h - tShallow) / (tSand - tShallow || 0.001);
                    rgb = ColorUtils.lerpRgb(c.shallowWater, c.sand, t);
                    alpha = a.shallowWater + (a.sand - a.shallowWater) * t;
                } else if (h < tForest) {
                    const t = (h - tSand) / (tForest - tSand || 0.001);
                    rgb = ColorUtils.lerpRgb(c.sand, c.forest, t);
                    alpha = a.sand + (a.forest - a.sand) * t;
                } else if (h < tMountain) {
                    const t = (h - tForest) / (tMountain - tForest || 0.001);
                    rgb = ColorUtils.lerpRgb(c.forest, c.mountain, t);
                    alpha = a.forest + (a.mountain - a.forest) * t;
                } else {
                    const t = Math.min(1, (h - tMountain) / (1 - tMountain || 0.001));
                    rgb = ColorUtils.lerpRgb(c.mountain, c.snow, t);
                    alpha = a.mountain + (a.snow - a.mountain) * t;
                }

                d[p] = ColorUtils.clampByte(rgb.r);
                d[p + 1] = ColorUtils.clampByte(rgb.g);
                d[p + 2] = ColorUtils.clampByte(rgb.b);
                d[p + 3] = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
            }
        }
        return imageData;
    }
}
