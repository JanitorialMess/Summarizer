const {
    /* Library */
    DOMTools,
    Toasts: OriginalToasts,
} = require('./modules').ModuleStore;

/**
 * @class Toasts
 * @extends OriginalToasts
 * @description Manages the creation, updating, and removal of toast notifications.
 */
export default class Toasts extends OriginalToasts {
    static #toasts = new Map();
    static #timeouts = new Map();
    static #container = null;

    /**
     * @static
     * @async
     * @function show
     * @description Shows a new toast or updates an existing one.
     * @param {string|null} key - Unique identifier for the toast. If null, creates a new toast without tracking.
     * @param {string} content - The content to display in the toast.
     * @param {Object} [options={}] - Configuration options for the toast.
     * @param {string} [options.type=''] - The type of toast (e.g., 'success', 'error').
     * @param {string} [options.icon=''] - Icon to display with the toast.
     * @param {number} [options.timeout=3000] - Duration in milliseconds before the toast auto-hides.
     * @param {boolean} [options.expires=true] - Whether the toast should auto-hide.
     * @param {number} [options.minDisplayTime=2000] - Minimum time in milliseconds the toast should be displayed.
     * @returns {Promise<void>}
     */
    static async show(key = null, content, options = {}) {
        const { type = '', icon = '', timeout = 3000, expires = true, minDisplayTime = 2000 } = options;
        this.ensureContainer();

        if (key && this.#toasts.has(key)) {
            this.updateToast(key, content, options);
        } else {
            const toast = new Toast(key, content, { type, icon, timeout, expires, minDisplayTime }, this);
            if (key) {
                this.#toasts.set(key, toast);
            }
            this.#container.appendChild(toast.element);
            toast.show();
        }
    }

    /**
     * @static
     * @function updateToast
     * @description Updates an existing toast.
     * @param {string} key - The unique identifier of the toast to update.
     * @param {string} content - The new content for the toast.
     * @param {Object} [options={}] - New configuration options for the toast.
     */
    static updateToast(key, content, options = {}) {
        const toast = this.#toasts.get(key);
        if (toast) {
            toast.update(content, options);
        }
    }

    /**
     * @static
     * @function hideToast
     * @description Hides a specific toast.
     * @param {string} key - The unique identifier of the toast to hide.
     */
    static hideToast(key) {
        const toast = this.#toasts.get(key);
        if (toast) {
            toast.hide();
        }
    }

    /**
     * @static
     * @function ensureContainer
     * @description Ensures that the toast container exists in the DOM.
     * @private
     */
    static ensureContainer() {
        if (this.#container) return;

        super.ensureContainer();
        this.#container = document.querySelector('.toasts');
    }

    /**
     * @static
     * @function removeToast
     * @description Removes a toast from the internal tracking and potentially removes the container.
     * @param {string} key - The unique identifier of the toast to remove.
     * @private
     */
    static removeToast(key) {
        this.#toasts.delete(key);
        this.clearExpirationTimeout(key);
        if (this.#container && this.#toasts.size === 0) {
            this.#container.remove();
            this.#container = null;
        }
    }

    /**
     * @static
     * @function removeToast
     * @description Removes a toast from the internal tracking and potentially removes the container.
     * @param {string} key - The unique identifier of the toast to remove.
     * @private
     */
    static setExpirationTimeout(key, duration) {
        this.clearExpirationTimeout(key);
        const timeout = setTimeout(() => this.hideToast(key), duration);
        this.#timeouts.set(key, timeout);
    }

    /**
     * @static
     * @function clearExpirationTimeout
     * @description Clears the expiration timeout for a specific toast.
     * @param {string} key - The unique identifier of the toast.
     * @private
     */
    static clearExpirationTimeout(key) {
        if (this.#timeouts.has(key)) {
            clearTimeout(this.#timeouts.get(key));
            this.#timeouts.delete(key);
        }
    }
}

/**
 * @class Toast
 * @description Represents an individual toast notification.
 * @private
 */
class Toast {
    #key;
    #element;
    #options;
    #toastsManager;
    #displayStartTime;

    /**
     * @constructor
     * @param {string|null} key - Unique identifier for the toast.
     * @param {string} content - The content to display in the toast.
     * @param {Object} options - Configuration options for the toast.
     * @param {Toasts} toastsManager - Reference to the Toasts class for management operations.
     */
    constructor(key, content, options, toastsManager) {
        this.#key = key;
        this.#options = options;
        this.#toastsManager = toastsManager;
        this.#displayStartTime = Date.now();
        this.#element = this.#createToastElement(content);
    }

    /**
     * @getter
     * @returns {HTMLElement} The DOM element of the toast.
     */
    get element() {
        return this.#element;
    }

    /**
     * @function show
     * @description Displays the toast and sets up expiration if applicable.
     */
    show() {
        if (this.#options.expires) {
            this.#toastsManager.setExpirationTimeout(this.#key, Math.max(this.#options.timeout, this.#options.minDisplayTime));
        }
    }

    /**
     * @function update
     * @description Updates the content and options of the toast.
     * @param {string} content - The new content for the toast.
     * @param {Object} options - New configuration options for the toast.
     */
    update(content, options) {
        this.#options = { ...this.#options, ...options };
        const newToastContent = Toasts.buildToast(content, Toasts.parseType(this.#options.type), this.#options.icon);
        const newToast = DOMTools.parseHTML(newToastContent);
        newToast.style.pointerEvents = 'auto';
        newToast.style.cursor = 'pointer';

        const updateToastContent = () => {
            if (this.#element.parentNode) {
                this.#element.parentNode.replaceChild(newToast, this.#element);
                this.#element = newToast;
                this.#addClickListener();

                if (this.#options.expires) {
                    this.#toastsManager.setExpirationTimeout(this.#key, this.#options.timeout);
                } else {
                    this.#toastsManager.clearExpirationTimeout(this.#key);
                }
            }
        };

        const elapsedTime = Date.now() - this.#displayStartTime;
        if (elapsedTime < this.#options.minDisplayTime) {
            setTimeout(updateToastContent, this.#options.minDisplayTime - elapsedTime);
        } else {
            updateToastContent();
        }

        this.#displayStartTime = Date.now();
    }

    /**
     * @function hide
     * @description Initiates the process of hiding and removing the toast.
     */
    hide() {
        this.#toastsManager.clearExpirationTimeout(this.#key);

        const elapsedTime = Date.now() - this.#displayStartTime;
        const remainingTime = Math.max(this.#options.minDisplayTime - elapsedTime, 0);

        setTimeout(async () => {
            this.#element.classList.add('closing');

            await new Promise((resolve) => {
                this.#element.addEventListener('animationend', resolve, { once: true });
            });

            this.#element.remove();
            this.#toastsManager.removeToast(this.#key);
        }, remainingTime);
    }

    /**
     * @function createToastElement
     * @description Creates the DOM element for the toast.
     * @param {string} content - The content to display in the toast.
     * @returns {HTMLElement} The created toast element.
     * @private
     */
    #createToastElement(content) {
        const toast = DOMTools.parseHTML(Toasts.buildToast(content, Toasts.parseType(this.#options.type), this.#options.icon));
        toast.style.pointerEvents = 'auto';
        toast.style.cursor = 'pointer';
        this.#addClickListener(toast);
        return toast;
    }

    /**
     * @function addClickListener
     * @description Adds a click event listener to the toast for closing.
     * @param {HTMLElement} [element=this.#element] - The element to attach the listener to.
     * @private
     */
    #addClickListener(element = this.#element) {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.#toastsManager.hideToast(this.#key);
        });
    }
}
