let returnObject = (() => ({}));
let defaultStateResolver = {
    resolveState: returnObject,
    setState: function () {}
};

class JedisComponent {
    constructor(componentClass, props, children) {
        this.class = componentClass;
        this.class.client = this.class.client || {};
        this.class.resource = this.class.resource || {};
        this.class.getInitialState = this.class.getInitialState || returnObject;
        this.props = props || {};
        this.props.children = children || [];
        this.props.stateResolver = this.props.stateResolver || defaultStateResolver;
    }

    _handleState(state) {
        if (typeof this.class.handleState === 'function')
            return this.class.handleState.call(this, state);
    }
}

export default JedisComponent;
