// Viewport.js — máquina de estado para pan, zoom y rotación sobre el canvas

import { CONFIG } from '../config.js';

export class Viewport {
    constructor() {
        this.panX = 0; this.panY = 0; this.scale = 1.0; this.rotation = 0;
        this.isDragging = false; this.lastX = 0; this.lastY = 0; this.isRotating = false;
    }

    zoom(delta, centerX, centerY) {
        const newScale = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, this.scale + delta));
        const factor = newScale / this.scale;
        this.panX = centerX - (centerX - this.panX) * factor;
        this.panY = centerY - (centerY - this.panY) * factor;
        this.scale = newScale;
    }

    pan(dx, dy) { this.panX += dx; this.panY += dy; }
    rotate(angleDelta) { this.rotation += angleDelta; }

    reset() { this.panX = 0; this.panY = 0; this.scale = 1.0; this.rotation = 0; }

    screenToWorld(sx, sy, canvasWidth, canvasHeight) {
        const cx = canvasWidth / 2; const cy = canvasHeight / 2;
        return {
            x: (sx - cx - this.panX) / this.scale + cx,
            y: (sy - cy - this.panY) / this.scale + cy,
        };
    }

    getState() {
        return {
            panX: Math.round(this.panX), panY: Math.round(this.panY),
            scale: parseFloat(this.scale.toFixed(2)),
            rotationDeg: Math.round((this.rotation * 180) / Math.PI),
        };
    }
}
