export class Utils {
    
    static createTemplate(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template;
    }

    static removeAllChildNodes(parent) {
        while(parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }
}