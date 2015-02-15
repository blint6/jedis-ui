let Promise = require('rsvp').Promise;
let JedisComponent = require('./lib/component');
let JedisElement = require('./lib/element');

function applyTree(app, node, path = '', i = 0) {
    path = path + '/' + i;

    app.component.index[path] = node;
    app.component.path[node] = path;

    if (node.server && typeof node.server === 'function') {
        node.server(app);
    }

    node.props.children.forEach((child, j) => applyTree(app, child, path, j));
    return node;
}

class Jedis {
    constructor(tree, options) {
        options = options || {};

        this.component = {
            index: {},
            path: {}
        };
        this.component.tree = applyTree(this, tree);
    }

    push(payload) {
        let context = payload.context,
            component = this.component.index[payload.path];

        if (component) {
            return Promise.resolve(component.props.stateResolver.resolveState(context))
                .then(state => {
                    if (state === undefined)
                        return component.class.getInitialState() || {};
                    else
                        return state;
                })
                .then(state => component._handleState(state))
                .then(newState => {
                    if (newState !== undefined)
                        return Promise.resolve(component.props.stateResolver.setState(context, newState))
                            .then(() => ({
                                path: payload.path,
                                context: context,
                                state: newState
                            }));
                });
        } else {
            console.log('WARN', `App has no component at path ${payload.path}`);
            throw Error('No component found matching payload');
        }
    }

    pathOf(component) {
        return this.component.path[component];
    }
}

Jedis.createPage = function createPage(tree, options) {
    return new Jedis(tree, options);
};

Jedis.createComponent = function createComponent(componentClass, props, ...children) {
    return new JedisComponent(componentClass, props, children);
};

Jedis.element = function j(element, attrs, ...children) {
    return new JedisElement(element, attrs, children);
};

export
default Jedis;