// UIManager.js — vincula controles del DOM con callbacks del motor

import { CONFIG } from '../config.js';

export class UIManager {
    constructor(engine) {
        this.engine = engine;
        this.els = this._cacheElements();
        this.state = {
            roughness: CONFIG.DEFAULT_ROUGHNESS, waterLevel: CONFIG.DEFAULT_WATER_LEVEL,
            biomes: { deepWater: '#1a3a5c', shallowWater: '#2e6b8a', sand: '#c2a878', forest: '#3d6b46', mountain: '#6b5c4e', snow: '#e8e4df' },
            alphas: { deepWater: 1, shallowWater: 1, sand: 1, forest: 1, mountain: 1, snow: 1 },
            brightness: 0, contrast: 0, noise: 0, lowPass: false, highPass: false,
            format: CONFIG.DEFAULT_FORMAT, quality: CONFIG.DEFAULT_QUALITY,
        };
        this._bindListeners();
        this._updateHints();
    }

    _cacheElements() {
        return {
            btnGenerate: document.getElementById('btnGenerate'),
            roughness: document.getElementById('roughness'), roughnessValue: document.getElementById('roughnessValue'),
            waterLevel: document.getElementById('waterLevel'), waterLevelValue: document.getElementById('waterLevelValue'),
            colors: { deepWater: document.getElementById('colorDeepWater'), shallowWater: document.getElementById('colorShallowWater'), sand: document.getElementById('colorSand'), forest: document.getElementById('colorForest'), mountain: document.getElementById('colorMountain'), snow: document.getElementById('colorSnow') },
            hexes: { deepWater: document.getElementById('hexDeepWater'), shallowWater: document.getElementById('hexShallowWater'), sand: document.getElementById('hexSand'), forest: document.getElementById('hexForest'), mountain: document.getElementById('hexMountain'), snow: document.getElementById('hexSnow') },
            alphas: { deepWater: document.getElementById('alphaDeepWater'), shallowWater: document.getElementById('alphaShallowWater'), sand: document.getElementById('alphaSand'), forest: document.getElementById('alphaForest'), mountain: document.getElementById('alphaMountain'), snow: document.getElementById('alphaSnow') },
            alphaValues: { deepWater: document.getElementById('alphaDeepWaterValue'), shallowWater: document.getElementById('alphaShallowWaterValue'), sand: document.getElementById('alphaSandValue'), forest: document.getElementById('alphaForestValue'), mountain: document.getElementById('alphaMountainValue'), snow: document.getElementById('alphaSnowValue') },
            canvasOverlay: document.getElementById('canvasOverlay'),
            seedDisplay: document.getElementById('seedDisplay'),
            statusDot: document.getElementById('statusDot'), statusText: document.getElementById('statusText'),
            brightness: document.getElementById('brightness'), brightnessValue: document.getElementById('brightnessValue'),
            contrast: document.getElementById('contrast'), contrastValue: document.getElementById('contrastValue'),
            noise: document.getElementById('noise'), noiseValue: document.getElementById('noiseValue'),
            btnApplyFilters: document.getElementById('btnApplyFilters'), btnResetFilters: document.getElementById('btnResetFilters'),
            btnLowPass: document.getElementById('btnLowPass'), btnHighPass: document.getElementById('btnHighPass'),
            exportFormat: document.getElementById('exportFormat'),
            exportQuality: document.getElementById('exportQuality'), qualityValue: document.getElementById('qualityValue'),
            btnDownload: document.getElementById('btnDownload'),
            readoutZoom: document.getElementById('readoutZoom'), readoutRotate: document.getElementById('readoutRotate'),
            readoutPanX: document.getElementById('readoutPanX'), readoutPanY: document.getElementById('readoutPanY'),
        };
    }

