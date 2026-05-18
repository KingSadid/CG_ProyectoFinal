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

    // Seleccionar funcion de iteracion una vez para evitar branching por pixel
    let iterate;
    if (type === 'burningship') {
      iterate = (zx, zy, cx, cy) => {
        const xtemp = zx * zx - zy * zy + cx;
        return [Math.abs(xtemp), Math.abs(2 * zx * zy) + cy];
      };
    } else if (type === 'tricorn') {
      iterate = (zx, zy, cx, cy) => {
        const xtemp = zx * zx - zy * zy + cx;
        return [xtemp, -2 * zx * zy + cy];
      };
    } else if (type === 'multibrot') {
      // z^3 usando expansion algebraica directa (mucho mas rapido que polar)
      iterate = (zx, zy, cx, cy) => {
        const zx2 = zx * zx;
        const zy2 = zy * zy;
        const xtemp = zx * (zx2 - 3 * zy2) + cx;
        const newZy = zy * (3 * zx2 - zy2) + cy;
        return [xtemp, newZy];
      };
    } else {
      iterate = (zx, zy, cx, cy) => {
        const xtemp = zx * zx - zy * zy + cx;
        return [xtemp, 2 * zx * zy + cy];
      };
    }

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

        while (zx * zx + zy * zy < 4 && iter < maxIter) {
          const [newZx, newZy] = iterate(zx, zy, cx, cy);
          zx = newZx;
          zy = newZy;
          iter++;
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
