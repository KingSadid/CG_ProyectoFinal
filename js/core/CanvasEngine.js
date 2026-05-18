export class CanvasEngine {
  constructor(canvasId, width, height) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`CanvasEngine: No se encontro el canvas #${canvasId}`);
    }
    this.ctx = this.canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Limpia el canvas visible.
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Dibuja un canvas fuente aplicando transformaciones espaciales 2D.
   * Usa ctx.save() / ctx.restore() para mantener el estado limpio.
   * @param {HTMLCanvasElement} sourceCanvas - Canvas off-screen con los datos filtrados
   * @param {number} tx - Traslacion X en pixeles
   * @param {number} ty - Traslacion Y en pixeles
   * @param {number} scale - Factor de escala
   * @param {number} rotationDeg - Rotacion en grados
   */
  render(sourceCanvas, tx, ty, scale, rotationDeg) {
    this.clear();
    this.ctx.save();

    // Trasladar al centro del canvas + offset del usuario
    this.ctx.translate(this.width / 2 + tx, this.height / 2 + ty);

    // Rotar desde el centro
    this.ctx.rotate(rotationDeg * Math.PI / 180);

    // Escalar desde el centro
    this.ctx.scale(scale, scale);

    // Dibujar la imagen centrada
    this.ctx.drawImage(sourceCanvas, -this.width / 2, -this.height / 2);

    this.ctx.restore();
  }

  /**
   * Exporta la vista actual del canvas como DataURL PNG.
   * Captura zoom, rotacion y pan exactamente como los ve el usuario.
   */
  toDataURL() {
    return this.canvas.toDataURL('image/png');
  }
}
