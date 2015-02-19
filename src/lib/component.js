let EventEmitter = require('events').EventEmitter;
let Jedis = require('..');
let ComponentContext = require('./componentContext');

class Component extends EventEmitter {
    constructor(componentClass, props, children) {
        this.class = componentClass;
        this.class.client = this.class.client || {};
        this.class.resource = this.class.resource || {};
        this.props = props || {};
        this.props.children = children || [];
        this.deps = {};

        if (this.class.deps) {
            for (let dep in this.class.deps) {
                //this.deps[dep] = this.class.deps[dep].call(this, Jedis.createComponent);
            }
        }
    }

    context(context) {
        return new ComponentContext(this, context);
    }
}

module.exports = Component;