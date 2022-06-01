import { Utils } from './utils.js';

class QueueConfiguration extends HTMLElement {

    #template = null;
    #configuration = { };

    #idElement = null;
    #nameElement = null;
    #btnSave = null;
    #btnCancel = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        if(!this.#template) {
            let resp = await fetch('queueConfiguration.html');
            this.#template = Utils.createTemplate(await resp.text());    
        }

        const content = this.#template.content.cloneNode(true);
        this.shadowRoot.appendChild(content);

        this.#getElements();

        this.#updateElementsWithConfiguration(this.#configuration);
    }

    static get observedAttributes() {
        return ['configuration']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'configuration') {
            this.#updateElementsWithConfiguration(JSON.parse(newValue))
        }
    }

    #updateElementsWithConfiguration(configuration) {
        this.#configuration = configuration;

        if(this.#idElement) {
            this.#idElement.value = this.#idElement.defaultValue = configuration.id ?? '';
            this.#nameElement.value = this.#nameElement.defaultValue = configuration.name ?? '';
        }
    }

    #getElements() {
        this.#idElement = this.shadowRoot.querySelector('#id');
        this.#nameElement = this.shadowRoot.querySelector('#name');

        this.#btnSave = this.shadowRoot.querySelector('.btn-save');
        this.#btnCancel = this.shadowRoot.querySelector('.btn-cancel');

        this.#nameElement.addEventListener('keyup', () => this.#updateSaveButtonEnabledState());
        this.#nameElement.addEventListener('change', () => this.#updateSaveButtonEnabledState());

        this.#btnCancel.addEventListener('click', () => {
            const event = new Event('cancel');
            this.dispatchEvent(event);
        });
        this.#btnSave.addEventListener('click', () => {
            let data = {};
            
            if(this.#nameElement.value !== this.#nameElement.defaultValue)
                data.name = this.#nameElement.value;
                   
            const event = new CustomEvent('save', {detail: {id: this.#configuration.id, changedConfiguration: data}});
            this.dispatchEvent(event);
        });
    }

    #updateSaveButtonEnabledState() {
        let isValid = this.#validateElements();
        this.#btnSave.disabled = !isValid;
    }

    #validateElements() {
        let isValid = true;

        if(this.#nameElement.value.length == 0) {
            isValid = false;
            this.#nameElement.classList.add('is-invalid');
        } else {
            this.#nameElement.classList.remove('is-invalid');
        }

        return isValid;
    }
}

customElements.define('queue-configuration', QueueConfiguration);