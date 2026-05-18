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

    for (let i = 0; i < data.length; i += 4) {
      const baseR = data[i];
      const baseG = data[i + 1];
      const baseB = data[i + 2];

      const tintedR = baseR * tr + (r - 128) * 0.6;
      const tintedG = baseG * tg + (g - 128) * 0.6;
      const tintedB = baseB * tb + (b - 128) * 0.6;

      data[i] = this._clamp(tintedR * a + baseR * (1 - a));
      data[i + 1] = this._clamp(tintedG * a + baseG * (1 - a));
      data[i + 2] = this._clamp(tintedB * a + baseB * (1 - a));
    }
  }
}
