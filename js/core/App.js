import { CanvasEngine } from './CanvasEngine.js';
import { FractalMath } from './FractalMath.js';
import { MainScreen } from '../screens/MainScreen.js';
import { NoiseFilter } from '../filters/NoiseFilter.js';
import { BrightnessContrastFilter } from '../filters/BrightnessContrastFilter.js';
import { FrequencyFilter } from '../filters/FrequencyFilter.js';
import { TintFilter } from '../filters/TintFilter.js';

const WIDTH = 1920;
const HEIGHT = 1080;

/**
 * App - Orquestador principal del Microscopio Digital.
 * Gestion el bucle de renderizado optimizado:
 * 1. Regenera el fractal solo si cambian parametros de muestra.
 * 2. Aplica el pipeline de filtros solo si cambian ajustes de imagen.
 * 3. Transformaciones espaciales (pan/rotate/zoom) son instantaneas via Canvas 2D.
 */
export class App {
  constructor() {
    this.canvasEngine = new CanvasEngine('microscope-canvas', WIDTH, HEIGHT);
    this.fractalMath = new FractalMath(WIDTH, HEIGHT);

    // Canvas off-screen para almacenar el resultado filtrado antes de dibujar
    this.filteredCanvas = document.createElement('canvas');
    this.filteredCanvas.width = WIDTH;
    this.filteredCanvas.height = HEIGHT;
    this.filteredCtx = this.filteredCanvas.getContext('2d', { willReadFrequently: true });

    // Cacheos
    this.originalCanvas = null;
    this.originalImageData = null;

    // Instancias de filtros (OCP / Pipeline)
    this.noiseFilter = new NoiseFilter();
    this.bcFilter = new BrightnessContrastFilter();
    this.freqFilter = new FrequencyFilter();
    this.tintFilter = new TintFilter();

    // Flags de invalidacion
    this.needsRegenerate = true;
    this.needsFilter = true;

    // Inicializar UI
    this.mainScreen = new MainScreen(this._onStateChange.bind(this));
    this.state = this.mainScreen.getState();
  }

  init() {
    this._render();
  }

  _onStateChange(newState, key) {
    this.state = newState;

    // Determinar invalidaciones segun el tipo de control
    const fractalKeys = ['fractalType', 'maxIter', 'juliaR', 'juliaI'];
    const filterKeys = ['brightness', 'contrast', 'freqType', 'freqIntensity', 'tintR', 'tintG', 'tintB', 'tintA', 'noise'];
    const spatialKeys = ['tx', 'ty', 'scale', 'rotation'];

    if (fractalKeys.includes(key)) {
      this.needsRegenerate = true;
      this.needsFilter = true;
    } else if (filterKeys.includes(key)) {
      this.needsFilter = true;
    } else if (key === 'download') {
      this._download();
      return;
    }
    // Las transformaciones espaciales no invalidan cache, solo redibujan

    this._render();
  }

  _render() {
    // 1. REGENERAR FRACTAL (si cambio tipo, iteraciones o constante Julia)
    if (this.needsRegenerate) {
      this.originalCanvas = this.fractalMath.generate(
        this.state.fractalType,
        this.state.maxIter,
        { r: this.state.juliaR, i: this.state.juliaI }
      );
      this.originalImageData = this.fractalMath.ctx.getImageData(0, 0, WIDTH, HEIGHT);
      this.needsRegenerate = false;
    }

    // 2. APLICAR PIPELINE DE FILTROS (si cambio algun ajuste de imagen)
    if (this.needsFilter) {
      // Clonar profundamente el ImageData original para no mutar la cache
      const workingData = new ImageData(
        new Uint8ClampedArray(this.originalImageData.data),
        WIDTH,
        HEIGHT
      );

      // Orden del Pipeline: Ruido -> Tincion -> Brillo/Contraste -> Frecuencia
      this.noiseFilter.apply(workingData, this.state.noise);
      this.tintFilter.apply(workingData, {
        r: this.state.tintR,
        g: this.state.tintG,
        b: this.state.tintB,
        a: this.state.tintA
      });
      this.bcFilter.apply(workingData, this.state.brightness, this.state.contrast);
      this.freqFilter.apply(workingData, this.state.freqType, this.state.freqIntensity);

      // Escribir resultado filtrado en el canvas off-screen
      this.filteredCtx.putImageData(workingData, 0, 0);
      this.needsFilter = false;
    }

    // 3. DIBUJAR EN CANVAS VISIBLE con transformaciones espaciales (instantaneo)
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

// Bootstrap de la aplicacion
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
