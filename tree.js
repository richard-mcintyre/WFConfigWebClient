import { Utils } from './utils.js';

class Tree extends HTMLElement {

    #treeRootElement = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.#treeRootElement = this.#createTreeRoot();
    }

    addItem(itemSettings, parentItem) {
        if(!parentItem) {
            parentItem = this.#treeRootElement;
        }

        const li = document.createElement('li');
        li.classList.add('tree-item');

        const span = document.createElement('div');
        span.classList.add('tree-item-inner-container');
        li.appendChild(span);


        const expander = document.createElement('img');
        expander.classList.add('tree-item-expander-img');

        span.appendChild(expander);

        const img = document.createElement('img');
        img.classList.add('tree-item-img');

        if(itemSettings.image) {
            img.src = itemSettings.image;           
        } else {
            img.classList.add('tree-item-img-default');
        }

        span.appendChild(img);

        const a = document.createElement('span');
        a.classList.add('caption');
        a.onclick = itemSettings.clickCallback;
        a.textContent = itemSettings.caption;
        span.appendChild(a);

        const ul = document.createElement('ul');
        ul.classList.add('tree-group');
        li.appendChild(ul);

        parentItem.childItemsContainer.appendChild(li);

        if(parentItem.item) {
            parentItem.item.classList.remove('tree-item');
            parentItem.item.classList.add('tree-item-with-children');
        }

        let result = { item: li, childItemsContainer: ul };

        if(itemSettings.createChildrenCallback) {
            expander.setAttribute('data-open', 'false');
            expander.onclick = () => {
                if(expander.getAttribute('data-open') === 'false') {
                    expander.setAttribute('data-open', 'true');
                    itemSettings.createChildrenCallback(result, itemSettings.itemData);
                } else {
                    expander.setAttribute('data-open', 'false');
                    Utils.removeAllChildNodes(ul);
                }            
            };
        }

        return result;
    }

    #createTreeRoot() {
        this.shadowRoot.appendChild(this.#createStylesheetElement());

        const div = document.createElement('div');
        div.classList.add('tree-container');
        this.shadowRoot.appendChild(div);

        const ul = document.createElement('ul');
        ul.classList.add('tree-group');        
        div.appendChild(ul);

        return { item: null, childItemsContainer: ul };
    }

    #createStylesheetElement() {
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', 'tree.css');
        return linkElem;
    }
}

customElements.define('my-tree', Tree);