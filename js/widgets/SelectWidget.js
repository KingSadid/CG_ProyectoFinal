// Widget desplegable para seleccionar opciones entre un listado.
export class SelectWidget {
  constructor(containerId, options) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`SelectWidget: No se encontro el contenedor #${containerId}`);
    }

    this.label = options.label;
    this.options = options.options;
    this.value = options.value;
    this.onChange = options.onChange || (() => {});

    this._build();
  }

  _build() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'widget';

    if (this.label) {
      const labelRow = document.createElement('div');
      labelRow.className = 'widget-label';
      const span = document.createElement('span');
      span.textContent = this.label;
      labelRow.appendChild(span);
      this.wrapper.appendChild(labelRow);
    }

    this.select = document.createElement('select');
    this.select.className = 'btn select-widget';
    this.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === this.value) option.selected = true;
      this.select.appendChild(option);
    });

    this.select.addEventListener('change', (e) => {
      this.value = e.target.value;
      this.onChange(this.value);
    });

    this.wrapper.appendChild(this.select);
    this.container.appendChild(this.wrapper);
  }

  setValue(value) {
    this.value = value;
    this.select.value = value;
  }

  setVisible(visible) {
    this.wrapper.style.display = visible ? 'block' : 'none';
  }
}
