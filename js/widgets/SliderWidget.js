export class SliderWidget {
  /**
   * @param {string} containerId - ID del elemento DOM donde montar el widget
   * @param {object} options
   * @param {string} options.label - Texto descriptivo
   * @param {number} options.min
   * @param {number} options.max
   * @param {number} options.step
   * @param {number} options.value - Valor inicial
   * @param {boolean} [options.realtime=false] - Si true, onChange se dispara en 'input'; si false, solo en 'change'
   * @param {function} [options.onChange] - Callback al confirmar el valor (soltar slider o input en tiempo real)
   * @param {function} [options.onInput] - Callback en cada tick del slider (solo actualizacion visual)
   */
  constructor(containerId, options) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`SliderWidget: No se encontro el contenedor #${containerId}`);
    }

    this.label = options.label;
    this.min = options.min;
    this.max = options.max;
    this.step = options.step || 1;
    this.value = options.value ?? options.min;
    this.realtime = options.realtime ?? false;
    this.onChange = options.onChange || (() => {});
    this.onInput = options.onInput || (() => {});

    this._build();
  }

  _build() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'widget';

    this.labelRow = document.createElement('div');
    this.labelRow.className = 'widget-label';

    this.labelText = document.createElement('span');
    this.labelText.textContent = this.label;

    this.valueText = document.createElement('span');
    this.valueText.textContent = this._formatValue(this.value);

    this.labelRow.appendChild(this.labelText);
    this.labelRow.appendChild(this.valueText);

    this.input = document.createElement('input');
    this.input.type = 'range';
    this.input.min = this.min;
    this.input.max = this.max;
    this.input.step = this.step;
    this.input.value = this.value;

    this.wrapper.appendChild(this.labelRow);
    this.wrapper.appendChild(this.input);
    this.container.appendChild(this.wrapper);

    this._bindEvents();
  }

  _bindEvents() {
    this.input.addEventListener('input', (e) => {
      this.value = parseFloat(e.target.value);
      this.valueText.textContent = this._formatValue(this.value);
      this.onInput(this.value);

      if (this.realtime) {
        this.onChange(this.value);
      }
    });

    if (!this.realtime) {
      this.input.addEventListener('change', (e) => {
        this.value = parseFloat(e.target.value);
        this.onChange(this.value);
      });
    }
  }

  _formatValue(v) {
    return Number.isInteger(v) ? v.toString() : v.toFixed(2);
  }

  setValue(value) {
    this.value = value;
    this.input.value = value;
    this.valueText.textContent = this._formatValue(value);
  }

  setVisible(visible) {
    this.wrapper.style.display = visible ? 'block' : 'none';
  }
}
