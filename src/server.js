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
            name: {}
        };

        this.component.root = this._applyTree(tree);
    }

    mapPayload(payload, cb) {
        return Promise.all(payload.j.map(cmptPayload =>
            cb(this.at(cmptPayload.path), {
                state: cmptPayload.state,
                context: cmptPayload.context
            })
        ));
    }

    _applyTree(node, refs = {}) {
        refs[node.class.name] = refs[node.class.name] ? refs[node.class.name] + 1 : 0;
        let id = node.class.name + refs[node.class.name];

        this.component.index[id] = node;
        this.component.name[node] = id;

        // Relay component updates to app level
        node.on('newState', componentCtx => this.emit('newState', componentCtx.context, {
            j: [{
                id: id,
                state: componentCtx.state
            }]
        }));

        // Component init
        if (node.server && typeof node.server === 'function') {
            node.server(this);
        }

        // Recurse in children
        let children = node.props.children.map(child => this._applyTree(child, refs));

        return {
            id: id,
            children: children
        };
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