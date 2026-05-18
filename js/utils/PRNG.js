// PRNG.js — generador pseudoaleatorio (Park-Miller LCG)
// permite reproducir el mismo terreno si usas la misma semilla

export class PRNG {
    constructor(seed) {
        this._seed = (seed != null ? Math.abs(seed) : Date.now()) % 2147483647;
        if (this._seed === 0) this._seed = 12345;
    }

    next() {
        // x_{n+1} = (16807 * x_n) mod (2^31 - 1)
        this._seed = (16807 * this._seed) % 2147483647;
        return (this._seed - 1) / 2147483646;
    }

    nextRange(min, max) { return min + this.next() * (max - min); }
    nextOffset() { return this.nextRange(-1.0, 1.0); }
    get seed() { return this._seed; }
}
