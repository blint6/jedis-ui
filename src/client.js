let JedisComponent = require('./lib/component.cli');

function Jedis(root, options) {
    options = options || {};
    options.component = options.component || {};

    this.component = {
        root: new JedisComponent(root, options.component.mixins),
        index: {}
    };

    let assignIndex = (c => {
        this.component.index[c.id] = c;
        c.children.forEach(assignIndex);
    });
    assignIndex(this.component.root);
}

Jedis.prototype.render = function(options) {
    return this.component.root.render(options);
};

Jedis.prototype.dispatch = function(payload) {
    return payload.j.map(componentCtx =>
        this.component.index[componentCtx.id].setState(componentCtx.state, false));
};

module.exports = {
    createApp: function(index, options) {
        return new Jedis(index, options);
    }
};