    _bindListeners() {
        this.els.btnGenerate.addEventListener('click', () => this.engine.requestGeneration());

        this.els.roughness.addEventListener('input', (e) => { this.state.roughness = parseFloat(e.target.value); this.els.roughnessValue.textContent = this.state.roughness.toFixed(2); });
        this.els.waterLevel.addEventListener('input', (e) => { this.state.waterLevel = parseFloat(e.target.value); this.els.waterLevelValue.textContent = this.state.waterLevel.toFixed(2); });

        Object.keys(this.els.colors).forEach((k) => {
            this.els.colors[k].addEventListener('input', (e) => {
                this.state.biomes[k] = e.target.value;
                this.els.hexes[k].textContent = e.target.value.toUpperCase();
                this.engine.requestRegenerateColors();
            });
        });

        Object.keys(this.els.alphas).forEach((k) => {
            this.els.alphas[k].addEventListener('input', (e) => {
                this.state.alphas[k] = parseFloat(e.target.value);
                this.els.alphaValues[k].textContent = Math.round(this.state.alphas[k] * 100) + '%';
                this.engine.requestRegenerateColors();
            });
        });

        this.els.brightness.addEventListener('input', (e) => { this.state.brightness = parseInt(e.target.value, 10); this.els.brightnessValue.textContent = this.state.brightness; });
        this.els.contrast.addEventListener('input', (e) => { this.state.contrast = parseInt(e.target.value, 10); this.els.contrastValue.textContent = this.state.contrast; });
        this.els.noise.addEventListener('input', (e) => { this.state.noise = parseInt(e.target.value, 10); this.els.noiseValue.textContent = this.state.noise; });

        this.els.btnApplyFilters.addEventListener('click', () => this.engine.requestApplyFilters());
        this.els.btnResetFilters.addEventListener('click', () => {
            this.state.brightness = 0; this.els.brightness.value = 0; this.els.brightnessValue.textContent = '0';
            this.state.contrast = 0; this.els.contrast.value = 0; this.els.contrastValue.textContent = '0';
            this.state.noise = 0; this.els.noise.value = 0; this.els.noiseValue.textContent = '0';
            this.state.lowPass = false; this.els.btnLowPass.dataset.active = 'false';
            this.state.highPass = false; this.els.btnHighPass.dataset.active = 'false';
            this.engine.requestResetFilters();
        });
        this.els.btnLowPass.addEventListener('click', () => {
            this.state.lowPass = !this.state.lowPass;
            this.els.btnLowPass.dataset.active = String(this.state.lowPass);
            if (this.state.lowPass) { this.state.highPass = false; this.els.btnHighPass.dataset.active = 'false'; }
            this.engine.requestApplyFilters();
        });
        this.els.btnHighPass.addEventListener('click', () => {
            this.state.highPass = !this.state.highPass;
            this.els.btnHighPass.dataset.active = String(this.state.highPass);
            if (this.state.highPass) { this.state.lowPass = false; this.els.btnLowPass.dataset.active = 'false'; }
            this.engine.requestApplyFilters();
        });

        this.els.exportFormat.addEventListener('change', (e) => { this.state.format = e.target.value; });
        this.els.exportQuality.addEventListener('input', (e) => { this.state.quality = parseFloat(e.target.value); this.els.qualityValue.textContent = this.state.quality.toFixed(2); });
        this.els.btnDownload.addEventListener('click', () => this.engine.requestDownload(this.state.format, this.state.quality));
    }

    _updateHints() {
        this.els.roughnessValue.textContent = this.state.roughness.toFixed(2);
        this.els.waterLevelValue.textContent = this.state.waterLevel.toFixed(2);
        this.els.brightnessValue.textContent = this.state.brightness;
        this.els.contrastValue.textContent = this.state.contrast;
        this.els.noiseValue.textContent = this.state.noise;
        this.els.qualityValue.textContent = this.state.quality.toFixed(2);
    }

    setSeed(seed) { this.els.seedDisplay.textContent = `Seed: ${seed}`; }
    setStatus(state, text) { this.els.statusDot.dataset.state = state; this.els.statusText.textContent = text; }
    hideOverlay() { this.els.canvasOverlay.classList.add('is-hidden'); }
    showOverlay() { this.els.canvasOverlay.classList.remove('is-hidden'); }
    updateReadouts(vs) {
        this.els.readoutZoom.textContent = `${vs.scale.toFixed(2)}x`;
        this.els.readoutRotate.textContent = `${vs.rotationDeg} deg`;
        this.els.readoutPanX.textContent = `${vs.panX}`;
        this.els.readoutPanY.textContent = `${vs.panY}`;
    }
    setButtonLoading(isLoading) { this.els.btnGenerate.classList.toggle('is-loading', isLoading); this.els.btnGenerate.disabled = isLoading; }
}
