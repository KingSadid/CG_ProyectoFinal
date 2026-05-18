export class Filter {
  /**
   * Metodo abstracto a implementar por cada filtro hijo.
   * @param {ImageData} imageData
   * @param {...*} args - Parametros especificos del filtro
   */
  apply(imageData, ...args) {
    throw new Error('Filter.apply() debe ser implementado por la subclase');
  }

  /**
   * Restringe un valor numerico a un rango entero [min, max].
   */
  _clamp(value, min = 0, max = 255) {
    return Math.max(min, Math.min(max, value));
  }
}
