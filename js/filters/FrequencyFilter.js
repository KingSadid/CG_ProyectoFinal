// Filtro de frecuencia por convolucion 3x3: High-pass y Low-pass.
import { Filter } from './Filter.js';

export class FrequencyFilter extends Filter {
  constructor() {
    super();
    this.kernels = {
      highpass: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      lowpass: [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9]
    };
  }

  apply(imageData, type, intensity) {
    if (intensity <= 0) return;

    const { width, height, data } = imageData;
    const kernel = this.kernels[type];
    if (!kernel) return;

    const output = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const py = this._clamp(y + ky, 0, height - 1);
            const px = this._clamp(x + kx, 0, width - 1);
            const idx = (py * width + px) * 4;
            const kVal = kernel[(ky + 1) * 3 + (kx + 1)];
            r += data[idx] * kVal;
            g += data[idx + 1] * kVal;
            b += data[idx + 2] * kVal;
          }
        }

        const idx = (y * width + x) * 4;
        output[idx] = this._clamp(data[idx] * (1 - intensity) + r * intensity);
        output[idx + 1] = this._clamp(data[idx + 1] * (1 - intensity) + g * intensity);
        output[idx + 2] = this._clamp(data[idx + 2] * (1 - intensity) + b * intensity);
        output[idx + 3] = data[idx + 3];
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i] = output[i];
    }
  }
}
