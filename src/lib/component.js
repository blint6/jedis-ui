let EventEmitter = require('events').EventEmitter;
let ComponentContext = require('./componentContext');
let Mixed = require('./tool/Mixed');
let extend = require('./tool/extend');

class Component extends EventEmitter {
    constructor(componentClass, props, children) {
        this.class = extend({}, componentClass);
        this.class.client = this.class.client || {};
        this.class.resource = this.class.resource || {};
        this.props = props || {};
        this.props.children = children || [];

        Mixed.call(this.class, this.class.mixins || []);
    }

    getClientResource(media) {
        return {
            base: this.class.client[media],
            mixins: this.class.mixGetAllMixed('client.' + media)
        };
    }

    context(context) {
        return new ComponentContext(this, context);
    }

    setProps(newProps) {
        extend(this.props, newProps);
        this.component.emit('newProps', newProps);
    }
}

module.exports = Component;