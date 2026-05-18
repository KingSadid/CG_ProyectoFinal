// Orquestador principal: gestiona el pipeline de renderizado y las transformaciones del canvas.
import { CanvasEngine } from './CanvasEngine.js';
import { FractalMath } from './FractalMath.js';
import { MainScreen } from '../screens/MainScreen.js';
import { NoiseFilter } from '../filters/NoiseFilter.js';
import { BrightnessContrastFilter } from '../filters/BrightnessContrastFilter.js';
import { FrequencyFilter } from '../filters/FrequencyFilter.js';
import { TintFilter } from '../filters/TintFilter.js';

const WIDTH = 1920;
const HEIGHT = 1080;

export class App {
  constructor() {
    this.canvasEngine = new CanvasEngine('microscope-canvas', WIDTH, HEIGHT);
    this.fractalMath = new FractalMath(WIDTH, HEIGHT);

    this.filteredCanvas = document.createElement('canvas');
    this.filteredCanvas.width = WIDTH;
    this.filteredCanvas.height = HEIGHT;
    this.filteredCtx = this.filteredCanvas.getContext('2d', { willReadFrequently: true });

    this.originalCanvas = null;
    this.originalImageData = null;

    this.noiseFilter = new NoiseFilter();
    this.bcFilter = new BrightnessContrastFilter();
    this.freqFilter = new FrequencyFilter();
    this.tintFilter = new TintFilter();

    this.needsRegenerate = true;
    this.needsFilter = true;

    this.mainScreen = new MainScreen(this._onStateChange.bind(this));
    this.state = this.mainScreen.getState();
  }

  init() {
    this._render();
  }

  _onStateChange(newState, key) {
    this.state = newState;

    const fractalKeys = ['fractalType', 'maxIter', 'juliaR', 'juliaI'];
    const filterKeys = ['brightness', 'contrast', 'freqType', 'freqIntensity', 'tintR', 'tintG', 'tintB', 'tintA', 'noise'];

    if (fractalKeys.includes(key)) {
      this.needsRegenerate = true;
      this.needsFilter = true;
    } else if (filterKeys.includes(key)) {
      this.needsFilter = true;
    } else if (key === 'download') {
      this._download();
      return;
    }

    this._render();
  }

  _render() {
    if (this.needsRegenerate) {
      this.originalCanvas = this.fractalMath.generate(
        this.state.fractalType,
        this.state.maxIter,
        { r: this.state.juliaR, i: this.state.juliaI }
      );
      this.originalImageData = this.fractalMath.ctx.getImageData(0, 0, WIDTH, HEIGHT);
      this.needsRegenerate = false;
    }

    if (this.needsFilter) {
      const workingData = new ImageData(
        new Uint8ClampedArray(this.originalImageData.data),
        WIDTH,
        HEIGHT
      );

      this.noiseFilter.apply(workingData, this.state.noise);
      this.tintFilter.apply(workingData, {
        r: this.state.tintR,
        g: this.state.tintG,
        b: this.state.tintB,
        a: this.state.tintA
      });
      this.bcFilter.apply(workingData, this.state.brightness, this.state.contrast);
      this.freqFilter.apply(workingData, this.state.freqType, this.state.freqIntensity);

      this.filteredCtx.putImageData(workingData, 0, 0);
      this.needsFilter = false;
    }

    this.canvasEngine.render(
      this.filteredCanvas,
      this.state.tx,
      this.state.ty,
      this.state.scale,
      this.state.rotation
    );
  }

  _download() {
    const dataUrl = this.canvasEngine.toDataURL();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'muestra_microscopio.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
