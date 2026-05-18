// CanvasManager.js — gestión del canvas principal y buffer offscreen
// el canvas DOM se redimensiona al tamaño del contenedor, pero el offscreen
// siempre conserva 257x257 (la grilla del fractal) para no perder precisión.

export class CanvasManager {
    constructor(canvasId, logicWidth, logicHeight) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error(`Canvas #${canvasId} no encontrado`);

        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.offscreen = document.createElement('canvas');
        this.offCtx = this.offscreen.getContext('2d', { willReadFrequently: true });

        // tamaño lógico del mapa (nunca cambia)
        this.logicW = logicWidth;
        this.logicH = logicHeight;
        this.offscreen.width = logicWidth;
        this.offscreen.height = logicHeight;

        // tamaño visual del canvas se ajusta al contenedor via CSS/JS
        this._fitToContainer();
        this._observer = new ResizeObserver(() => this._fitToContainer());
        this._observer.observe(this.canvas.parentElement);
    }

    // ajusta el canvas DOM al 100% del contenedor sin perder la relación de aspecto
    _fitToContainer() {
        const parent = this.canvas.parentElement;
        if (!parent) return;
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.offCtx.clearRect(0, 0, this.logicW, this.logicH);
    }

    putOffscreenData(imageData) { this.offCtx.putImageData(imageData, 0, 0); }
    getOffscreenData() { return this.offCtx.getImageData(0, 0, this.logicW, this.logicH); }

    // dibuja el offscreen 257x257 escalado al canvas DOM de pantalla completa
    renderWithViewport(viewport) {
        const { ctx, canvas, logicW, logicH, offscreen } = this;
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // calculamos la escala visual para que el mapa llene el canvas sin deformarse
        const scaleX = canvas.width / logicW;
        const scaleY = canvas.height / logicH;
        const baseScale = Math.min(scaleX, scaleY);

        ctx.setTransform(
            baseScale * viewport.scale, 0, 0, baseScale * viewport.scale,
            cx + viewport.panX,
            cy + viewport.panY
        );
        ctx.translate(-logicW / 2, -logicH / 2);
        ctx.rotate(viewport.rotation);
        ctx.translate(logicW / 2, logicH / 2);
        ctx.drawImage(offscreen, -logicW / 2, -logicH / 2, logicW, logicH);
        ctx.restore();
    }

    // modo directo sin viewport (usado durante animación de generación)
    renderDirect() {
        const { ctx, canvas, logicW, logicH } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaleX = canvas.width / logicW;
        const scaleY = canvas.height / logicH;
        const s = Math.min(scaleX, scaleY);
        const dx = (canvas.width - logicW * s) / 2;
        const dy = (canvas.height - logicH * s) / 2;

        ctx.drawImage(this.offscreen, dx, dy, logicW * s, logicH * s);
    }

    toBlob(mimeType, quality) {
        return new Promise((resolve) => {
            this.offscreen.toBlob((blob) => resolve(blob), mimeType, quality);
        });
    }
}
