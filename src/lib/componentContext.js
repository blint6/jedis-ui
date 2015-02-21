let Promise = require('rsvp').Promise;
let extend = require('./tool/extend');

class ComponentContext {
    constructor(component, context) {
        this.component = component;
        this.context = context;
        this.props = component.props;
        this.privates = component.class.getInitialPrivates ?
            component.class.getInitialPrivates(context) : {};
        this.state = component.class.getInitialState ?
            component.class.getInitialState(context) : {};
    }

    handleState(state) {
        if (typeof this.component.class.handleState === 'function')
            return Promise.resolve(this.component.class.handleState.call(this, state));
    }

    setState(newState, publish = true) {
        extend(this.state, newState);

        if (publish)
            this.component.emit('newState', this);
    }
}

module.exports = ComponentContext;