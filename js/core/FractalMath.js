// Generador algoritmico de fractales: Mandelbrot, Julia, Burning Ship, Tricorn y Multibrot.
export class FractalMath {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  generate(type, maxIter, juliaC) {
    const imgData = this.ctx.createImageData(this.width, this.height);
    const data = imgData.data;
    const xMin = -2.5, xMax = 1.0;
    const yMin = -1.2, yMax = 1.2;

    for (let py = 0; py < this.height; py++) {
      for (let px = 0; px < this.width; px++) {
        const x0 = xMin + (px / this.width) * (xMax - xMin);
        const y0 = yMin + (py / this.height) * (yMax - yMin);

        let zx, zy, cx, cy;
        let iter = 0;

        if (type === 'julia') {
          zx = x0; zy = y0;
          cx = juliaC.r; cy = juliaC.i;
        } else {
          zx = 0; zy = 0;
          cx = x0; cy = y0;
        }

        if (type === 'burningship') {
          while (zx * zx + zy * zy < 4 && iter < maxIter) {
            const xtemp = zx * zx - zy * zy + cx;
            zy = Math.abs(2 * zx * zy) + cy;
            zx = Math.abs(xtemp);
            iter++;
          }
        } else if (type === 'tricorn') {
          while (zx * zx + zy * zy < 4 && iter < maxIter) {
            const xtemp = zx * zx - zy * zy + cx;
            zy = -2 * zx * zy + cy;
            zx = xtemp;
            iter++;
          }
        } else if (type === 'multibrot') {
          while (zx * zx + zy * zy < 4 && iter < maxIter) {
            const r = Math.sqrt(zx * zx + zy * zy);
            const theta = Math.atan2(zy, zx);
            const xtemp = Math.pow(r, 3) * Math.cos(3 * theta) + cx;
            zy = Math.pow(r, 3) * Math.sin(3 * theta) + cy;
            zx = xtemp;
            iter++;
          }
        } else {
          while (zx * zx + zy * zy < 4 && iter < maxIter) {
            const xtemp = zx * zx - zy * zy + cx;
            zy = 2 * zx * zy + cy;
            zx = xtemp;
            iter++;
          }
        }

        const [r, g, b] = this._getColor(iter, maxIter);
        const idx = (py * this.width + px) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(imgData, 0, 0);
    return this.canvas;
  }

  _getColor(iter, maxIter) {
    if (iter === maxIter) return [0, 0, 0];
    const t = iter / maxIter;
    const smoothT = Math.pow(t, 0.85);
    const r = Math.floor(this._lerp(0, 255, smoothT));
    const g = Math.floor(this._lerp(255, 0, Math.pow(smoothT, 0.9)));
    const b = Math.floor(this._lerp(157, 255, Math.sin(smoothT * Math.PI)));
    return [r, g, b];
  }

  _lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }
}
