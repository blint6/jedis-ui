let extend = require('./tool/extend');
let mixIn = require('./tool/mixIn');

let defaultComponentMixin = [{

    _publish: function( /*path, newState*/ ) {
        console.log('WARN', 'No publish defined (impossible to communicate with the server)');
    },

    _setState: function() {},

    _setLocals: function() {},

    _render: function() {},

}];

function JedisComponent(path, data, mixins) {
    this.class = data.class;
    this.props = data.props || {};
    this.props.children = [];
    this.state = data.class.getInitialState && data.class.getInitialState() || {};
    this.locals = data.class.getInitialLocals && data.class.getInitialLocals() || {};

    mixIn(this, defaultComponentMixin.concat(mixins || []));
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

JedisComponent.prototype.render = function(options) {
    // HARMONIZED VIEW NEEDED - SAME TREE SERVER AND CLIENT SIDE
    //return this.class.render.call(this, (el, props, children) => {
    //    if (typeof el === 'string')
            return this._render(options);
    //});
};

module.exports = JedisComponent;