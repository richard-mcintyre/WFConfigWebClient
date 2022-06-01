import { Utils } from './utils.js';

class LifeCycleConfiguration extends HTMLElement {

    #template = null;
    #configuration = { };

    #idElement = null;
    #nameElement = null;
    #helpTextElement = null;
    #disableElement = null;
    #btnSave = null;
    #btnCancel = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {       
        if(!this.#template) {
            let resp = await fetch('lifecycleConfiguration.html');
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
            this.#helpTextElement.value = this.#helpTextElement.defaultValue = configuration.helpText ?? '';
            this.#disableElement.checked = this.#disableElement.defaultChecked = false;    
        }
    }

    #getElements() {
        this.#idElement = this.shadowRoot.querySelector('#id');
        this.#nameElement = this.shadowRoot.querySelector('#name');
        this.#helpTextElement = this.shadowRoot.querySelector('#helpText');
        this.#disableElement = this.shadowRoot.querySelector('#chkDisabled');

        this.#btnSave = this.shadowRoot.querySelector('.btn-save');
        this.#btnCancel = this.shadowRoot.querySelector('.btn-cancel');

        this.#nameElement.addEventListener('keyup', () => this.#updateSaveButtonEnabledState());
        this.#nameElement.addEventListener('change', () => this.#updateSaveButtonEnabledState());
        this.#helpTextElement.addEventListener('keyup', () => this.#updateSaveButtonEnabledState());
        this.#helpTextElement.addEventListener('change', () => this.#updateSaveButtonEnabledState());
        this.#disableElement.addEventListener('change', () => this.#updateSaveButtonEnabledState());

        this.#btnCancel.addEventListener('click', () => {
            const event = new Event('cancel');
            this.dispatchEvent(event);
        });
        this.#btnSave.addEventListener('click', () => {
            let data = {};
            
            if(this.#nameElement.value !== this.#nameElement.defaultValue)
                data.name = this.#nameElement.value;
                
            if(this.#helpTextElement.value !== this.#helpTextElement.defaultValue)
                data.helpText = this.#helpTextElement.value;
    
            if(this.#disableElement.checked !== this.#disableElement.defaultChecked)
                data.disabled = this.#disableElement.checked;
    
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


customElements.define('life-cycle-configuration', LifeCycleConfiguration);