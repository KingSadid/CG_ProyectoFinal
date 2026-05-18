import { Filter } from './Filter.js';

/**
 * Filtro de Tincion Quimica (Tint).
 * Multiplica el color actual por un color RGB seleccionado y mezcla
 * segun el canal Alpha (opacidad de la tincion).
 */
export class TintFilter extends Filter {
  apply(imageData, tint) {
    const { r, g, b, a } = tint;
    if (a <= 0) return;

    const data = imageData.data;
    const tintR = r / 255;
    const tintG = g / 255;
    const tintB = b / 255;

    for (let i = 0; i < data.length; i += 4) {
      const newR = data[i] * tintR;
      const newG = data[i + 1] * tintG;
      const newB = data[i + 2] * tintB;

      data[i] = this._clamp(newR * a + data[i] * (1 - a));
      data[i + 1] = this._clamp(newG * a + data[i + 1] * (1 - a));
      data[i + 2] = this._clamp(newB * a + data[i + 2] * (1 - a));
    }
  }
}
