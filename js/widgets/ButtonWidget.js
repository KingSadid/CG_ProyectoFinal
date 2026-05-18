export class ButtonWidget {
  /**
   * @param {string} containerId - ID del elemento DOM donde montar el widget
   * @param {object} options
   * @param {string} options.label - Texto del boton
   * @param {string} [options.type='action'] - 'action' | 'toggle'
   * @param {string} [options.activeLabel] - Texto alternativo cuando esta activo (solo toggle)
   * @param {function} [options.onClick] - Callback al hacer click
   */
  constructor(containerId, options) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`ButtonWidget: No se encontro el contenedor #${containerId}`);
    }

    this.label = options.label;
    this.type = options.type || 'action';
    this.activeLabel = options.activeLabel || this.label;
    this.onClick = options.onClick || (() => {});
    this.active = false;

    this._build();
  }

  _build() {
    this.btn = document.createElement('button');
    this.btn.className = 'btn';
    this.btn.textContent = this.label;
    this.container.appendChild(this.btn);

    this.btn.addEventListener('click', () => {
      if (this.type === 'toggle') {
        this.active = !this.active;
        this._updateState();
        this.onClick(this.active);
      } else {
        this.onClick();
      }
    });
  }

  _updateState() {
    this.btn.classList.toggle('active', this.active);
    this.btn.textContent = this.active ? this.activeLabel : this.label;
  }

  setActive(active) {
    if (this.type !== 'toggle') return;
    this.active = active;
    this._updateState();
  }
}
