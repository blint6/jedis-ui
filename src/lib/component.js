let EventEmitter = require('events').EventEmitter;
let ComponentContext = require('./componentContext');

let returnObject = (() => ({}));
let defaultStateResolver = {
    resolveState: returnObject,
    setState: function() {}
};

class Component extends EventEmitter {
    constructor(componentClass, props, children) {
        this.class = componentClass;
        this.class.client = this.class.client || {};
        this.class.resource = this.class.resource || {};
        this.class.getInitialState = this.class.getInitialState || returnObject;
        this.props = props || {};
        this.props.children = children || [];
        this.props.stateResolver = this.props.stateResolver || defaultStateResolver;
    }

    context(context) {
        return new ComponentContext(this, context);
    }
}

module.exports = Component;