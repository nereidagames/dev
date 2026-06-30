/**
 * UI Components Library - Base components ported from ActionScript BSP
 * Provides reusable UI components styled to match original game
 */

export class UIButton {
    constructor(options = {}) {
        this.element = document.createElement('button');
        this.element.className = `bsp-btn ${options.className || 'btn-blue'}`;
        this.element.textContent = options.text || 'Button';
        this.element.style.width = options.width || 'auto';
        this.element.style.height = options.height || 'auto';
        this.element.style.minWidth = options.minWidth || '100px';
        this.element.style.minHeight = options.minHeight || '40px';
        
        if (options.onClick) {
            this.element.addEventListener('click', options.onClick);
        }
        
        this.disabled = false;
    }
    
    setEnabled(enabled) {
        this.element.disabled = !enabled;
        this.element.style.opacity = enabled ? '1' : '0.5';
        this.disabled = !enabled;
    }
    
    setText(text) {
        this.element.textContent = text;
    }
    
    getElement() {
        return this.element;
    }
    
    addEventListener(event, handler) {
        this.element.addEventListener(event, handler);
    }
}

export class UIPanel {
    constructor(options = {}) {
        this.element = document.createElement('div');
        this.element.className = `bsp-panel ${options.className || ''}`;
        this.element.style.width = options.width || 'auto';
        this.element.style.height = options.height || 'auto';
        this.element.style.padding = options.padding || '20px';
        this.element.style.borderRadius = options.borderRadius || '15px';
        this.element.style.border = options.border || '3px solid white';
        this.element.style.backgroundColor = options.backgroundColor || '#3498db';
        this.element.style.boxShadow = options.boxShadow || '0 8px 16px rgba(0,0,0,0.4)';
        this.element.style.zIndex = options.zIndex || '100';
        
        if (options.hidden) {
            this.element.style.display = 'none';
        }
    }
    
    addChild(element) {
        if (element instanceof UIButton || element instanceof UIPanel || element instanceof UIInputField) {
            this.element.appendChild(element.getElement());
        } else if (element instanceof HTMLElement) {
            this.element.appendChild(element);
        }
    }
    
    show() {
        this.element.style.display = 'block';
    }
    
    hide() {
        this.element.style.display = 'none';
    }
    
    getElement() {
        return this.element;
    }
}

export class UIInputField {
    constructor(options = {}) {
        this.element = document.createElement('input');
        this.element.className = `bsp-input ${options.className || ''}`;
        this.element.type = options.type || 'text';
        this.element.placeholder = options.placeholder || '';
        this.element.value = options.value || '';
        this.element.style.width = options.width || '100%';
        this.element.style.height = options.height || '45px';
        this.element.style.padding = options.padding || '0 15px';
        this.element.style.borderRadius = options.borderRadius || '10px';
        this.element.style.border = options.border || 'none';
        this.element.style.fontSize = options.fontSize || '16px';
        this.element.style.fontFamily = options.fontFamily || "'Titan One', cursive";
        this.element.style.backgroundColor = options.backgroundColor || '#f5f5f5';
        this.element.style.boxShadow = options.boxShadow || 'inset 0 3px 5px rgba(0,0,0,0.2)';
        
        if (options.required) {
            this.element.required = true;
        }
        if (options.minLength) {
            this.element.minLength = options.minLength;
        }
        if (options.maxLength) {
            this.element.maxLength = options.maxLength;
        }
    }
    
    getValue() {
        return this.element.value;
    }
    
    setValue(value) {
        this.element.value = value;
    }
    
    getElement() {
        return this.element;
    }
    
    addEventListener(event, handler) {
        this.element.addEventListener(event, handler);
    }
    
    focus() {
        this.element.focus();
    }
    
    setError(message) {
        this.element.style.borderColor = '#e74c3c';
        this.element.title = message;
    }
    
    clearError() {
        this.element.style.borderColor = 'transparent';
        this.element.title = '';
    }
}

export class UICheckbox {
    constructor(options = {}) {
        this.container = document.createElement('div');
        this.container.className = 'bsp-checkbox-row';
        this.container.style.display = 'flex';
        this.container.style.alignItems = 'center';
        this.container.style.gap = '10px';
        
        this.input = document.createElement('input');
        this.input.type = 'checkbox';
        this.input.className = 'bsp-checkbox';
        this.input.style.width = '20px';
        this.input.style.height = '20px';
        this.input.style.cursor = 'pointer';
        if (options.checked) {
            this.input.checked = true;
        }
        
        this.label = document.createElement('label');
        this.label.textContent = options.label || '';
        this.label.style.color = options.color || 'white';
        this.label.style.textShadow = options.textShadow || '1px 1px 0 #000';
        this.label.style.fontSize = options.fontSize || '14px';
        this.label.style.cursor = 'pointer';
        this.label.htmlFor = options.id || '';
        
        this.container.appendChild(this.input);
        this.container.appendChild(this.label);
    }
    
