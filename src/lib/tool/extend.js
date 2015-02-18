module.exports = function extend(obj, props) {
    for (let k in (props || {}))
        obj[k] = props[k];
};