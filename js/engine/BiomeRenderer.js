// BiomeRenderer.js — mapea alturas 0..1 a colores RGB según biomas
// interpola linealmente entre biomas adyacentes para transiciones suaves

import { ColorUtils } from '../utils/ColorUtils.js';
import { CONFIG } from '../config.js';

export class BiomeRenderer {
    constructor(width, height) { this.width = width; this.height = height; }

    render(grid, biomes, waterLevel = CONFIG.DEFAULT_WATER_LEVEL) {
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

                if (h < tDeep) rgb = c.deepWater;
                else if (h < tShallow) rgb = ColorUtils.lerpRgb(c.deepWater, c.shallowWater, (h - tDeep) / (tShallow - tDeep || 0.001));
                else if (h < tSand) rgb = ColorUtils.lerpRgb(c.shallowWater, c.sand, (h - tShallow) / (tSand - tShallow || 0.001));
                else if (h < tForest) rgb = ColorUtils.lerpRgb(c.sand, c.forest, (h - tSand) / (tForest - tSand || 0.001));
                else if (h < tMountain) rgb = ColorUtils.lerpRgb(c.forest, c.mountain, (h - tForest) / (tMountain - tForest || 0.001));
                else rgb = ColorUtils.lerpRgb(c.mountain, c.snow, Math.min(1, (h - tMountain) / (1 - tMountain || 0.001)));

                d[p] = ColorUtils.clampByte(rgb.r);
                d[p + 1] = ColorUtils.clampByte(rgb.g);
                d[p + 2] = ColorUtils.clampByte(rgb.b);
                d[p + 3] = 255;
            }
        }
        return imageData;
    }
}
