let EventEmitter = require('events').EventEmitter;
let ComponentContext = require('./componentContext');
let Mixed = require('./tool/Mixed');
let extend = require('./tool/extend');

class Component extends EventEmitter {
    constructor(componentClass, props, children) {
        componentClass = componentClass || {};

        this.name = componentClass.name || 'anonymous';
        this.class = extend({}, componentClass.service);
        this.client = componentClass.client || {};
        this.resource = componentClass.resource || {};
        this.props = props || {};
        this.children = children || [];

        let serviceMixins = [],
            clientMixins = [];

        (componentClass.mixins || []).forEach(mixin => {
            if (mixin.service)
                serviceMixins.push(mixin.service);
            if (mixin.client)
                clientMixins.push(mixin.client);
        });

        Mixed.call(this.class, serviceMixins);
        Mixed.call(this.client, clientMixins);
    }

    getClientResource(media) {
        return {
            base: this.client[media],
            mixins: this.client.mixGetAllMixed(media)
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