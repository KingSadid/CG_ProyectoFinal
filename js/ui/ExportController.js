// ExportController.js — descarga del mapa con formato dinámico

export class ExportController {
    constructor(canvasManager) { this.canvasManager = canvasManager; }

    async download(mimeType, quality, filename = 'aethermap') {
        const blob = await this.canvasManager.toBlob(mimeType, quality);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const ext = mimeType.replace('image/', '').replace('jpeg', 'jpg');
        const a = document.createElement('a');
        a.href = url; a.download = `${filename}_${Date.now()}.${ext}`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
}
