let extend = require('./tool/extend');
let mixIn = require('./tool/mixIn');

let defaultComponentMixin = [{

    _publish: function( /*path, newState*/ ) {
        console.log('WARN', 'No publish defined (impossible to communicate with the server)');
    },

    _setState: function() {},

    _setLocals: function() {},

    _render: function() {},

    _loadComponentClass: function(id) {
        return id;
    },

}];

function JedisComponent(data, mixins) {
    mixIn(this, defaultComponentMixin.concat(mixins || []));

    this.id = data.id;
    this.class = this._loadComponentClass(this.id);
    this.props = data.props || {};
    this.state = this.class.getInitialState && this.class.getInitialState() || {};
    this.locals = this.class.getInitialLocals && this.class.getInitialLocals() || {};

    this.props.children = data.children.map(child => new JedisComponent(child, mixins));
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