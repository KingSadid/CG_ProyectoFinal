// Filtro de ajuste de brillo y contraste fotografico.
import { Filter } from './Filter.js';

export class BrightnessContrastFilter extends Filter {
  apply(imageData, brightness, contrast) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = this._clamp((data[i] - 128) * contrast + 128 + brightness);
      data[i + 1] = this._clamp((data[i + 1] - 128) * contrast + 128 + brightness);
      data[i + 2] = this._clamp((data[i + 2] - 128) * contrast + 128 + brightness);
    }
  }
}
