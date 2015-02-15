let defRenderer = {
    render: function (component, cb) {
        let oldNode = this.node,
            parent = this.node && this.node.parentNode;

        let j = function (name, props, children) {
            let el = oldNode || document.createElement(name);

            if (typeof children === 'string')
                el.textContent = children;
            else
                el.childNodes = (children || []);

            return el;
        };

        this.node = component._render(j);

        if (parent) {
            if (oldNode)
                parent.replaceChild(this.node, oldNode);
            else
                parent.appendChild(this.node);
        }

        cb(null, this.node);
    }
};

let defPub = function () {
    console.log('WARN', 'No publish defined (impossible to communicate with the server)');
};

let comparePaths = function (a, b) {
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

let extendState = function (newState) {
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

    this.setState = function (newState, localOnly, cb) {
        extendState.call(this, newState);

        if (!localOnly)
            pub(path, newState);

        return this.forceUpdate(cb);
    };

    this.forceUpdate = function (cb) {
        renderer.render(this, function (err, node) {
            cb && cb(err, node);
        });
    };

    function _handleState(state) {
        if (typeof this.class.handleState === 'function')
            return this.class.handleState.call(this, state);
    }
}

JedisComponent.prototype._render = function (j) {
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

Jedis.prototype.render = function () {
    this.component.tree.forceUpdate(function (err, node) {
        document.getElementById('body').appendChild(node);
    });
};

Jedis.prototype.push = function (payload) {
    Object.keys(payload).forEach(path => this.component.index[path].setState(payload[path], true));
};

module.exports = {
    createApp: function (index) {
        return new Jedis(index);
    }
};
