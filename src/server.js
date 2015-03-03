let EventEmitter = require('events').EventEmitter;
let Promise = require('rsvp').Promise;
let Component = require('./lib/component');

class Jedis extends EventEmitter {
    constructor(tree, options) {
        options = options || {};

        EventEmitter.call(this);
        this.contextManager = options.contextManager;
        this.component = {
            index: {}
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

    makePayload(componentCtx) {
        return {
            j: [{
                id: componentCtx.component._id,
                state: componentCtx.state
            }]
        };
    }

    _applyTree(node, refs = {}) {
        refs[node.name] = refs[node.name] ? refs[node.name] + 1 : 1;
        let id = node.name + refs[node.name];

        this.component.index[id] = node;
        node._id = id;

        // Relay component updates to app level
        node.on('newState', componentCtx => this.emit('newState', componentCtx.context, this.makePayload(componentCtx)));

        // Component init
        if (node.server && typeof node.server === 'function') {
            node.server(this);
        }

        // Recurse in children
        let children = node.children.map(child => this._applyTree(child, refs));

        return {
            id: id,
            props: node.props,
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