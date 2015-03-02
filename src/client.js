let Symbol = require('es6-symbol');
let JedisComponent = require('./lib/component.cli');
let mixin = require('./lib/tool/mixin');

function Jedis(root, options) {
    options = options || {};
    options.component = options.component || {};

    let componentMixins = [],
        appMixins = [];

    (options.mixins || []).forEach(mixin => {
        if (mixin.app)
            appMixins.push({
                name: mixin.name,
                class: mixin.app
            });
        if (mixin.component)
            componentMixins.push({
                name: mixin.name,
                class: mixin.component
            });
    });

    this.createComponent = function(def) {
        return new JedisComponent(this, def, componentMixins);
    };

    let priv = {};
    this[Jedis.pKey] = priv;
    mixin(priv, appMixins);

    if (typeof priv.componentsWillMount === 'function')
        priv.componentsWillMount.call(this);

    this.component = {
        root: this.createComponent(root),
        index: {}
    };

    if (typeof priv.componentsDidMount === 'function')
        priv.componentsDidMount.call(this);

    let assignIndex = (c => {
        this.component.index[c.id] = c;
        c.children.forEach(assignIndex);
    });
    assignIndex(this.component.root);
}

Jedis.prototype.render = function(options) {
    if (typeof this[Jedis.pKey].render === 'function')
        return this[Jedis.pKey].render.call(this, options);
    else
        return this.component.root.render(options);
};

Jedis.prototype.dispatch = function(payload) {
    return payload.j.map(componentCtx =>
        this.component.index[componentCtx.id].setState(componentCtx.state, false));
};

Jedis.pKey = Symbol('ala');

module.exports = {
    createApp: function(index, options) {
        return new Jedis(index, options);
    }
};