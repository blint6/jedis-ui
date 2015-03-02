let EventEmitter = require('events').EventEmitter;
let ComponentContext = require('./componentContext');
let mixin = require('./tool/mixin');
let extend = require('extend');

class Component extends EventEmitter {
    constructor(componentClass, props, children) {
        componentClass = componentClass || {};

        this.name = componentClass.name || 'anonymous';
        this.class = {};
        this.client = componentClass.client || {};
        this.resource = componentClass.resource || {};
        this.children = children || [];

        extend(true, this.class, componentClass.service);

        let serviceMixins = [],
            clientMixins = [];

        (componentClass.mixins || []).forEach(cmptMixin => {
            if (cmptMixin.service)
                serviceMixins.push({
                    name: cmptMixin.name,
                    class: cmptMixin.service
                });
            if (cmptMixin.client)
                clientMixins.push({
                    name: cmptMixin.name,
                    class: cmptMixin.client
                });
        });

        mixin(this.class, serviceMixins);
        mixin(this.client, clientMixins);

        if (typeof this.class.getDefaultProps === 'function') {
            this.props = this.class.getDefaultProps.call(this);
        }

        this.props = extend(this.props || {}, props || {});
    }

    getClientResource(media) {
        return {
            base: this.client[media],
            mixins: this.client._mixinGetAll(media)
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