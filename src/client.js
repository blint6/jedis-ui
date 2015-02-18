let JedisComponent = require('./lib/component.cli');

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

function Jedis(index, options) {
    options = options || {};

    this.component = {
        index: {},
        path: {}
    };

    let createComponent = ((path, component) => new JedisComponent(path, component, options.mixins)),
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

Jedis.prototype.render = function(options) {
    let rootComponent = this.component.tree;
    return rootComponent.render(options);
};

Jedis.prototype.dispatch = function(payload) {
    this.component.index[payload.path].setState(payload.state, false);
};

module.exports = {
    createApp: function(index, options) {
        return new Jedis(index, options);
    }
};