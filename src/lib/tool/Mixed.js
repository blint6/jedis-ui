let extend = require('./extend');

module.exports = function Mixed(mixins) {
    this.mixin = {};
    let mixedMethods = {};

    mixins.forEach(mixin => {
        if (typeof mixin === 'object') {
            for (let def in mixin) {
                this.mixin[def] = this.mixin[def] || [];
                this.mixin[def].push(mixin[def]);

                if (typeof mixin[def] === 'function') {
                    mixedMethods[def] = mixedMethods[def] || [];
                    mixedMethods[def].push(mixin[def]);
                }
            }
        }
    });

    // Wrap existing methods to make them called mixed methods before their content
    for (let name in mixedMethods) {
        let oldMethod = this[name];

        if (!oldMethod || typeof oldMethod === 'function') {
            this[name] = function() {
                let lastResult, args = arguments;
                mixedMethods[name].forEach(method => {
                    lastResult = method.apply(this, args);
                });

                if (oldMethod)
                    return oldMethod.apply(this, args);
                else
                    return lastResult;
            };
        }
    }

    this.mixCall = function(fnName, obj, ...args) {
        return this.mixApply(fnName, obj, args);
    };

    this.mixApply = function(fnName, obj, args) {
        let lastResult;

        // Execute mixin functions in order
        if (this.mixin[fnName]) {
            this.mixin[fnName].forEach(fn => {
                if (typeof fn === 'function')
                    lastResult = fn.apply(obj, args);
            });
        }

        // Return class' function call as result
        if (typeof this.class[fnName] === 'function')
            return this.class[fnName].apply(obj, args);
        else
            return lastResult;
    };

    this.mixGet = function(classProp) {
        let res;

        // Attempt to fetch class' prop directly
        if (this.class.hasOwnProperty(classProp))
            res = this.class[classProp];

        // Return non-objects directly. Otherwise, deep extend
        if (res && typeof res !== 'object')
            return res;

        // Or find latest prop from mixins
        if (this.mixin[classProp] && this.mixin[classProp].length) {
            for (let p = this.mixin[classProp].length - 1; p >= 0; p -= 1) {
                let prop = this.mixin[classProp][p];

                // Return the prop if res is under construction
                if (typeof prop !== 'object') {
                    if (!res)
                        return prop;
                }

                res = extend((res || {}), prop);
            }
            return this.mixin[classProp][this.mixin[classProp].length - 1];
        }
    };

    /**
     * Returns an array of properties mathing the given path (deeply)
     */
    this.mixGetAllMixed = function(propPath) {
        let res = [],
            path = propPath.split(/\./g),
            propName = path.shift();

        let lookForProp = ((obj, subPath) => {
            if (subPath.length > 1) {
                if (typeof obj === 'object' && obj.hasOwnProperty(subPath[0])) {
                    let sub = subPath.shift();
                    return lookForProp(sub, subPath);
                }
            } else
                return obj[subPath[0]];
        });

        (this.mixin[propName] || []).forEach(obj => {
            let prop = lookForProp(obj, path);

            if (prop !== undefined) {
                res.push(prop);
            }
        });

        return res;
    };
};