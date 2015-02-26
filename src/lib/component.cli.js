let Symbol = require('es6-symbol');
let extend = require('extend');
let Mixed = require('./tool/Mixed');

let defaultComponentMixin = [{

    publish: function( /*newState*/ ) {
        console.log('WARN', 'No _publish defined (impossible to communicate with the server)');
    },

    setState: function() {},

    setLocals: function() {},

    // render: function() {},

    loadComponentClass: function(id) {
        return id;
    },

}];

function JedisComponent(data, mixins) {
    let priv = {};
    this[JedisComponent.pKey] = priv;
    Mixed.call(priv, defaultComponentMixin.concat(mixins || []));

    this.id = data.id;
    priv.class = priv.loadComponentClass(data.id) || {};
    extend(true, this, priv.class);

    this.props = data.props || {};
    this.state = data.state || {};
    this.locals = this.getInitialLocals && this.getInitialLocals() || {};

    this.children = data.children.map(child => new JedisComponent(child, mixins));
    Mixed.call(this, this.mixins || []);
}

JedisComponent.prototype.setState = function(newState, publish = true) {
    extend(this.state, newState);

    if (publish)
        this[JedisComponent.pKey].publish.call(this, newState);

    return this[JedisComponent.pKey].setState.call(this, newState);
};

JedisComponent.prototype.setLocals = function(newLocals) {
    extend(this.locals, newLocals);
    return this[JedisComponent.pKey].setLocals.call(this, newLocals);
};

JedisComponent.prototype.render = function() {
    return this[JedisComponent.pKey].render.call(this);
};

JedisComponent.pKey = Symbol('ala');

module.exports = JedisComponent;