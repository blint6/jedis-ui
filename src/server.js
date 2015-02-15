let EventEmitter = require('events').EventEmitter;
let Promise = require('rsvp').Promise;
let Component = require('./lib/component');
let ComponentContext = require('./lib/componentContext');

class Jedis extends EventEmitter {
    constructor(tree, options) {
        options = options || {};

        EventEmitter.call(this);
        this.component = {
            index: {},
            path: {}
        };
        this.component.tree = this._applyTree(tree);
    }

    dispatch(payload) {
        // Context resolver needed to pass the context abstract object? Or simply remove app downwards dispatch ability?
        let context = payload.context,
            component = this.component.index[payload.path],
            componentCtx = new ComponentContext(component, context, state);

        if (component) {
            return Promise.resolve(component.props.stateResolver.resolveState(context))
                .then(state => {
                    if (state === undefined)
                        return component.class.getInitialState() || {};
                    else
                        return state;
                })
                .then(state => componentCtx.setState(state))
                .then(newState => {
                    if (newState !== undefined)
                        return Promise.resolve(component.props.stateResolver.setState(context, newState));
                });
        } else {
            console.log('WARN', `App has no component at path ${payload.path}`);
            throw Error('No component found matching payload');
        }
    }

    pathOf(component) {
        return this.component.path[component];
    }

    _applyTree(node, path = '', i = 0) {
        path = path + '/' + i;

        this.component.index[path] = node;
        this.component.path[node] = path;

        // Relay component updates to app level
        node.on('newState', (context, newState) => this.emit('newState', context, {
            path: path,
            state: newState
        }));

        // Component init
        if (node.server && typeof node.server === 'function') {
            node.server(this);
        }

        // Recurse in children
        node.props.children.forEach((child, j) => this._applyTree(child, path, j));
        return node;
    }
}

Jedis.createPage = function createPage(tree, options) {
    return new Jedis(tree, options);
};

Jedis.createComponent = function createComponent(componentClass, props, ...children) {
    return new Component(componentClass, props, children);
};

export
default Jedis;