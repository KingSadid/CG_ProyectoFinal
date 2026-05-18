// PixelFilterBase.js — clase base para filtros que operan píxeles directamente
// las subclases solo implementan processPixel()

export class PixelFilterBase {
    constructor() {
        if (new.target === PixelFilterBase) throw new TypeError('PixelFilterBase es abstracta');
    }

    apply(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            const res = this.processPixel(r, g, b, a, i, data, imageData.width, imageData.height);
            data[i] = res.r; data[i + 1] = res.g; data[i + 2] = res.b; data[i + 3] = res.a;
        }
    }

    processPixel(r, g, b, a, index, data, width, height) {
        throw new Error('processPixel() debe ser implementado por la subclase');
    }
}
