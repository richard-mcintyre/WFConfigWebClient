import { Utils } from './utils.js';

class OnTrueOnFalseConfiguration extends HTMLElement {

    #template = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        if(!this.#template) {
            let resp = await fetch('ontruefalseConfiguration.html');
            this.#template = Utils.createTemplate(await resp.text());    
        }

        const content = this.#template.content.cloneNode(true);
        this.shadowRoot.appendChild(content);
    }
}

customElements.define('ontruefalse-configuration', OnTrueOnFalseConfiguration);