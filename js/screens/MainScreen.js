// Controlador de la vista principal. Ensambla widgets y expone el estado global de la UI.
import { SliderWidget } from '../widgets/SliderWidget.js';
import { ButtonWidget } from '../widgets/ButtonWidget.js';
import { SelectWidget } from '../widgets/SelectWidget.js';

export class MainScreen {
  constructor(onStateChange) {
    this.onStateChange = onStateChange;
    this.state = {
      fractalType: 'mandelbrot',
      maxIter: 500,
      juliaR: -0.7,
      juliaI: 0.27015,
      tx: 0,
      ty: 0,
      scale: 1.0,
      rotation: 0,
      brightness: 0,
      contrast: 1.0,
      freqType: 'highpass',
      freqIntensity: 0.0,
      tintR: 0,
      tintG: 255,
      tintB: 157,
      tintA: 0.0,
      noise: 0
    };

    this._initWidgets();
  }

  _initWidgets() {
    this.fractalSelect = new SelectWidget('widget-fractal-type', {
      label: 'Tipo de Muestra',
      options: [
        { value: 'mandelbrot', label: 'Mandelbrot' },
        { value: 'julia', label: 'Julia' },
        { value: 'burningship', label: 'Burning Ship' },
        { value: 'tricorn', label: 'Tricorn' },
        { value: 'multibrot', label: 'Multibrot (p=3)' }
      ],
      value: 'mandelbrot',
      onChange: (v) => {
        this.state.fractalType = v;
        const isJulia = v === 'julia';
        this.juliaRealSlider.setVisible(isJulia);
        this.juliaImagSlider.setVisible(isJulia);
        this._notify('fractalType');
      }
    });

    this.iterSlider = new SliderWidget('widget-iterations', {
      label: 'Iteraciones',
      min: 50, max: 2000, step: 50, value: 500, realtime: false,
      onChange: (v) => { this.state.maxIter = v; this._notify('maxIter'); }
    });

    this.juliaRealSlider = new SliderWidget('widget-julia-real', {
      label: 'Julia Real',
      min: -2.0, max: 2.0, step: 0.01, value: -0.7, realtime: false,
      onChange: (v) => { this.state.juliaR = v; this._notify('juliaR'); }
    });
    this.juliaRealSlider.setVisible(false);

    this.juliaImagSlider = new SliderWidget('widget-julia-imag', {
      label: 'Julia Imag',
      min: -2.0, max: 2.0, step: 0.01, value: 0.27015, realtime: false,
      onChange: (v) => { this.state.juliaI = v; this._notify('juliaI'); }
    });
    this.juliaImagSlider.setVisible(false);

    this.txSlider = new SliderWidget('widget-tx', {
      label: 'Traslacion X',
      min: -1000, max: 1000, step: 10, value: 0, realtime: true,
      onChange: (v) => { this.state.tx = v; this._notify('tx'); }
    });

    this.tySlider = new SliderWidget('widget-ty', {
      label: 'Traslacion Y',
      min: -1000, max: 1000, step: 10, value: 0, realtime: true,
      onChange: (v) => { this.state.ty = v; this._notify('ty'); }
    });

    this.scaleSlider = new SliderWidget('widget-scale', {
      label: 'Escala',
      min: 0.1, max: 5.0, step: 0.1, value: 1.0, realtime: true,
      onChange: (v) => { this.state.scale = v; this._notify('scale'); }
    });

    this.rotSlider = new SliderWidget('widget-rotation', {
      label: 'Rotacion',
      min: 0, max: 360, step: 1, value: 0, realtime: true,
      onChange: (v) => { this.state.rotation = v; this._notify('rotation'); }
    });

    this.brightnessSlider = new SliderWidget('widget-brightness', {
      label: 'Brillo',
      min: -100, max: 100, step: 1, value: 0, realtime: false,
      onChange: (v) => { this.state.brightness = v; this._notify('brightness'); }
    });

    this.contrastSlider = new SliderWidget('widget-contrast', {
      label: 'Contraste',
      min: 0.0, max: 3.0, step: 0.1, value: 1.0, realtime: false,
      onChange: (v) => { this.state.contrast = v; this._notify('contrast'); }
    });

    this.freqBtn = new ButtonWidget('widget-freq-type', {
      label: 'High-pass',
      activeLabel: 'Low-pass',
      type: 'toggle',
      onClick: (isLow) => {
        this.state.freqType = isLow ? 'lowpass' : 'highpass';
        this._notify('freqType');
      }
    });

    this.freqIntensitySlider = new SliderWidget('widget-freq-intensity', {
      label: 'Intensidad Kernel',
      min: 0.0, max: 2.0, step: 0.1, value: 0.0, realtime: false,
      onChange: (v) => { this.state.freqIntensity = v; this._notify('freqIntensity'); }
    });

    this.tintRSlider = new SliderWidget('widget-tint-r', {
      label: 'Tincion R',
      min: 0, max: 255, step: 1, value: 0, realtime: false,
      onChange: (v) => { this.state.tintR = v; this._notify('tint'); }
    });

    this.tintGSlider = new SliderWidget('widget-tint-g', {
      label: 'Tincion G',
      min: 0, max: 255, step: 1, value: 255, realtime: false,
      onChange: (v) => { this.state.tintG = v; this._notify('tint'); }
    });

    this.tintBSlider = new SliderWidget('widget-tint-b', {
      label: 'Tincion B',
      min: 0, max: 255, step: 1, value: 157, realtime: false,
      onChange: (v) => { this.state.tintB = v; this._notify('tint'); }
    });

    this.tintASlider = new SliderWidget('widget-tint-a', {
      label: 'Opacidad Tincion',
      min: 0.0, max: 1.0, step: 0.01, value: 0.0, realtime: false,
      onChange: (v) => { this.state.tintA = v; this._notify('tint'); }
    });

    this.noiseSlider = new SliderWidget('widget-noise', {
      label: 'Ruido Ambiental',
      min: 0, max: 100, step: 1, value: 0, realtime: false,
      onChange: (v) => { this.state.noise = v; this._notify('noise'); }
    });

    this.downloadBtn = new ButtonWidget('widget-download', {
      label: 'Descargar Evidencia',
      type: 'action',
      onClick: () => { this._notify('download'); }
    });
  }

  _notify(key) {
    this.onStateChange(this.state, key);
  }

  getState() {
    return { ...this.state };
  }
}
