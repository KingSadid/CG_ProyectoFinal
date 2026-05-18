// Filtro de ruido aleatorio sobre los canales RGB.
import { Filter } from './Filter.js';

export class NoiseFilter extends Filter {
  apply(imageData, intensity) {
    if (intensity <= 0) return;
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * amount * 2;
      data[i] = this._clamp(data[i] + noise);
      data[i + 1] = this._clamp(data[i + 1] + noise);
      data[i + 2] = this._clamp(data[i + 2] + noise);
    }
  }
}
