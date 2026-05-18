// PanelAnimator.js — transiciones de entrada para paneles

export class PanelAnimator {
    constructor() {
        this.leftPanel = document.getElementById('panelLeft');
        this.rightPanel = document.getElementById('panelRight');
        this.isMobile = window.innerWidth < 900;
        window.addEventListener('resize', () => { this.isMobile = window.innerWidth < 900; });
    }

    reveal(element, delayMs = 0) {
        element.style.opacity = '0'; element.style.transform = 'translateY(8px)';
        element.style.transition = `opacity 0.35s cubic-bezier(0.23,1,0.32,1) ${delayMs}ms, transform 0.35s cubic-bezier(0.23,1,0.32,1) ${delayMs}ms`;
        requestAnimationFrame(() => { element.style.opacity = '1'; element.style.transform = 'translateY(0)'; });
    }
}