    isChecked() {
        return this.input.checked;
    }
    
    setChecked(checked) {
        this.input.checked = checked;
    }
    
    getElement() {
        return this.container;
    }
    
    addEventListener(event, handler) {
        this.input.addEventListener(event, handler);
    }
}

export class UIDropdown {
    constructor(options = {}) {
        this.container = document.createElement('div');
        this.container.style.display = 'inline-block';
        this.container.style.position = 'relative';
        
        this.select = document.createElement('select');
        this.select.className = `bsp-dropdown ${options.className || ''}`;
        this.select.style.width = options.width || '150px';
        this.select.style.height = options.height || '45px';
        this.select.style.padding = options.padding || '0 15px';
        this.select.style.borderRadius = options.borderRadius || '10px';
        this.select.style.border = options.border || '2px solid white';
        this.select.style.fontSize = options.fontSize || '14px';
        this.select.style.fontFamily = options.fontFamily || "'Titan One', cursive";
        this.select.style.backgroundColor = options.backgroundColor || '#3498db';
        this.select.style.color = options.color || 'white';
        
        if (options.options && Array.isArray(options.options)) {
            options.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value || opt;
                option.textContent = opt.text || opt;
                this.select.appendChild(option);
            });
        }
        
        this.container.appendChild(this.select);
    }
    
    getValue() {
        return this.select.value;
    }
    
    setValue(value) {
        this.select.value = value;
    }
    
    getElement() {
        return this.container;
    }
    
    addEventListener(event, handler) {
        this.select.addEventListener(event, handler);
    }
}

export class UIProgressBar {
    constructor(options = {}) {
        this.container = document.createElement('div');
        this.container.className = 'bsp-progress-container';
        this.container.style.width = options.width || '100%';
        this.container.style.height = options.height || '25px';
        this.container.style.backgroundColor = options.backgroundColor || '#2c3e50';
        this.container.style.border = options.border || '2px solid white';
        this.container.style.borderRadius = options.borderRadius || '10px';
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'relative';
        
        this.bar = document.createElement('div');
        this.bar.className = 'bsp-progress-bar';
        this.bar.style.height = '100%';
        this.bar.style.width = '0%';
        this.bar.style.backgroundColor = options.barColor || '#2ecc71';
        this.bar.style.transition = options.transition || 'width 0.3s ease';
        
        this.label = document.createElement('div');
        this.label.className = 'bsp-progress-label';
        this.label.style.position = 'absolute';
        this.label.style.top = '50%';
        this.label.style.left = '50%';
        this.label.style.transform = 'translate(-50%, -50%)';
        this.label.style.color = 'white';
        this.label.style.textShadow = '1px 1px 0 #000';
        this.label.style.fontSize = options.fontSize || '12px';
        this.label.style.fontWeight = 'bold';
        this.label.textContent = '0%';
        
        this.container.appendChild(this.bar);
        this.container.appendChild(this.label);
    }
    
    setValue(value) {
        const percent = Math.max(0, Math.min(100, value));
        this.bar.style.width = percent + '%';
        this.label.textContent = Math.round(percent) + '%';
    }
    
    getElement() {
        return this.container;
    }
}

export class UIForm {
    constructor(options = {}) {
        this.element = document.createElement('form');
        this.element.className = `bsp-form ${options.className || ''}`;
        this.element.style.display = 'flex';
        this.element.style.flexDirection = 'column';
        this.element.style.gap = options.gap || '10px';
        
        this.fields = {};
    }
    
    addField(name, field) {
        this.fields[name] = field;
        this.element.appendChild(field.getElement());
    }
    
    getFieldValue(name) {
        return this.fields[name]?.getValue?.() || null;
    }
    
    setFieldValue(name, value) {
        if (this.fields[name]?.setValue) {
            this.fields[name].setValue(value);
        }
    }
    
