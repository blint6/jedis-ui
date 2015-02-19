let EventEmitter = require('events').EventEmitter;
let Promise = require('rsvp').Promise;
let Component = require('./lib/component');

class Jedis extends EventEmitter {
    constructor(tree, options) {
        options = options || {};

        EventEmitter.call(this);
        this.contextManager = options.contextManager;
        this.component = {
            index: {},
            path: {}
        };

        this.component.tree = this._applyTree(tree);
    }

    pathOf(component) {
        return this.component.path[component];
    }

    at(path) {
        return this.component.index[path];
    }

    mapPayload(payload, cb) {
        return Promise.all(payload.j.map(cmptPayload =>
            cb(this.at(cmptPayload.path), {
                state: cmptPayload.state,
                context: cmptPayload.context
            })
        ));
    }

    _applyTree(node, path = '', i = 0) {
        path = path + '/' + i;

        this.component.index[path] = node;
        this.component.path[node] = path;

        // Relay component updates to app level
        node.on('newState', componentCtx => this.emit('newState', componentCtx.context, {
            j: [{
                path: path,
                state: componentCtx.state
            }]
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