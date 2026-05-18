// DiamondSquare.js — algoritmo fractal con animación paso a paso
// grilla (2^n + 1). En cada frame avanza un nivel de subdivisión.

import { PRNG } from '../utils/PRNG.js';

export class DiamondSquare {
    constructor(size, roughness, prng) {
        this.size = size;
        this.roughness = roughness;
        this.prng = prng;
        this.grid = new Float32Array(size * size);
        this.step = size - 1;
        this.iteration = 0;
        this.isDone = false;
        this._initCorners();
    }

    _initCorners() {
        const s = this.size - 1;
        this._set(0, 0, this.prng.next());
        this._set(s, 0, this.prng.next());
        this._set(0, s, this.prng.next());
        this._set(s, s, this.prng.next());
    }

    _get(x, y) { return this.grid[y * this.size + x]; }
    _set(x, y, v) { this.grid[y * this.size + x] = v; }

    stepOnce() {
        if (this.step <= 1 || this.isDone) { this.isDone = true; return false; }

        const half = this.step / 2;
        const scale = Math.pow(this.roughness, this.iteration);

        // fase diamond: promedio de las 4 esquinas + desplazamiento aleatorio
        for (let y = half; y < this.size - 1; y += this.step) {
            for (let x = half; x < this.size - 1; x += this.step) {
                const avg = (
                    this._get(x - half, y - half) + this._get(x + half, y - half) +
                    this._get(x - half, y + half) + this._get(x + half, y + half)
                ) / 4;
                this._set(x, y, avg + this.prng.nextOffset() * scale);
            }
        }

        // fase square: promedio de los 4 puntos cardinales
        for (let y = 0; y < this.size - 1; y += half) {
            for (let x = (y + half) % this.step; x < this.size - 1; x += this.step) {
                let sum = 0, count = 0;
                if (y - half >= 0) { sum += this._get(x, y - half); count++; }
                if (y + half < this.size) { sum += this._get(x, y + half); count++; }
                if (x + half < this.size) { sum += this._get(x + half, y); count++; }
                if (x - half >= 0) { sum += this._get(x - half, y); count++; }
                this._set(x, y, (sum / count) + this.prng.nextOffset() * scale);

                // reflejar bordes para continuidad
                if (x === 0) this._set(this.size - 1, y, this._get(x, y));
                if (y === 0) this._set(x, this.size - 1, this._get(x, y));
            }
        }

        this.step = half;
        this.iteration++;
        return true;
    }

    normalize() {
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] < min) min = this.grid[i];
            if (this.grid[i] > max) max = this.grid[i];
        }
        const range = max - min || 1;
        for (let i = 0; i < this.grid.length; i++) this.grid[i] = (this.grid[i] - min) / range;
    }
}
