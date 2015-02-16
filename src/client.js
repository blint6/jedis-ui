let defRenderer = {
    render: function(component) {
        let oldNode = this.node,
            parent = this.node && this.node.parentNode;

        let j = function(name, props, ...children) {
            let el = document.createElement(name);
            Object.keys(props || []).forEach(prop => el.setAttribute(prop, props[prop]));

            if (children.length && typeof children[0] === 'string')
                el.textContent = children[0];
            else
                (children || []).forEach(child => el.appendChild(child));

            return el;
        };

        this.node = component._render(j);

        if (parent) {
            if (oldNode)
                parent.replaceChild(this.node, oldNode);
            else
                parent.appendChild(this.node);
        }

        return this.node;
    }
};

let defPub = function() {
    console.log('WARN', 'No publish defined (impossible to communicate with the server)');
};

let comparePaths = function(a, b) {
    let aSplit = a.split(/\//g),
        bSplit = b.split(/\//g);

    while (aSplit.length > 0 && bSplit.length > 0) {
        let i = aSplit.shift(),
            j = bSplit.shift();

        if (i < j) return -1;
        if (i > j) return 1;
    }

    if (aSplit.length) return -1;
    if (bSplit.length) return 1;
};

let extendState = function(newState) {
    for (let k in (newState || {}))
        this.state[k] = newState[k];
};

function JedisComponent(path, data, options) {
    this.class = data.class;
    this.props = data.props || {};
    this.props.children = [];
    this.state = data.class.getInitialState && data.class.getInitialState() || {};

    let renderer = options.renderer || defRenderer,
        pub = options.pub || defPub;

    this.setState = function(newState, localOnly, cb) {
        //extendState.call(this, newState);
        renderer.setState(this, newState);

        if (!localOnly)
            pub(path, newState);

        return this.forceUpdate(cb);
    };

    this.forceUpdate = function() {
        return renderer.render(this);
    };
}

JedisComponent.prototype._render = function(j) {
    if (typeof this.class.render === 'function')
        return this.class.render.call(this, j);
};

function Jedis(index, options) {
    options = options || {};

    this.component = {
        index: {},
        path: {}
    };

    let createComponent = ((path, component) => new JedisComponent(path, component, options)),
        orderedKeys = Object.keys(index).sort(comparePaths),
        rootPath = orderedKeys.shift();

    this.component.tree = createComponent(rootPath, index[rootPath]);
    this.component.index[rootPath] = this.component.tree;
    this.component.path[this.component.tree] = rootPath;

    orderedKeys.forEach(path => {
        let pSplit = path.split(/\//g);
        if (pSplit.length < 3) return;

        pSplit.shift();
        pSplit.shift();
        let p = parseInt(pSplit.shift()),
            node = this.component.tree;

        // Walk the tree to the appropriate leaf (corresponding to path)
        while (pSplit.length > 1) {
            node = node.children[p];
            p = parseInt(pSplit.shift());

            if (!node) throw Error('Invalid index: found holes in the tree');
        }

        let component = createComponent(path, index[path]);
        node.children.push(component);
        this.component.index[path] = component;
        this.component.path[component] = path;
    });
}

Jedis.prototype.render = function() {
    return this.component.tree.forceUpdate();
};

Jedis.prototype.dispatch = function(payload) {
    this.component.index[payload.path].setState(payload.state, true);
};

module.exports = {
    createApp: function(index, options) {
        return new Jedis(index, options);
    }
};