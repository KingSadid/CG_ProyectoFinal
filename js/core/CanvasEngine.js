// Motor del canvas visible. Encapsula el contexto 2D y las transformaciones espaciales.
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

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  render(sourceCanvas, tx, ty, scale, rotationDeg) {
    this.clear();
    this.ctx.save();

    this.ctx.translate(this.width / 2 + tx, this.height / 2 + ty);
    this.ctx.rotate(rotationDeg * Math.PI / 180);
    this.ctx.scale(scale, scale);
    this.ctx.drawImage(sourceCanvas, -this.width / 2, -this.height / 2);

    this.ctx.restore();
  }

  toDataURL() {
    return this.canvas.toDataURL('image/png');
  }
}
