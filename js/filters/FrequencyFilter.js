// FrequencyFilter.js — filtros de frecuencia espacial via convolución 3x3
// low: box blur (promedio vecinos).
// high: unsharp mask. 1) borrosa la imagen (low-pass), 2) resta del original para obtener
//    las altas frecuencias (bordes), 3) suma esas altas de vuelta al original para aumentar
//    la nitidez sin romper los colores.

import { PixelFilterBase } from './PixelFilterBase.js';
import { ColorUtils } from '../utils/ColorUtils.js';

export class FrequencyFilter extends PixelFilterBase {
    constructor(type, strength = 0.8) {
        super();
        this.type = type;
        this.strength = strength; // cuánto del paso alto sumamos de vuelta (0..1+)
    }

    // sobreescribo apply porque el high-pass necesita dos pasadas (original + borroso)
    apply(imageData) {
        if (this.type === 'low') {
            // box blur directo sobre el array original
            this._applyBoxBlur(imageData.data, imageData.width, imageData.height);
            return;
        }

        //  High-Pass 
        const w = imageData.width;
        const h = imageData.height;
        const orig = imageData.data;

        // 1) clonar y borrosar
        const blurred = new Uint8ClampedArray(orig);
        this._applyBoxBlur(blurred, w, h);

        // 2) unsharp mask: resultado = original + fuerza * (original - borroso)
        //    (original - borroso) = paso alto (las diferencias = detalles y bordes)
        const k = this.strength;
        for (let i = 0; i < orig.length; i += 4) {
            const r = orig[i]   + (orig[i]   - blurred[i])   * k;
            const g = orig[i+1] + (orig[i+1] - blurred[i+1]) * k;
            const b = orig[i+2] + (orig[i+2] - blurred[i+2]) * k;
            orig[i]   = ColorUtils.clampByte(r);
            orig[i+1] = ColorUtils.clampByte(g);
            orig[i+2] = ColorUtils.clampByte(b);
            // alpha se conserva
        }
    }

    // método dummy para mantener la firma de la clase base
    processPixel(r, g, b, a) { return { r, g, b, a }; }

    // box blur 3x3 in-place sobre un Uint8ClampedArray
    _applyBoxBlur(data, w, h) {
        const tmp = new Uint8ClampedArray(data);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                let sr = 0, sg = 0, sb = 0, count = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const nx = x + kx, ny = y + ky;
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                            const ni = (ny * w + nx) * 4;
                            sr += tmp[ni]; sg += tmp[ni+1]; sb += tmp[ni+2]; count++;
                        }
                    }
                }
                data[idx]   = sr / count;
                data[idx+1] = sg / count;
                data[idx+2] = sb / count;
            }
        }
    }
}
