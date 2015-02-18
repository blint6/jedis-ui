module.exports = function mixIn(obj, mixins) {
    mixins.forEach(mixin => {
    	Object.keys(mixin).forEach(prop => obj[prop] = mixin[prop]);
    });
    return obj;
};