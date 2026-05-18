// Filtro de tincion quimica con mezcla multiplicativa potenciada para alto impacto visual.
import { Filter } from './Filter.js';

export class TintFilter extends Filter {
  apply(imageData, tint) {
    const { r, g, b, a } = tint;
    if (a <= 0) return;

    const data = imageData.data;
    const tr = r / 255;
    const tg = g / 255;
    const tb = b / 255;
    const intensity = a * 2.5; // Amplificador de impacto

    for (let i = 0; i < data.length; i += 4) {
      const baseR = data[i];
      const baseG = data[i + 1];
      const baseB = data[i + 2];

      const tintedR = baseR * tr + (r - 128) * 1.2;
      const tintedG = baseG * tg + (g - 128) * 1.2;
      const tintedB = baseB * tb + (b - 128) * 1.2;

      data[i] = this._clamp(tintedR * intensity + baseR * (1 - intensity));
      data[i + 1] = this._clamp(tintedG * intensity + baseG * (1 - intensity));
      data[i + 2] = this._clamp(tintedB * intensity + baseB * (1 - intensity));
    }
  }
}
