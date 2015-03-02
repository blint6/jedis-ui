let Symbol = require('es6-symbol');
let extend = require('extend');

let sMixed = Symbol('mixin');

let lookForProp = ((obj, subPath) => {
    if (subPath.length > 1) {
        if (typeof obj === 'object' && obj.hasOwnProperty(subPath[0])) {
            let sub = subPath.shift();
            return lookForProp(sub, subPath);
        }
    } else
        return obj[subPath[0]];
});

function Mixed(mixins) {
    this[sMixed] = this[sMixed] || {};
    let inits = [],
        newFns = {};

    mixins.forEach(mixin => {
        if (typeof mixin === 'object') {
            if (!mixin.name)
                throw Error('Some mixins do not have a name and cannot be used');

            let mixedData = {};
            this[sMixed][mixin.name] = mixedData;
            extend(true, mixedData, mixin.class);

            if (typeof mixin.init === 'function')
                inits.push(mixin.init);

            for (let def in mixedData) {
                if (!this.hasOwnProperty(def) && typeof mixedData[def] === 'function') {
                    newFns[def] = mixedData[def];
                }
            }
        }
    });

    // Setup functions (last definition overrides the othersm but not original object's functions)
    for (let fn in newFns)
        this[fn] = newFns[fn];

    inits.forEach(init => init.call(this));

    // Accessor methods
    this._mixinGet = function(mixinName, propPath) {
        if (!this[sMixed][mixinName])
            throw Error(`Mixin ${mixinName} does not exist for this object`);

        let path = propPath.split(/\./g);
        return lookForProp(this[sMixed][mixinName], path);
    };

    this._mixinCall = function(mixinName, fnPath, ...args) {
        let fn = this._mixinGet(mixinName, fnPath);

        if (typeof fn === 'function')
            fn.apply(this, args);
        else
            throw Error(`No function found at ${fnPath}`);
    };

    this._mixinGetAll = function(propPath) {
        let res = {};

        for (let mixinName in this[sMixed]) {
            let prop = this._mixinGet(mixinName, propPath);

            if (prop !== undefined)
                res[mixinName] = prop;
        }

        return res;
    };
}

module.exports = function(obj, mixins) {
    return Mixed.call(obj, mixins);
};