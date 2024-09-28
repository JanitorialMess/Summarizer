const { SettingField, TextArea } = require('../utils/modules').ModuleStore;

class TextAreaField extends SettingField {
    constructor(name, note, value, onChange, options) {
        const { placeholder = '', disabled = false } = options;
        super(name, note, onChange, TextArea, {
            onChange: (textarea) => (val) => {
                textarea.props.value = val;
                textarea.forceUpdate();
                this.onChange(val);
            },
            value: value,
            disabled: disabled,
            autosize: true,
            placeholder: placeholder || '',
        });
    }
}

module.exports = TextAreaField;
