let extend = require('extend');
let mixin = require('./tool/mixin');

let defaultComponentMixin = [{

    name: 'default',

    class: {
        publish: function( /*newState*/ ) {
            console.log('WARN', 'No _publish defined (impossible to communicate with the server)');
        },

        setState: function() {},

        setLocals: function() {},

        // render: function() {},

        loadComponentClass: function(id) {
            return id;
        },
    }
}];

function JedisComponent(app, data, mixins) {
    mixin(this, defaultComponentMixin.concat(mixins || []));

    this.id = data.id;
    extend(true, this, this.loadComponentClass(data.id) || {});
    mixin(this, this.mixins || []);

    this.props = data.props || {};
    this.locals = this.getInitialLocals && this.getInitialLocals() || {};

    if (typeof this.componentWillMount === 'function')
        this.componentWillMount.call(this, app);

    this.state = data.state || {};
    this.children = (data.children || []).map(child => new JedisComponent(app, child, mixins));

    if (typeof this.componentDidMount === 'function')
        this.componentDidMount.call(this, app);
}

JedisComponent.prototype.setState = function(newState, publish = true) {
    extend(this.state, newState);

    if (publish)
        this.publish(newState);

    return this.setState(newState);
};

JedisComponent.prototype.setLocals = function(newLocals) {
    extend(this.locals, newLocals);
    return this.setLocals(newLocals);
};

JedisComponent.prototype.render = function(options) {
    return this.render(options);
};

module.exports = JedisComponent;