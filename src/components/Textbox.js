const { Textbox: OgTextbox } = require('../utils/modules').ModuleStore;

class Textbox extends OgTextbox {
    constructor(name, note, defaultValue, onChange, options = {}) {
        super(name, note, defaultValue, onChange, options);
        this.inputElement = null;
    }

    getElement() {
        const element = super.getElement();
        this.inputElement = element.querySelector('input');
        return element;
    }

    updateValue(newApiKey) {
        this.onChange(newApiKey);
    }

    onChange(value) {
        if (this.inputElement) {
            this.inputElement.value = value;
        }
        super.onChange(value);
    }
}

module.exports = Textbox;
