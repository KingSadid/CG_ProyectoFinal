// App.js — orquestador principal de la aplicación
// une la generación fractal, el canvas, la UI y los filtros.

import { CONFIG } from './config.js';
import { PRNG } from './utils/PRNG.js';
import { CanvasManager } from './engine/CanvasManager.js';
import { Viewport } from './engine/Viewport.js';
import { DiamondSquare } from './engine/DiamondSquare.js';
import { BiomeRenderer } from './engine/BiomeRenderer.js';
import { UIManager } from './ui/UIManager.js';
import { PanelAnimator } from './ui/PanelAnimator.js';
import { ExportController } from './ui/ExportController.js';
import { NoiseFilter } from './filters/NoiseFilter.js';
import { BrightnessContrast } from './filters/BrightnessContrast.js';
import { FrequencyFilter } from './filters/FrequencyFilter.js';

export class App {
    constructor() {
        this.seed = Math.floor(Date.now() + Math.random() * 10000);
        this.prng = new PRNG(this.seed);
        this.ds = null;
        this.baseImageData = null;
        this.isGenerating = false;

        this.canvasManager = new CanvasManager('mainCanvas', CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.viewport = new Viewport();
        this.biomeRenderer = new BiomeRenderer(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.exportController = new ExportController(this.canvasManager);
        this.ui = new UIManager(this);
        this.panels = new PanelAnimator();

        this.canvasEl = document.getElementById('mainCanvas');
        this.coordEl = document.getElementById('canvasCoords');
        this.coordX = document.getElementById('coordX');
        this.coordY = document.getElementById('coordY');
    }

    init() {
        this.ui.setSeed(this.seed);
        this.ui.setStatus('idle', 'Listo para generar');
        this._bindCanvasInput();
        this._bindNavButtons();
        this._updateViewportReadouts();
        this._renderFrame();

        // activa las transiciones de entrada de los paneles
        document.body.classList.add('is-loaded');
    }

    // --- Generación Fractal Animada ---

    requestGeneration() {
        if (this.isGenerating) return;
        this.seed = Math.floor(Date.now() + Math.random() * 10000);
        this.prng = new PRNG(this.seed);
        this.ui.setSeed(this.seed);
        this.ui.hideOverlay();
        this.ui.setButtonLoading(true);
        this.ui.setStatus('active', 'Generando...');

        this.isGenerating = true;
        this.baseImageData = null;
        this.ds = new DiamondSquare(CONFIG.GRID_SIZE, this.ui.state.roughness, this.prng);
        this._runGenerationLoop();
    }

    _runGenerationLoop() {
        const loop = () => {
            if (!this.isGenerating || !this.ds) return;
            if (this.ds.stepOnce()) {
                this._previewCurrentGrid();
                requestAnimationFrame(loop);
            } else {
                this.ds.normalize();
                this._renderFinalMap();
                this.isGenerating = false;
                this.ui.setButtonLoading(false);
                this.ui.setStatus('success', 'Mapa listo');
                setTimeout(() => this.ui.setStatus('idle', 'Listo'), 2000);
            }
        };
        loop();
    }

    _previewCurrentGrid() {
        const imgData = this.biomeRenderer.render(this.ds.grid, this.ui.state.biomes, this.ui.state.waterLevel, this.ui.state.alphas);
        this.canvasManager.putOffscreenData(imgData);
        this.canvasManager.renderDirect();
    }

    _renderFinalMap() {
        this.baseImageData = this.biomeRenderer.render(this.ds.grid, this.ui.state.biomes, this.ui.state.waterLevel, this.ui.state.alphas);
        this.canvasManager.putOffscreenData(this.baseImageData);
        this.canvasManager.renderDirect();
    }

    // --- Cambio de colores sin recalcular fractal ---

    requestRegenerateColors() {
        if (!this.ds || !this.ds.isDone) return;
        this.baseImageData = this.biomeRenderer.render(this.ds.grid, this.ui.state.biomes, this.ui.state.waterLevel, this.ui.state.alphas);
        this.canvasManager.putOffscreenData(this.baseImageData);
        this.canvasManager.renderWithViewport(this.viewport);
    }

    // --- Filtros de píxeles ---

    requestApplyFilters() {
        if (!this.baseImageData) return;
        const clone = new ImageData(new Uint8ClampedArray(this.baseImageData.data), this.baseImageData.width, this.baseImageData.height);
        const s = this.ui.state;

        if (s.brightness !== 0 || s.contrast !== 0) new BrightnessContrast(s.brightness, s.contrast).apply(clone);
        if (s.noise > 0) new NoiseFilter(s.noise).apply(clone);
        if (s.lowPass) new FrequencyFilter('low').apply(clone);
        else if (s.highPass) new FrequencyFilter('high').apply(clone);

        this.canvasManager.putOffscreenData(clone);
        this.canvasManager.renderWithViewport(this.viewport);
    }

    requestResetFilters() {
        if (!this.baseImageData) return;
        this.canvasManager.putOffscreenData(this.baseImageData);
        this.canvasManager.renderWithViewport(this.viewport);
    }

    // --- Exportar ---

    requestDownload(format, quality) {
        if (!this.baseImageData) { alert('Genera un mapa antes de exportar'); return; }
        this.exportController.download(format, quality, `aethermap_${this.seed}`);
    }

    // --- Input sobre canvas ---

    _bindCanvasInput() {
        const c = this.canvasEl;

        c.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = c.getBoundingClientRect();
            const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
            this.viewport.zoom(-Math.sign(e.deltaY) * CONFIG.ZOOM_STEP, mx, my);
            this._updateViewportReadouts();
        }, { passive: false });

        c.addEventListener('pointerdown', (e) => {
            this.viewport.isDragging = true;
            this.viewport.isRotating = e.shiftKey;
            this.viewport.lastX = e.clientX; this.viewport.lastY = e.clientY;
            c.setPointerCapture(e.pointerId);
            c.style.cursor = this.viewport.isRotating ? 'ew-resize' : 'grabbing';
        });

        c.addEventListener('pointermove', (e) => {
            const rect = c.getBoundingClientRect();
            const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
            if (this.ds && this.ds.isDone) {
                const world = this.viewport.screenToWorld(mx, my, c.width, c.height);
                this.coordX.textContent = Math.round(world.x); this.coordY.textContent = Math.round(world.y);
                this.coordEl.classList.add('is-visible');
            }
            if (!this.viewport.isDragging) return;
            const dx = e.clientX - this.viewport.lastX; const dy = e.clientY - this.viewport.lastY;
            this.viewport.lastX = e.clientX; this.viewport.lastY = e.clientY;
            if (this.viewport.isRotating) this.viewport.rotate(dx * 0.005);
            else this.viewport.pan(dx, dy);
            this._updateViewportReadouts();
        });

        const end = () => {
            this.viewport.isDragging = false; this.viewport.isRotating = false;
            c.style.cursor = 'grab'; this.coordEl.classList.remove('is-visible');
        };
        c.addEventListener('pointerup', end);
        c.addEventListener('pointercancel', end);
        c.addEventListener('pointerleave', end);
    }

    _bindNavButtons() {
        document.getElementById('btnResetView').addEventListener('click', () => { this.viewport.reset(); this._updateViewportReadouts(); });
        document.getElementById('btnZoomIn').addEventListener('click', () => { const r = this.canvasEl.getBoundingClientRect(); this.viewport.zoom(CONFIG.ZOOM_STEP, r.width / 2, r.height / 2); this._updateViewportReadouts(); });
        document.getElementById('btnZoomOut').addEventListener('click', () => { const r = this.canvasEl.getBoundingClientRect(); this.viewport.zoom(-CONFIG.ZOOM_STEP, r.width / 2, r.height / 2); this._updateViewportReadouts(); });
        document.getElementById('btnRotateLeft').addEventListener('click', () => { this.viewport.rotate(-0.2); this._updateViewportReadouts(); });
        document.getElementById('btnRotateRight').addEventListener('click', () => { this.viewport.rotate(0.2); this._updateViewportReadouts(); });
    }

    _updateViewportReadouts() { this.ui.updateReadouts(this.viewport.getState()); }

    _renderFrame() {
        const frame = () => {
            if (this.ds && this.ds.isDone && !this.isGenerating) {
                this.canvasManager.renderWithViewport(this.viewport);
            }
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }
}
