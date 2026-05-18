// ColorUtils.js — conversiones y operaciones de color

export class ColorUtils {
    static hexToRgb(hex) {
        const c = parseInt(hex.replace('#', ''), 16);
        return { r: (c >> 16) & 255, g: (c >> 8) & 255, b: c & 255 };
    }

    static rgbToHex({ r, g, b }) {
        const h = (c) => { const s = Math.max(0, Math.min(255, Math.round(c))).toString(16); return s.length === 1 ? '0' + s : s; };
        return `#${h(r)}${h(g)}${h(b)}`;
    }

    static lerpRgb(a, b, t) {
        const c = Math.max(0, Math.min(1, t));
        return { r: a.r + (b.r - a.r) * c, g: a.g + (b.g - a.g) * c, b: a.b + (b.b - a.b) * c };
    }

    static applyBrightness(channel, brightness) { return channel + brightness; }
    static applyContrast(channel, factor) { return factor * (channel - 128) + 128; }
    static clampByte(v) { return Math.max(0, Math.min(255, Math.round(v))); }
}
