let extend = require('./tool/extend');
let mixIn = require('./tool/mixIn');
let Mixed = require('./tool/Mixed');

let defaultComponentMixin = [{

    _publish: function( /*newState*/ ) {
        console.log('WARN', 'No _publish defined (impossible to communicate with the server)');
    },

    _setState: function() {},

    _setLocals: function() {},

    _render: function() {
        console.log('WARN', 'No renderer defined (impossible to process components renders)');
    },

    _loadComponentClass: function(id) {
        return id;
    },

}];

function JedisComponent(data, mixins) {
    mixIn(this, defaultComponentMixin.concat(mixins || []));

    this.id = data.id;
    this.class = this._loadComponentClass(data.id);
    mixIn(this, [this.class]);

    this.props = data.props || {};
    this.state = data.state || {};
    this.locals = this.getInitialLocals && this.getInitialLocals() || {};

    this.props.children = data.children.map(child => new JedisComponent(child, mixins));
    Mixed.call(this, this.mixins || []);
}

JedisComponent.prototype.setState = function(newState, publish = true) {
    extend(this.state, newState);

    if (publish)
        this._publish(newState);

    return this._setState(newState);
};

JedisComponent.prototype.setLocals = function(newLocals) {
    extend(this.locals, newLocals);
    return this._setLocals(newLocals);
};

module.exports = JedisComponent;