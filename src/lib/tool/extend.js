module.exports = function extend(obj, props) {
    for (let k in (props || {})) {
        if (typeof obj[k] === 'object' && typeof props[k] === 'object')
            extend(obj[k], props[k]);
        else
            obj[k] = props[k];
    }

    return obj;
};