// Componente generico de input tipo range con label y valor numerico.
export class SliderWidget {
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
