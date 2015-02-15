let Promise = require('rsvp').Promise;

class ComponentContext {
    constructor(component, context, state) {
        this.component = component;
        this.context = context;
        this.props = component.props;
        this.state = component.state;
    }

    setState(state) {
        if (typeof this.component.class.handleState === 'function') {
            return Promise.resolve(this.component.class.handleState.call(this, state))
                .then(newState => {
                    if (newState)
                        this.component.emit('newState', this.context, newState);

                    return newState;
                });
        }
    }
}

export
default ComponentContext;