    getValues() {
        const values = {};
        Object.keys(this.fields).forEach(name => {
            if (typeof this.fields[name].getValue === 'function') {
                values[name] = this.fields[name].getValue();
            } else if (this.fields[name].isChecked) {
                values[name] = this.fields[name].isChecked();
            }
        });
        return values;
    }
    
    clear() {
        Object.values(this.fields).forEach(field => {
            if (field.setValue) {
                field.setValue('');
            } else if (field.setChecked) {
                field.setChecked(false);
            }
        });
    }
    
    getElement() {
        return this.element;
    }
    
    addEventListener(event, handler) {
        this.element.addEventListener(event, handler);
    }
}

export class UINotification {
    constructor(options = {}) {
        this.element = document.createElement('div');
        this.element.className = `bsp-notification ${options.type || 'info'}`;
        this.element.style.position = 'fixed';
        this.element.style.left = options.left || 'auto';
        this.element.style.right = options.right || '20px';
        this.element.style.top = options.top || 'auto';
        this.element.style.bottom = options.bottom || '20px';
        this.element.style.width = options.width || '300px';
        this.element.style.padding = options.padding || '15px';
        this.element.style.backgroundColor = options.backgroundColor || '#3498db';
        this.element.style.border = options.border || '2px solid white';
        this.element.style.borderRadius = options.borderRadius || '10px';
        this.element.style.color = options.color || 'white';
        this.element.style.fontSize = options.fontSize || '14px';
        this.element.style.textShadow = options.textShadow || '1px 1px 0 #000';
        this.element.style.zIndex = options.zIndex || '99999';
        this.element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        
        this.element.textContent = options.message || '';
        
        if (options.autoClose) {
            setTimeout(() => this.remove(), options.autoClose);
        }
    }
    
    show() {
        document.body.appendChild(this.element);
    }
    
    remove() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
    
    getElement() {
        return this.element;
    }
}

// Global styles for all components
export function initializeComponentStyles() {
    if (document.getElementById('bsp-components-style')) {
        return; // Already initialized
    }
    
    const style = document.createElement('style');
    style.id = 'bsp-components-style';
    style.textContent = `
        /* Base Button Styles */
        .bsp-btn {
            border: 3px solid white;
            border-radius: 10px;
            font-family: 'Titan One', cursive;
            font-size: 16px;
            color: white;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 0 rgba(0,0,0,0.4);
            transition: all 0.1s;
            text-shadow: 1px 1px 0 #000;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .bsp-btn:active {
            transform: translateY(3px);
            box-shadow: 0 1px 0 rgba(0,0,0,0.2);
        }
        
        .bsp-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .btn-blue {
            background: linear-gradient(to bottom, #4facfe 0%, #0072ff 100%);
        }
        
        .btn-green {
            background: linear-gradient(to bottom, #2ecc71 0%, #27ae60 100%);
            box-shadow: 0 4px 0 #1e8449;
        }
        
        .btn-red {
            background: linear-gradient(to bottom, #e74c3c 0%, #c0392b 100%);
            box-shadow: 0 4px 0 #a93226;
        }
        
        .btn-orange {
            background: linear-gradient(to bottom, #f39c12 0%, #d35400 100%);
            box-shadow: 0 4px 0 #a04000;
        }
        
        .btn-big {
            min-width: 180px;
            min-height: 80px;
            font-size: 18px;
        }
        
        /* Input Styles */
        .bsp-input {
            border-radius: 10px;
            border: 2px solid transparent;
            padding: 0 15px;
            font-family: 'Titan One', cursive;
            font-size: 16px;
            background-color: #ffffff;
            box-shadow: inset 0 3px 5px rgba(0,0,0,0.2);
            transition: all 0.2s;
        }
        
        .bsp-input:focus {
            outline: none;
            border-color: #4facfe;
            box-shadow: inset 0 3px 5px rgba(0,0,0,0.2), 0 0 8px rgba(79, 172, 254, 0.5);
        }
        
        .bsp-input::placeholder {
            color: #95a5a6;
        }
        
        /* Panel Styles */
        .bsp-panel {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        /* Form Styles */
        .bsp-form {
            width: 100%;
        }
        
        /* Checkbox Styles */
        .bsp-checkbox {
            cursor: pointer;
        }
        
        /* Dropdown Styles */
        .bsp-dropdown {
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 10px center;
            background-size: 20px;
            padding-right: 40px;
        }
        
        /* Progress Bar */
        .bsp-progress-container {
            display: flex;
            align-items: center;
        }
    `;
    document.head.appendChild(style);
}
