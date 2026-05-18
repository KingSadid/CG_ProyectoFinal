// Clase base abstracta para filtros de imagen pixel-a-pixel.
export class Filter {
  apply(imageData, ...args) {
    throw new Error('Filter.apply() debe ser implementado por la subclase');
  }
  _clamp(value, min = 0, max = 255) {
    return Math.max(min, Math.min(max, value));
  }
}
