let Component = require('../component');

module.exports = function updateDeps(deps, contextDeps) {
    for (let dep in contextDeps) {
        if (deps[dep] && deps[dep].class === contextDeps.class) {
            let newProps, contextProps = contextDeps.props || {};

            for (let prop in deps[dep].component.props) {
                if (contextProps.hasOwnProperty(prop)) {
                    if (contextProps[prop] !== deps[dep].component.props[prop]) {
                        newProps = newProps || {};
                        newProps[prop] = contextProps[prop];
                    }

                    delete contextProps[prop];
                }
            }

            if (newProps) {
                if (deps[dep].class.willReceiveProps)
                    deps[dep].class.willReceiveProps.call(deps[dep], newProps);

                deps[dep].component.setProps(newProps);
            }
        } else {
            deps[dep] = new Component(contextDeps.class, contextDeps.props, contextDeps.children)
                .context(context);
        }
    }
};