const { React, SettingField, ReactTools } = require('../utils/modules').ModuleStore;

// Copyright 2018 Zachary Rauen

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
class CloseButton extends React.Component {
    render() {
        const size = this.props.size || '14px';
        return React.createElement(
            'svg',
            {
                className: this.props.className || '',
                fill: 'currentColor',
                viewBox: '0 0 24 24',
                style: { width: size, height: size },
                onClick: this.props.onClick,
            },
            React.createElement('path', {
                d: 'M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z',
            })
        );
    }
}

class DownArrow extends React.Component {
    render() {
        const size = this.props.size || '16px';
        return React.createElement(
            'svg',
            {
                className: this.props.className || '',
                fill: 'currentColor',
                viewBox: '0 0 24 24',
                style: { width: size, height: size },
                onClick: this.props.onClick,
            },
            React.createElement('path', {
                d: 'M8.12 9.29L12 13.17l3.88-3.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0L6.7 10.7c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z',
            })
        );
    }
}

class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false, value: this.props.value };
        this.dropdown = React.createRef();
        this.onChange = this.onChange.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.clear = this.clear.bind(this);
    }

    showMenu(event) {
        event.preventDefault();
        event.stopPropagation();

        this.setState(
            (state) => ({ open: !state.open }),
            () => {
                if (!this.state.open) return;

                document.addEventListener('click', this.hideMenu);
            }
        );
    }

    hideMenu() {
        this.setState({ open: false }, () => {
            document.removeEventListener('click', this.hideMenu);
        });
    }

    onChange(value) {
        this.setState({ value });
        if (this.props.onChange) this.props.onChange(value);
    }

    get selected() {
        return this.props.options.find((o) => o.value == this.state.value);
    }

    get options() {
        const selected = this.selected;
        return React.createElement(
            'div',
            { className: 'z-select-options' },
            this.props.options.map((opt) =>
                React.createElement(
                    'div',
                    {
                        className: `z-select-option${selected?.value == opt.value ? ' selected' : ''}`,
                        onClick: this.onChange.bind(this, opt.value),
                    },
                    opt.label
                )
            )
        );
    }

    clear(event) {
        event.stopPropagation();
        this.onChange(null);
    }

    render() {
        const style = this.props.style == 'transparent' ? ' z-select-transparent' : '';
        const isOpen = this.state.open ? ' menu-open' : '';
        return React.createElement('div', { className: `z-select${style}${isOpen}`, ref: this.dropdown, onClick: this.showMenu }, [
            React.createElement('div', { className: 'z-select-value' }, this?.selected?.label ?? this.props.placeholder),
            React.createElement(
                'div',
                { className: 'z-select-icons' },
                this.props.clearable &&
                    this.selected &&
                    React.createElement(CloseButton, { className: 'z-select-clear', onClick: this.clear }),
                React.createElement(DownArrow, { className: 'z-select-arrow' })
            ),
            this.state.open && this.options,
        ]);
    }
}

class Dropdown extends SettingField {
    constructor(name, note, defaultValue, values, onChange, options = {}) {
        const { clearable = false, disabled = false, placeholder = '' } = options;
        super(name, note, onChange, Select, {
            placeholder: placeholder,
            clearable: clearable,
            disabled: disabled,
            options: values,
            onChange: (dropdown) => (value) => {
                dropdown.props.value = value;
                dropdown.forceUpdate();
                this.onChange(value);
            },
            value: defaultValue,
        });
        this.dropdown = null;
    }

    onAdded() {
        super.onAdded();
        this.dropdown = ReactTools.getOwnerInstance(this.getElement());
    }

    updateOptions(newOptions) {
        if (this.dropdown && this.dropdown.props) {
            // Update the options in the Dropdown component
            this.dropdown.props.options = newOptions;

            // Always select the first option in the new options
            const newValue = newOptions.length > 0 ? newOptions[0].value : null;
            this.dropdown.props.value = newValue;

            // Force an update of the entire Dropdown component
            this.dropdown.forceUpdate();

            // Call onChange with the new value
            this.onChange(newValue);
        }
    }

    setValue(value) {
        if (this.dropdown && this.dropdown.props) {
            this.dropdown.props.value = value;
            this.dropdown.forceUpdate();
            this.onChange(value);
        }
    }

    getValue() {
        return this.dropdown && this.dropdown.props ? this.dropdown.props.value : null;
    }
}
module.exports = Dropdown;
