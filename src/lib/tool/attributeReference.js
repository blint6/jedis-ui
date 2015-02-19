class AttributeReference {
    constructor(obj, prop) {

        if (typeof obj[prop] === 'object') {
            this[prop] = Object.keys(obj[prop]).reduce((refs, key) => {
                refs[key] = new AttributeReference(obj[prop], key);
                return refs;
            }, {});
        }

        this.get = () => {
            let ref = (obj instanceof AttributeReference) ? obj._fetchReference() : obj;
            return ref[prop];
        };
    }
}

AttributeReference.map = function(obj) {
    return Object.keys(obj).reduce((refs, key) => {
        refs[key] = new AttributeReference(obj, key);
        return refs;
    }, {});
};

module.exports = AttributeReference;