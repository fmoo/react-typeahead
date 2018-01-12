!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ReactTypeahead=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

function classNames() {
	var classes = '';
	var arg;

	for (var i = 0; i < arguments.length; i++) {
		arg = arguments[i];
		if (!arg) {
			continue;
		}

		if ('string' === typeof arg || 'number' === typeof arg) {
			classes += ' ' + arg;
		} else if (Object.prototype.toString.call(arg) === '[object Array]') {
			classes += ' ' + classNames.apply(null, arg);
		} else if ('object' === typeof arg) {
			for (var key in arg) {
				if (!arg.hasOwnProperty(key) || !arg[key]) {
					continue;
				}
				classes += ' ' + key;
			}
		}
	}
	return classes.substr(1);
}

// safely export classNames for node / browserify
if (typeof module !== 'undefined' && module.exports) {
	module.exports = classNames;
}

// safely export classNames for RequireJS
if (typeof define !== 'undefined' && define.amd) {
	define('classnames', [], function() {
		return classNames;
	});
}

},{}],2:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var _assign = require('object-assign');

var emptyObject = require('fbjs/lib/emptyObject');
var _invariant = require('fbjs/lib/invariant');

if (process.env.NODE_ENV !== 'production') {
  var warning = require('fbjs/lib/warning');
}

var MIXINS_KEY = 'mixins';

// Helper function to allow the creation of anonymous functions which do not
// have .name set to the name of the variable being assigned to.
function identity(fn) {
  return fn;
}

var ReactPropTypeLocationNames;
if (process.env.NODE_ENV !== 'production') {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
} else {
  ReactPropTypeLocationNames = {};
}

function factory(ReactComponent, isValidElement, ReactNoopUpdateQueue) {
  /**
   * Policies that describe methods in `ReactClassInterface`.
   */

  var injectedMixins = [];

  /**
   * Composite components are higher-level components that compose other composite
   * or host components.
   *
   * To create a new type of `ReactClass`, pass a specification of
   * your new class to `React.createClass`. The only requirement of your class
   * specification is that you implement a `render` method.
   *
   *   var MyComponent = React.createClass({
   *     render: function() {
   *       return <div>Hello World</div>;
   *     }
   *   });
   *
   * The class specification supports a specific protocol of methods that have
   * special meaning (e.g. `render`). See `ReactClassInterface` for
   * more the comprehensive protocol. Any other properties and methods in the
   * class specification will be available on the prototype.
   *
   * @interface ReactClassInterface
   * @internal
   */
  var ReactClassInterface = {
    /**
     * An array of Mixin objects to include when defining your component.
     *
     * @type {array}
     * @optional
     */
    mixins: 'DEFINE_MANY',

    /**
     * An object containing properties and methods that should be defined on
     * the component's constructor instead of its prototype (static methods).
     *
     * @type {object}
     * @optional
     */
    statics: 'DEFINE_MANY',

    /**
     * Definition of prop types for this component.
     *
     * @type {object}
     * @optional
     */
    propTypes: 'DEFINE_MANY',

    /**
     * Definition of context types for this component.
     *
     * @type {object}
     * @optional
     */
    contextTypes: 'DEFINE_MANY',

    /**
     * Definition of context types this component sets for its children.
     *
     * @type {object}
     * @optional
     */
    childContextTypes: 'DEFINE_MANY',

    // ==== Definition methods ====

    /**
     * Invoked when the component is mounted. Values in the mapping will be set on
     * `this.props` if that prop is not specified (i.e. using an `in` check).
     *
     * This method is invoked before `getInitialState` and therefore cannot rely
     * on `this.state` or use `this.setState`.
     *
     * @return {object}
     * @optional
     */
    getDefaultProps: 'DEFINE_MANY_MERGED',

    /**
     * Invoked once before the component is mounted. The return value will be used
     * as the initial value of `this.state`.
     *
     *   getInitialState: function() {
     *     return {
     *       isOn: false,
     *       fooBaz: new BazFoo()
     *     }
     *   }
     *
     * @return {object}
     * @optional
     */
    getInitialState: 'DEFINE_MANY_MERGED',

    /**
     * @return {object}
     * @optional
     */
    getChildContext: 'DEFINE_MANY_MERGED',

    /**
     * Uses props from `this.props` and state from `this.state` to render the
     * structure of the component.
     *
     * No guarantees are made about when or how often this method is invoked, so
     * it must not have side effects.
     *
     *   render: function() {
     *     var name = this.props.name;
     *     return <div>Hello, {name}!</div>;
     *   }
     *
     * @return {ReactComponent}
     * @required
     */
    render: 'DEFINE_ONCE',

    // ==== Delegate methods ====

    /**
     * Invoked when the component is initially created and about to be mounted.
     * This may have side effects, but any external subscriptions or data created
     * by this method must be cleaned up in `componentWillUnmount`.
     *
     * @optional
     */
    componentWillMount: 'DEFINE_MANY',

    /**
     * Invoked when the component has been mounted and has a DOM representation.
     * However, there is no guarantee that the DOM node is in the document.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been mounted (initialized and rendered) for the first time.
     *
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidMount: 'DEFINE_MANY',

    /**
     * Invoked before the component receives new props.
     *
     * Use this as an opportunity to react to a prop transition by updating the
     * state using `this.setState`. Current props are accessed via `this.props`.
     *
     *   componentWillReceiveProps: function(nextProps, nextContext) {
     *     this.setState({
     *       likesIncreasing: nextProps.likeCount > this.props.likeCount
     *     });
     *   }
     *
     * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
     * transition may cause a state change, but the opposite is not true. If you
     * need it, you are probably looking for `componentWillUpdate`.
     *
     * @param {object} nextProps
     * @optional
     */
    componentWillReceiveProps: 'DEFINE_MANY',

    /**
     * Invoked while deciding if the component should be updated as a result of
     * receiving new props, state and/or context.
     *
     * Use this as an opportunity to `return false` when you're certain that the
     * transition to the new props/state/context will not require a component
     * update.
     *
     *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
     *     return !equal(nextProps, this.props) ||
     *       !equal(nextState, this.state) ||
     *       !equal(nextContext, this.context);
     *   }
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @return {boolean} True if the component should update.
     * @optional
     */
    shouldComponentUpdate: 'DEFINE_ONCE',

    /**
     * Invoked when the component is about to update due to a transition from
     * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
     * and `nextContext`.
     *
     * Use this as an opportunity to perform preparation before an update occurs.
     *
     * NOTE: You **cannot** use `this.setState()` in this method.
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @param {ReactReconcileTransaction} transaction
     * @optional
     */
    componentWillUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component's DOM representation has been updated.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been updated.
     *
     * @param {object} prevProps
     * @param {?object} prevState
     * @param {?object} prevContext
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component is about to be removed from its parent and have
     * its DOM representation destroyed.
     *
     * Use this as an opportunity to deallocate any external resources.
     *
     * NOTE: There is no `componentDidUnmount` since your component will have been
     * destroyed by that point.
     *
     * @optional
     */
    componentWillUnmount: 'DEFINE_MANY',

    // ==== Advanced methods ====

    /**
     * Updates the component's currently mounted DOM representation.
     *
     * By default, this implements React's rendering and reconciliation algorithm.
     * Sophisticated clients may wish to override this.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     * @overridable
     */
    updateComponent: 'OVERRIDE_BASE'
  };

  /**
   * Mapping from class specification keys to special processing functions.
   *
   * Although these are declared like instance properties in the specification
   * when defining classes using `React.createClass`, they are actually static
   * and are accessible on the constructor instead of the prototype. Despite
   * being static, they must be defined outside of the "statics" key under
   * which all other static methods are defined.
   */
  var RESERVED_SPEC_KEYS = {
    displayName: function(Constructor, displayName) {
      Constructor.displayName = displayName;
    },
    mixins: function(Constructor, mixins) {
      if (mixins) {
        for (var i = 0; i < mixins.length; i++) {
          mixSpecIntoComponent(Constructor, mixins[i]);
        }
      }
    },
    childContextTypes: function(Constructor, childContextTypes) {
      if (process.env.NODE_ENV !== 'production') {
        validateTypeDef(Constructor, childContextTypes, 'childContext');
      }
      Constructor.childContextTypes = _assign(
        {},
        Constructor.childContextTypes,
        childContextTypes
      );
    },
    contextTypes: function(Constructor, contextTypes) {
      if (process.env.NODE_ENV !== 'production') {
        validateTypeDef(Constructor, contextTypes, 'context');
      }
      Constructor.contextTypes = _assign(
        {},
        Constructor.contextTypes,
        contextTypes
      );
    },
    /**
     * Special case getDefaultProps which should move into statics but requires
     * automatic merging.
     */
    getDefaultProps: function(Constructor, getDefaultProps) {
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps = createMergedResultFunction(
          Constructor.getDefaultProps,
          getDefaultProps
        );
      } else {
        Constructor.getDefaultProps = getDefaultProps;
      }
    },
    propTypes: function(Constructor, propTypes) {
      if (process.env.NODE_ENV !== 'production') {
        validateTypeDef(Constructor, propTypes, 'prop');
      }
      Constructor.propTypes = _assign({}, Constructor.propTypes, propTypes);
    },
    statics: function(Constructor, statics) {
      mixStaticSpecIntoComponent(Constructor, statics);
    },
    autobind: function() {}
  };

  function validateTypeDef(Constructor, typeDef, location) {
    for (var propName in typeDef) {
      if (typeDef.hasOwnProperty(propName)) {
        // use a warning instead of an _invariant so components
        // don't show up in prod but only in __DEV__
        if (process.env.NODE_ENV !== 'production') {
          warning(
            typeof typeDef[propName] === 'function',
            '%s: %s type `%s` is invalid; it must be a function, usually from ' +
              'React.PropTypes.',
            Constructor.displayName || 'ReactClass',
            ReactPropTypeLocationNames[location],
            propName
          );
        }
      }
    }
  }

  function validateMethodOverride(isAlreadyDefined, name) {
    var specPolicy = ReactClassInterface.hasOwnProperty(name)
      ? ReactClassInterface[name]
      : null;

    // Disallow overriding of base class methods unless explicitly allowed.
    if (ReactClassMixin.hasOwnProperty(name)) {
      _invariant(
        specPolicy === 'OVERRIDE_BASE',
        'ReactClassInterface: You are attempting to override ' +
          '`%s` from your class specification. Ensure that your method names ' +
          'do not overlap with React methods.',
        name
      );
    }

    // Disallow defining methods more than once unless explicitly allowed.
    if (isAlreadyDefined) {
      _invariant(
        specPolicy === 'DEFINE_MANY' || specPolicy === 'DEFINE_MANY_MERGED',
        'ReactClassInterface: You are attempting to define ' +
          '`%s` on your component more than once. This conflict may be due ' +
          'to a mixin.',
        name
      );
    }
  }

  /**
   * Mixin helper which handles policy validation and reserved
   * specification keys when building React classes.
   */
  function mixSpecIntoComponent(Constructor, spec) {
    if (!spec) {
      if (process.env.NODE_ENV !== 'production') {
        var typeofSpec = typeof spec;
        var isMixinValid = typeofSpec === 'object' && spec !== null;

        if (process.env.NODE_ENV !== 'production') {
          warning(
            isMixinValid,
            "%s: You're attempting to include a mixin that is either null " +
              'or not an object. Check the mixins included by the component, ' +
              'as well as any mixins they include themselves. ' +
              'Expected object but got %s.',
            Constructor.displayName || 'ReactClass',
            spec === null ? null : typeofSpec
          );
        }
      }

      return;
    }

    _invariant(
      typeof spec !== 'function',
      "ReactClass: You're attempting to " +
        'use a component class or function as a mixin. Instead, just use a ' +
        'regular object.'
    );
    _invariant(
      !isValidElement(spec),
      "ReactClass: You're attempting to " +
        'use a component as a mixin. Instead, just use a regular object.'
    );

    var proto = Constructor.prototype;
    var autoBindPairs = proto.__reactAutoBindPairs;

    // By handling mixins before any other properties, we ensure the same
    // chaining order is applied to methods with DEFINE_MANY policy, whether
    // mixins are listed before or after these methods in the spec.
    if (spec.hasOwnProperty(MIXINS_KEY)) {
      RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
    }

    for (var name in spec) {
      if (!spec.hasOwnProperty(name)) {
        continue;
      }

      if (name === MIXINS_KEY) {
        // We have already handled mixins in a special case above.
        continue;
      }

      var property = spec[name];
      var isAlreadyDefined = proto.hasOwnProperty(name);
      validateMethodOverride(isAlreadyDefined, name);

      if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
        RESERVED_SPEC_KEYS[name](Constructor, property);
      } else {
        // Setup methods on prototype:
        // The following member methods should not be automatically bound:
        // 1. Expected ReactClass methods (in the "interface").
        // 2. Overridden methods (that were mixed in).
        var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
        var isFunction = typeof property === 'function';
        var shouldAutoBind =
          isFunction &&
          !isReactClassMethod &&
          !isAlreadyDefined &&
          spec.autobind !== false;

        if (shouldAutoBind) {
          autoBindPairs.push(name, property);
          proto[name] = property;
        } else {
          if (isAlreadyDefined) {
            var specPolicy = ReactClassInterface[name];

            // These cases should already be caught by validateMethodOverride.
            _invariant(
              isReactClassMethod &&
                (specPolicy === 'DEFINE_MANY_MERGED' ||
                  specPolicy === 'DEFINE_MANY'),
              'ReactClass: Unexpected spec policy %s for key %s ' +
                'when mixing in component specs.',
              specPolicy,
              name
            );

            // For methods which are defined more than once, call the existing
            // methods before calling the new property, merging if appropriate.
            if (specPolicy === 'DEFINE_MANY_MERGED') {
              proto[name] = createMergedResultFunction(proto[name], property);
            } else if (specPolicy === 'DEFINE_MANY') {
              proto[name] = createChainedFunction(proto[name], property);
            }
          } else {
            proto[name] = property;
            if (process.env.NODE_ENV !== 'production') {
              // Add verbose displayName to the function, which helps when looking
              // at profiling tools.
              if (typeof property === 'function' && spec.displayName) {
                proto[name].displayName = spec.displayName + '_' + name;
              }
            }
          }
        }
      }
    }
  }

  function mixStaticSpecIntoComponent(Constructor, statics) {
    if (!statics) {
      return;
    }
    for (var name in statics) {
      var property = statics[name];
      if (!statics.hasOwnProperty(name)) {
        continue;
      }

      var isReserved = name in RESERVED_SPEC_KEYS;
      _invariant(
        !isReserved,
        'ReactClass: You are attempting to define a reserved ' +
          'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' +
          'as an instance property instead; it will still be accessible on the ' +
          'constructor.',
        name
      );

      var isInherited = name in Constructor;
      _invariant(
        !isInherited,
        'ReactClass: You are attempting to define ' +
          '`%s` on your component more than once. This conflict may be ' +
          'due to a mixin.',
        name
      );
      Constructor[name] = property;
    }
  }

  /**
   * Merge two objects, but throw if both contain the same key.
   *
   * @param {object} one The first object, which is mutated.
   * @param {object} two The second object
   * @return {object} one after it has been mutated to contain everything in two.
   */
  function mergeIntoWithNoDuplicateKeys(one, two) {
    _invariant(
      one && two && typeof one === 'object' && typeof two === 'object',
      'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.'
    );

    for (var key in two) {
      if (two.hasOwnProperty(key)) {
        _invariant(
          one[key] === undefined,
          'mergeIntoWithNoDuplicateKeys(): ' +
            'Tried to merge two objects with the same key: `%s`. This conflict ' +
            'may be due to a mixin; in particular, this may be caused by two ' +
            'getInitialState() or getDefaultProps() methods returning objects ' +
            'with clashing keys.',
          key
        );
        one[key] = two[key];
      }
    }
    return one;
  }

  /**
   * Creates a function that invokes two functions and merges their return values.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createMergedResultFunction(one, two) {
    return function mergedResult() {
      var a = one.apply(this, arguments);
      var b = two.apply(this, arguments);
      if (a == null) {
        return b;
      } else if (b == null) {
        return a;
      }
      var c = {};
      mergeIntoWithNoDuplicateKeys(c, a);
      mergeIntoWithNoDuplicateKeys(c, b);
      return c;
    };
  }

  /**
   * Creates a function that invokes two functions and ignores their return vales.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createChainedFunction(one, two) {
    return function chainedFunction() {
      one.apply(this, arguments);
      two.apply(this, arguments);
    };
  }

  /**
   * Binds a method to the component.
   *
   * @param {object} component Component whose method is going to be bound.
   * @param {function} method Method to be bound.
   * @return {function} The bound method.
   */
  function bindAutoBindMethod(component, method) {
    var boundMethod = method.bind(component);
    if (process.env.NODE_ENV !== 'production') {
      boundMethod.__reactBoundContext = component;
      boundMethod.__reactBoundMethod = method;
      boundMethod.__reactBoundArguments = null;
      var componentName = component.constructor.displayName;
      var _bind = boundMethod.bind;
      boundMethod.bind = function(newThis) {
        for (
          var _len = arguments.length,
            args = Array(_len > 1 ? _len - 1 : 0),
            _key = 1;
          _key < _len;
          _key++
        ) {
          args[_key - 1] = arguments[_key];
        }

        // User is trying to bind() an autobound method; we effectively will
        // ignore the value of "this" that the user is trying to use, so
        // let's warn.
        if (newThis !== component && newThis !== null) {
          if (process.env.NODE_ENV !== 'production') {
            warning(
              false,
              'bind(): React component methods may only be bound to the ' +
                'component instance. See %s',
              componentName
            );
          }
        } else if (!args.length) {
          if (process.env.NODE_ENV !== 'production') {
            warning(
              false,
              'bind(): You are binding a component method to the component. ' +
                'React does this for you automatically in a high-performance ' +
                'way, so you can safely remove this call. See %s',
              componentName
            );
          }
          return boundMethod;
        }
        var reboundMethod = _bind.apply(boundMethod, arguments);
        reboundMethod.__reactBoundContext = component;
        reboundMethod.__reactBoundMethod = method;
        reboundMethod.__reactBoundArguments = args;
        return reboundMethod;
      };
    }
    return boundMethod;
  }

  /**
   * Binds all auto-bound methods in a component.
   *
   * @param {object} component Component whose method is going to be bound.
   */
  function bindAutoBindMethods(component) {
    var pairs = component.__reactAutoBindPairs;
    for (var i = 0; i < pairs.length; i += 2) {
      var autoBindKey = pairs[i];
      var method = pairs[i + 1];
      component[autoBindKey] = bindAutoBindMethod(component, method);
    }
  }

  var IsMountedPreMixin = {
    componentDidMount: function() {
      this.__isMounted = true;
    }
  };

  var IsMountedPostMixin = {
    componentWillUnmount: function() {
      this.__isMounted = false;
    }
  };

  /**
   * Add more to the ReactClass base class. These are all legacy features and
   * therefore not already part of the modern ReactComponent.
   */
  var ReactClassMixin = {
    /**
     * TODO: This will be deprecated because state should always keep a consistent
     * type signature and the only use case for this, is to avoid that.
     */
    replaceState: function(newState, callback) {
      this.updater.enqueueReplaceState(this, newState, callback);
    },

    /**
     * Checks whether or not this composite component is mounted.
     * @return {boolean} True if mounted, false otherwise.
     * @protected
     * @final
     */
    isMounted: function() {
      if (process.env.NODE_ENV !== 'production') {
        warning(
          this.__didWarnIsMounted,
          '%s: isMounted is deprecated. Instead, make sure to clean up ' +
            'subscriptions and pending requests in componentWillUnmount to ' +
            'prevent memory leaks.',
          (this.constructor && this.constructor.displayName) ||
            this.name ||
            'Component'
        );
        this.__didWarnIsMounted = true;
      }
      return !!this.__isMounted;
    }
  };

  var ReactClassComponent = function() {};
  _assign(
    ReactClassComponent.prototype,
    ReactComponent.prototype,
    ReactClassMixin
  );

  /**
   * Creates a composite component class given a class specification.
   * See https://facebook.github.io/react/docs/top-level-api.html#react.createclass
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  function createClass(spec) {
    // To keep our warnings more understandable, we'll use a little hack here to
    // ensure that Constructor.name !== 'Constructor'. This makes sure we don't
    // unnecessarily identify a class without displayName as 'Constructor'.
    var Constructor = identity(function(props, context, updater) {
      // This constructor gets overridden by mocks. The argument is used
      // by mocks to assert on what gets mounted.

      if (process.env.NODE_ENV !== 'production') {
        warning(
          this instanceof Constructor,
          'Something is calling a React component directly. Use a factory or ' +
            'JSX instead. See: https://fb.me/react-legacyfactory'
        );
      }

      // Wire up auto-binding
      if (this.__reactAutoBindPairs.length) {
        bindAutoBindMethods(this);
      }

      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;

      this.state = null;

      // ReactClasses doesn't have constructors. Instead, they use the
      // getInitialState and componentWillMount methods for initialization.

      var initialState = this.getInitialState ? this.getInitialState() : null;
      if (process.env.NODE_ENV !== 'production') {
        // We allow auto-mocks to proceed as if they're returning null.
        if (
          initialState === undefined &&
          this.getInitialState._isMockFunction
        ) {
          // This is probably bad practice. Consider warning here and
          // deprecating this convenience.
          initialState = null;
        }
      }
      _invariant(
        typeof initialState === 'object' && !Array.isArray(initialState),
        '%s.getInitialState(): must return an object or null',
        Constructor.displayName || 'ReactCompositeComponent'
      );

      this.state = initialState;
    });
    Constructor.prototype = new ReactClassComponent();
    Constructor.prototype.constructor = Constructor;
    Constructor.prototype.__reactAutoBindPairs = [];

    injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));

    mixSpecIntoComponent(Constructor, IsMountedPreMixin);
    mixSpecIntoComponent(Constructor, spec);
    mixSpecIntoComponent(Constructor, IsMountedPostMixin);

    // Initialize the defaultProps property after all mixins have been merged.
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    if (process.env.NODE_ENV !== 'production') {
      // This is a tag to indicate that the use of these method names is ok,
      // since it's used with createClass. If it's not, then it's likely a
      // mistake so we'll warn you to use the static property, property
      // initializer or constructor respectively.
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps.isReactClassApproved = {};
      }
      if (Constructor.prototype.getInitialState) {
        Constructor.prototype.getInitialState.isReactClassApproved = {};
      }
    }

    _invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    );

    if (process.env.NODE_ENV !== 'production') {
      warning(
        !Constructor.prototype.componentShouldUpdate,
        '%s has a method called ' +
          'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
          'The name is phrased as a question because the function is ' +
          'expected to return a value.',
        spec.displayName || 'A component'
      );
      warning(
        !Constructor.prototype.componentWillRecieveProps,
        '%s has a method called ' +
          'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?',
        spec.displayName || 'A component'
      );
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactClassInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    return Constructor;
  }

  return createClass;
}

module.exports = factory;

}).call(this,require('_process'))
},{"_process":10,"fbjs/lib/emptyObject":5,"fbjs/lib/invariant":6,"fbjs/lib/warning":7,"object-assign":9}],3:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var React = require('react');
var factory = require('./factory');

if (typeof React === 'undefined') {
  throw Error(
    'create-react-class could not find the React object. If you are using script tags, ' +
      'make sure that React is being loaded before create-react-class.'
  );
}

// Hack to grab NoopUpdateQueue from isomorphic React
var ReactNoopUpdateQueue = new React.Component().updater;

module.exports = factory(
  React.Component,
  React.isValidElement,
  ReactNoopUpdateQueue
);

},{"./factory":2,"react":"react"}],4:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],5:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var emptyObject = {};

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;
}).call(this,require('_process'))
},{"_process":10}],6:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
}).call(this,require('_process'))
},{"_process":10}],7:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  var printWarning = function printWarning(format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  warning = function warning(condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

module.exports = warning;
}).call(this,require('_process'))
},{"./emptyFunction":4,"_process":10}],8:[function(require,module,exports){
/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

(function() {

var root = this;

var fuzzy = {};

// Use in node or in browser
if (typeof exports !== 'undefined') {
  module.exports = fuzzy;
} else {
  root.fuzzy = fuzzy;
}

// Return all elements of `array` that have a fuzzy
// match against `pattern`.
fuzzy.simpleFilter = function(pattern, array) {
  return array.filter(function(str) {
    return fuzzy.test(pattern, str);
  });
};

// Does `pattern` fuzzy match `str`?
fuzzy.test = function(pattern, str) {
  return fuzzy.match(pattern, str) !== null;
};

// If `pattern` matches `str`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, str, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = str.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && str || str.toLowerCase()
    , ch;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = str[idx];
    if(compareString[idx] === pattern[patternIdx]) {
      ch = pre + ch + post;
      patternIdx += 1;

      // consecutive characters should increase the score more than linearly
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }
    totalScore += currScore;
    result[result.length] = ch;
  }

  // return rendered string if we have a match for every char
  if(patternIdx === pattern.length) {
    // if the string is an exact match with pattern, totalScore should be maxed
    totalScore = (compareString === pattern) ? Infinity : totalScore;
    return {rendered: result.join(''), score: totalScore};
  }

  return null;
};

// The normal entry point. Filters `arr` for matches against `pattern`.
// It returns an array with matching values of the type:
//
//     [{
//         string:   '<b>lah' // The rendered string
//       , index:    2        // The index of the element in `arr`
//       , original: 'blah'   // The original element in `arr`
//     }]
//
// `opts` is an optional argument bag. Details:
//
//    opts = {
//        // string to put before a matching character
//        pre:     '<b>'
//
//        // string to put after matching character
//      , post:    '</b>'
//
//        // Optional function. Input is an entry in the given arr`,
//        // output should be the string to test `pattern` against.
//        // In this example, if `arr = [{crying: 'koala'}]` we would return
//        // 'koala'.
//      , extract: function(arg) { return arg.crying; }
//    }
fuzzy.filter = function(pattern, arr, opts) {
  if(!arr || arr.length === 0) {
    return [];
  }
  if (typeof pattern !== 'string') {
    return arr;
  }
  opts = opts || {};
  return arr
    .reduce(function(prev, element, idx, arr) {
      var str = element;
      if(opts.extract) {
        str = opts.extract(element);
      }
      var rendered = fuzzy.match(pattern, str, opts);
      if(rendered != null) {
        prev[prev.length] = {
            string: rendered.rendered
          , score: rendered.score
          , index: idx
          , original: element
        };
      }
      return prev;
    }, [])

    // Sort by score. Browsers are inconsistent wrt stable/unstable
    // sorting, so force stable by using the index in the case of tie.
    // See http://ofb.net/~sethml/is-sort-stable.html
    .sort(function(a,b) {
      var compare = b.score - a.score;
      if(compare) return compare;
      return a.index - b.index;
    });
};


}());


},{}],9:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],10:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],11:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

if (process.env.NODE_ENV !== 'production') {
  var invariant = require('fbjs/lib/invariant');
  var warning = require('fbjs/lib/warning');
  var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'the `prop-types` package, but received `%s`.', componentName || 'React class', location, typeSpecName, typeof typeSpecs[typeSpecName]);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

}).call(this,require('_process'))
},{"./lib/ReactPropTypesSecret":15,"_process":10,"fbjs/lib/invariant":6,"fbjs/lib/warning":7}],12:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

},{"./lib/ReactPropTypesSecret":15,"fbjs/lib/emptyFunction":4,"fbjs/lib/invariant":6}],13:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');
var assign = require('object-assign');

var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
var checkPropTypes = require('./checkPropTypes');

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker,
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning(
          false,
          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
          'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      // We need to check all keys in case some are required but missing from
      // props.
      var allKeys = assign({}, props[propName], shapeTypes);
      for (var key in allKeys) {
        var checker = shapeTypes[key];
        if (!checker) {
          return new PropTypeError(
            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
            '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
            '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
          );
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

}).call(this,require('_process'))
},{"./checkPropTypes":11,"./lib/ReactPropTypesSecret":15,"_process":10,"fbjs/lib/emptyFunction":4,"fbjs/lib/invariant":6,"fbjs/lib/warning":7,"object-assign":9}],14:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = require('./factoryWithThrowingShims')();
}

}).call(this,require('_process'))
},{"./factoryWithThrowingShims":12,"./factoryWithTypeCheckers":13,"_process":10}],15:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;

},{}],16:[function(require,module,exports){
var Accessor = {
  IDENTITY_FN: function (input) {
    return input;
  },

  generateAccessor: function (field) {
    return function (object) {
      return object[field];
    };
  },

  generateOptionToStringFor: function (prop) {
    if (typeof prop === 'string') {
      return this.generateAccessor(prop);
    } else if (typeof prop === 'function') {
      return prop;
    } else {
      return this.IDENTITY_FN;
    }
  },

  valueForOption: function (option, object) {
    if (typeof option === 'string') {
      return object[option];
    } else if (typeof option === 'function') {
      return option(object);
    } else {
      return object;
    }
  }
};

module.exports = Accessor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjY2Vzc29yLmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwiSURFTlRJVFlfRk4iLCJpbnB1dCIsImdlbmVyYXRlQWNjZXNzb3IiLCJmaWVsZCIsIm9iamVjdCIsImdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IiLCJwcm9wIiwidmFsdWVGb3JPcHRpb24iLCJvcHRpb24iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxXQUFXO0FBQ2JDLGVBQWEsVUFBU0MsS0FBVCxFQUFnQjtBQUFFLFdBQU9BLEtBQVA7QUFBZSxHQURqQzs7QUFHYkMsb0JBQWtCLFVBQVNDLEtBQVQsRUFBZ0I7QUFDaEMsV0FBTyxVQUFTQyxNQUFULEVBQWlCO0FBQUUsYUFBT0EsT0FBT0QsS0FBUCxDQUFQO0FBQXVCLEtBQWpEO0FBQ0QsR0FMWTs7QUFPYkUsNkJBQTJCLFVBQVNDLElBQVQsRUFBZTtBQUN4QyxRQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEI7QUFDNUIsYUFBTyxLQUFLSixnQkFBTCxDQUFzQkksSUFBdEIsQ0FBUDtBQUNELEtBRkQsTUFFTyxJQUFJLE9BQU9BLElBQVAsS0FBZ0IsVUFBcEIsRUFBZ0M7QUFDckMsYUFBT0EsSUFBUDtBQUNELEtBRk0sTUFFQTtBQUNMLGFBQU8sS0FBS04sV0FBWjtBQUNEO0FBQ0YsR0FmWTs7QUFpQmJPLGtCQUFnQixVQUFTQyxNQUFULEVBQWlCSixNQUFqQixFQUF5QjtBQUN2QyxRQUFJLE9BQU9JLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDOUIsYUFBT0osT0FBT0ksTUFBUCxDQUFQO0FBQ0QsS0FGRCxNQUVPLElBQUksT0FBT0EsTUFBUCxLQUFrQixVQUF0QixFQUFrQztBQUN2QyxhQUFPQSxPQUFPSixNQUFQLENBQVA7QUFDRCxLQUZNLE1BRUE7QUFDTCxhQUFPQSxNQUFQO0FBQ0Q7QUFDRjtBQXpCWSxDQUFmOztBQTRCQUssT0FBT0MsT0FBUCxHQUFpQlgsUUFBakIiLCJmaWxlIjoiYWNjZXNzb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQWNjZXNzb3IgPSB7XG4gIElERU5USVRZX0ZOOiBmdW5jdGlvbihpbnB1dCkgeyByZXR1cm4gaW5wdXQ7IH0sXG5cbiAgZ2VuZXJhdGVBY2Nlc3NvcjogZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7IHJldHVybiBvYmplY3RbZmllbGRdOyB9O1xuICB9LFxuXG4gIGdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3I6IGZ1bmN0aW9uKHByb3ApIHtcbiAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZUFjY2Vzc29yKHByb3ApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5JREVOVElUWV9GTjtcbiAgICB9XG4gIH0sXG5cbiAgdmFsdWVGb3JPcHRpb246IGZ1bmN0aW9uKG9wdGlvbiwgb2JqZWN0KSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gb2JqZWN0W29wdGlvbl07XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb3B0aW9uKG9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBY2Nlc3NvcjtcbiJdfQ==
},{}],17:[function(require,module,exports){
/**
 * PolyFills make me sad
 */
var KeyEvent = KeyEvent || {};
KeyEvent.DOM_VK_UP = KeyEvent.DOM_VK_UP || 38;
KeyEvent.DOM_VK_DOWN = KeyEvent.DOM_VK_DOWN || 40;
KeyEvent.DOM_VK_BACK_SPACE = KeyEvent.DOM_VK_BACK_SPACE || 8;
KeyEvent.DOM_VK_RETURN = KeyEvent.DOM_VK_RETURN || 13;
KeyEvent.DOM_VK_ENTER = KeyEvent.DOM_VK_ENTER || 14;
KeyEvent.DOM_VK_ESCAPE = KeyEvent.DOM_VK_ESCAPE || 27;
KeyEvent.DOM_VK_TAB = KeyEvent.DOM_VK_TAB || 9;

module.exports = KeyEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtleWV2ZW50LmpzIl0sIm5hbWVzIjpbIktleUV2ZW50IiwiRE9NX1ZLX1VQIiwiRE9NX1ZLX0RPV04iLCJET01fVktfQkFDS19TUEFDRSIsIkRPTV9WS19SRVRVUk4iLCJET01fVktfRU5URVIiLCJET01fVktfRVNDQVBFIiwiRE9NX1ZLX1RBQiIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxJQUFJQSxXQUFXQSxZQUFZLEVBQTNCO0FBQ0FBLFNBQVNDLFNBQVQsR0FBcUJELFNBQVNDLFNBQVQsSUFBc0IsRUFBM0M7QUFDQUQsU0FBU0UsV0FBVCxHQUF1QkYsU0FBU0UsV0FBVCxJQUF3QixFQUEvQztBQUNBRixTQUFTRyxpQkFBVCxHQUE2QkgsU0FBU0csaUJBQVQsSUFBOEIsQ0FBM0Q7QUFDQUgsU0FBU0ksYUFBVCxHQUF5QkosU0FBU0ksYUFBVCxJQUEwQixFQUFuRDtBQUNBSixTQUFTSyxZQUFULEdBQXdCTCxTQUFTSyxZQUFULElBQXlCLEVBQWpEO0FBQ0FMLFNBQVNNLGFBQVQsR0FBeUJOLFNBQVNNLGFBQVQsSUFBMEIsRUFBbkQ7QUFDQU4sU0FBU08sVUFBVCxHQUFzQlAsU0FBU08sVUFBVCxJQUF1QixDQUE3Qzs7QUFFQUMsT0FBT0MsT0FBUCxHQUFpQlQsUUFBakIiLCJmaWxlIjoia2V5ZXZlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFBvbHlGaWxscyBtYWtlIG1lIHNhZFxuICovXG52YXIgS2V5RXZlbnQgPSBLZXlFdmVudCB8fCB7fTtcbktleUV2ZW50LkRPTV9WS19VUCA9IEtleUV2ZW50LkRPTV9WS19VUCB8fCAzODtcbktleUV2ZW50LkRPTV9WS19ET1dOID0gS2V5RXZlbnQuRE9NX1ZLX0RPV04gfHwgNDA7XG5LZXlFdmVudC5ET01fVktfQkFDS19TUEFDRSA9IEtleUV2ZW50LkRPTV9WS19CQUNLX1NQQUNFIHx8IDg7XG5LZXlFdmVudC5ET01fVktfUkVUVVJOID0gS2V5RXZlbnQuRE9NX1ZLX1JFVFVSTiB8fCAxMztcbktleUV2ZW50LkRPTV9WS19FTlRFUiA9IEtleUV2ZW50LkRPTV9WS19FTlRFUiB8fCAxNDtcbktleUV2ZW50LkRPTV9WS19FU0NBUEUgPSBLZXlFdmVudC5ET01fVktfRVNDQVBFIHx8IDI3O1xuS2V5RXZlbnQuRE9NX1ZLX1RBQiA9IEtleUV2ZW50LkRPTV9WS19UQUIgfHwgOTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlFdmVudDtcbiJdfQ==
},{}],18:[function(require,module,exports){
var Typeahead = require('./typeahead');
var Tokenizer = require('./tokenizer');

module.exports = {
  Typeahead: Typeahead,
  Tokenizer: Tokenizer
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0LXR5cGVhaGVhZC5qcyJdLCJuYW1lcyI6WyJUeXBlYWhlYWQiLCJyZXF1aXJlIiwiVG9rZW5pemVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsWUFBWUMsUUFBUSxhQUFSLENBQWhCO0FBQ0EsSUFBSUMsWUFBWUQsUUFBUSxhQUFSLENBQWhCOztBQUVBRSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZKLGFBQVdBLFNBREk7QUFFZkUsYUFBV0E7QUFGSSxDQUFqQiIsImZpbGUiOiJyZWFjdC10eXBlYWhlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgVHlwZWFoZWFkID0gcmVxdWlyZSgnLi90eXBlYWhlYWQnKTtcbnZhciBUb2tlbml6ZXIgPSByZXF1aXJlKCcuL3Rva2VuaXplcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVHlwZWFoZWFkOiBUeXBlYWhlYWQsXG4gIFRva2VuaXplcjogVG9rZW5pemVyXG59O1xuIl19
},{"./tokenizer":19,"./typeahead":21}],19:[function(require,module,exports){
var Accessor = require('../accessor');
var React = window.React || require('react');
var Token = require('./token');
var KeyEvent = require('../keyevent');
var Typeahead = require('../typeahead');
var classNames = require('classnames');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

function _arraysAreDifferent(array1, array2) {
  if (array1.length != array2.length) {
    return true;
  }
  for (var i = array2.length - 1; i >= 0; i--) {
    if (array2[i] !== array1[i]) {
      return true;
    }
  }
}

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
var TypeaheadTokenizer = createReactClass({
  displayName: 'TypeaheadTokenizer',

  propTypes: {
    name: PropTypes.string,
    options: PropTypes.array,
    customClasses: PropTypes.object,
    allowCustomValues: PropTypes.number,
    defaultSelected: PropTypes.array,
    initialValue: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    inputProps: PropTypes.object,
    onTokenRemove: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyPress: PropTypes.func,
    onKeyUp: PropTypes.func,
    onTokenAdd: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    filterOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    searchOptions: PropTypes.func,
    displayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    formInputOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    maxVisible: PropTypes.number,
    resultsTruncatedMessage: PropTypes.string,
    defaultClassNames: PropTypes.bool,
    showOptionsWhenEmpty: PropTypes.bool
  },

  getInitialState: function () {
    return {
      // We need to copy this to avoid incorrect sharing
      // of state across instances (e.g., via getDefaultProps())
      selected: this.props.defaultSelected.slice(0)
    };
  },

  getDefaultProps: function () {
    return {
      options: [],
      defaultSelected: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      placeholder: "",
      disabled: false,
      inputProps: {},
      defaultClassNames: true,
      filterOption: null,
      searchOptions: null,
      displayOption: function (token) {
        return token;
      },
      formInputOption: null,
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      onTokenAdd: function () {},
      onTokenRemove: function () {},
      showOptionsWhenEmpty: false
    };
  },

  componentWillReceiveProps: function (nextProps) {
    // if we get new defaultProps, update selected
    if (_arraysAreDifferent(this.props.defaultSelected, nextProps.defaultSelected)) {
      this.setState({ selected: nextProps.defaultSelected.slice(0) });
    }
  },

  focus: function () {
    this.refs.typeahead.focus();
  },

  getSelectedTokens: function () {
    return this.state.selected;
  },

  // TODO: Support initialized tokens
  //
  _renderTokens: function () {
    var tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    var classList = classNames(tokenClasses);
    var result = this.state.selected.map(function (selected) {
      var displayString = Accessor.valueForOption(this.props.displayOption, selected);
      var value = Accessor.valueForOption(this.props.formInputOption || this.props.displayOption, selected);
      return React.createElement(
        Token,
        { key: displayString, className: classList,
          onRemove: this._removeTokenForValue,
          object: selected,
          value: value,
          name: this.props.name },
        displayString
      );
    }, this);
    return result;
  },

  _getOptionsForTypeahead: function () {
    // return this.props.options without this.selected
    return this.props.options;
  },

  _onKeyDown: function (event) {
    // We only care about intercepting backspaces
    if (event.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
      return this._handleBackspace(event);
    }
    this.props.onKeyDown(event);
  },

  _handleBackspace: function (event) {
    // No tokens
    if (!this.state.selected.length) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    var entry = this.refs.typeahead.refs.entry;
    if (entry.selectionStart == entry.selectionEnd && entry.selectionStart == 0) {
      this._removeTokenForValue(this.state.selected[this.state.selected.length - 1]);
      event.preventDefault();
    }
  },

  _removeTokenForValue: function (value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({ selected: this.state.selected });
    this.props.onTokenRemove(value);
    return;
  },

  _addTokenForValue: function (value) {
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }
    this.state.selected.push(value);
    this.setState({ selected: this.state.selected });
    this.refs.typeahead.setEntryText("");
    this.props.onTokenAdd(value);
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
    var classList = classNames(classes);
    var tokenizerClasses = [this.props.defaultClassNames && "typeahead-tokenizer"];
    tokenizerClasses[this.props.className] = !!this.props.className;
    var tokenizerClassList = classNames(tokenizerClasses);

    return React.createElement(
      'div',
      { className: tokenizerClassList },
      this._renderTokens(),
      React.createElement(Typeahead, { ref: 'typeahead',
        className: classList,
        placeholder: this.props.placeholder,
        disabled: this.props.disabled,
        inputProps: this.props.inputProps,
        allowCustomValues: this.props.allowCustomValues,
        customClasses: this.props.customClasses,
        options: this._getOptionsForTypeahead(),
        initialValue: this.props.initialValue,
        maxVisible: this.props.maxVisible,
        resultsTruncatedMessage: this.props.resultsTruncatedMessage,
        onOptionSelected: this._addTokenForValue,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        displayOption: this.props.displayOption,
        defaultClassNames: this.props.defaultClassNames,
        filterOption: this.props.filterOption,
        searchOptions: this.props.searchOptions,
        showOptionsWhenEmpty: this.props.showOptionsWhenEmpty })
    );
  }
});

module.exports = TypeaheadTokenizer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiVG9rZW4iLCJLZXlFdmVudCIsIlR5cGVhaGVhZCIsImNsYXNzTmFtZXMiLCJjcmVhdGVSZWFjdENsYXNzIiwiUHJvcFR5cGVzIiwiX2FycmF5c0FyZURpZmZlcmVudCIsImFycmF5MSIsImFycmF5MiIsImxlbmd0aCIsImkiLCJUeXBlYWhlYWRUb2tlbml6ZXIiLCJwcm9wVHlwZXMiLCJuYW1lIiwic3RyaW5nIiwib3B0aW9ucyIsImFycmF5IiwiY3VzdG9tQ2xhc3NlcyIsIm9iamVjdCIsImFsbG93Q3VzdG9tVmFsdWVzIiwibnVtYmVyIiwiZGVmYXVsdFNlbGVjdGVkIiwiaW5pdGlhbFZhbHVlIiwicGxhY2Vob2xkZXIiLCJkaXNhYmxlZCIsImJvb2wiLCJpbnB1dFByb3BzIiwib25Ub2tlblJlbW92ZSIsImZ1bmMiLCJvbktleURvd24iLCJvbktleVByZXNzIiwib25LZXlVcCIsIm9uVG9rZW5BZGQiLCJvbkZvY3VzIiwib25CbHVyIiwiZmlsdGVyT3B0aW9uIiwib25lT2ZUeXBlIiwic2VhcmNoT3B0aW9ucyIsImRpc3BsYXlPcHRpb24iLCJmb3JtSW5wdXRPcHRpb24iLCJtYXhWaXNpYmxlIiwicmVzdWx0c1RydW5jYXRlZE1lc3NhZ2UiLCJkZWZhdWx0Q2xhc3NOYW1lcyIsInNob3dPcHRpb25zV2hlbkVtcHR5IiwiZ2V0SW5pdGlhbFN0YXRlIiwic2VsZWN0ZWQiLCJwcm9wcyIsInNsaWNlIiwiZ2V0RGVmYXVsdFByb3BzIiwidG9rZW4iLCJldmVudCIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJzZXRTdGF0ZSIsImZvY3VzIiwicmVmcyIsInR5cGVhaGVhZCIsImdldFNlbGVjdGVkVG9rZW5zIiwic3RhdGUiLCJfcmVuZGVyVG9rZW5zIiwidG9rZW5DbGFzc2VzIiwiY2xhc3NMaXN0IiwicmVzdWx0IiwibWFwIiwiZGlzcGxheVN0cmluZyIsInZhbHVlRm9yT3B0aW9uIiwidmFsdWUiLCJfcmVtb3ZlVG9rZW5Gb3JWYWx1ZSIsIl9nZXRPcHRpb25zRm9yVHlwZWFoZWFkIiwiX29uS2V5RG93biIsImtleUNvZGUiLCJET01fVktfQkFDS19TUEFDRSIsIl9oYW5kbGVCYWNrc3BhY2UiLCJlbnRyeSIsInNlbGVjdGlvblN0YXJ0Iiwic2VsZWN0aW9uRW5kIiwicHJldmVudERlZmF1bHQiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJfYWRkVG9rZW5Gb3JWYWx1ZSIsInB1c2giLCJzZXRFbnRyeVRleHQiLCJyZW5kZXIiLCJjbGFzc2VzIiwidG9rZW5pemVyQ2xhc3NlcyIsImNsYXNzTmFtZSIsInRva2VuaXplckNsYXNzTGlzdCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLElBQUlBLFdBQVdDLFFBQVEsYUFBUixDQUFmO0FBQ0EsSUFBSUMsUUFBUUQsUUFBUSxPQUFSLENBQVo7QUFDQSxJQUFJRSxRQUFRRixRQUFRLFNBQVIsQ0FBWjtBQUNBLElBQUlHLFdBQVdILFFBQVEsYUFBUixDQUFmO0FBQ0EsSUFBSUksWUFBWUosUUFBUSxjQUFSLENBQWhCO0FBQ0EsSUFBSUssYUFBYUwsUUFBUSxZQUFSLENBQWpCO0FBQ0EsSUFBSU0sbUJBQW1CTixRQUFRLG9CQUFSLENBQXZCO0FBQ0EsSUFBSU8sWUFBWVAsUUFBUSxZQUFSLENBQWhCOztBQUVBLFNBQVNRLG1CQUFULENBQTZCQyxNQUE3QixFQUFxQ0MsTUFBckMsRUFBNkM7QUFDM0MsTUFBSUQsT0FBT0UsTUFBUCxJQUFpQkQsT0FBT0MsTUFBNUIsRUFBbUM7QUFDakMsV0FBTyxJQUFQO0FBQ0Q7QUFDRCxPQUFLLElBQUlDLElBQUlGLE9BQU9DLE1BQVAsR0FBZ0IsQ0FBN0IsRUFBZ0NDLEtBQUssQ0FBckMsRUFBd0NBLEdBQXhDLEVBQTZDO0FBQzNDLFFBQUlGLE9BQU9FLENBQVAsTUFBY0gsT0FBT0csQ0FBUCxDQUFsQixFQUE0QjtBQUMxQixhQUFP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ZixLQUFMLENBQVd2QixXQUYxQjtBQUdFLGtCQUFVLEtBQUt1QixLQUFMLENBQVd0QixRQUh2QjtBQUlFLG9CQUFZLEtBQUtzQixLQUFMLENBQVdwQixVQUp6QjtBQUtFLDJCQUFtQixLQUFLb0IsS0FBTCxDQUFXM0IsaUJBTGhDO0FBTUUsdUJBQWUsS0FBSzJCLEtBQUwsQ0FBVzdCLGFBTjVCO0FBT0UsaUJBQVMsS0FBS21ELHVCQUFMLEVBUFg7QUFRRSxzQkFBYyxLQUFLdEIsS0FBTCxDQUFXeEIsWUFSM0I7QUFTRSxvQkFBWSxLQUFLd0IsS0FBTCxDQUFXTixVQVR6QjtBQVVFLGlDQUF5QixLQUFLTSxLQUFMLENBQVdMLHVCQVZ0QztBQVdFLDBCQUFrQixLQUFLdUMsaUJBWHpCO0FBWUUsbUJBQVcsS0FBS1gsVUFabEI7QUFhRSxvQkFBWSxLQUFLdkIsS0FBTCxDQUFXaEIsVUFiekI7QUFjRSxpQkFBUyxLQUFLZ0IsS0FBTCxDQUFXZixPQWR0QjtBQWVFLGlCQUFTLEtBQUtlLEtBQUwsQ0FBV2IsT0FmdEI7QUFnQkUsZ0JBQVEsS0FBS2EsS0FBTCxDQUFXWixNQWhCckI7QUFpQkUsdUJBQWUsS0FBS1ksS0FBTCxDQUFXUixhQWpCNUI7QUFrQkUsMkJBQW1CLEtBQUtRLEtBQUwsQ0FBV0osaUJBbEJoQztBQW1CRSxzQkFBYyxLQUFLSSxLQUFMLENBQVdYLFlBbkIzQjtBQW9CRSx1QkFBZSxLQUFLVyxLQUFMLENBQVdULGFBcEI1QjtBQXFCRSw4QkFBc0IsS0FBS1MsS0FBTCxDQUFXSCxvQkFyQm5DO0FBRkYsS0FERjtBQTJCRDtBQW5NdUMsQ0FBakIsQ0FBekI7O0FBc01BNkMsT0FBT0MsT0FBUCxHQUFpQjlFLGtCQUFqQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBY2Nlc3NvciA9IHJlcXVpcmUoJy4uL2FjY2Vzc29yJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRva2VuID0gcmVxdWlyZSgnLi90b2tlbicpO1xudmFyIEtleUV2ZW50ID0gcmVxdWlyZSgnLi4va2V5ZXZlbnQnKTtcbnZhciBUeXBlYWhlYWQgPSByZXF1aXJlKCcuLi90eXBlYWhlYWQnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIGNyZWF0ZVJlYWN0Q2xhc3MgPSByZXF1aXJlKCdjcmVhdGUtcmVhY3QtY2xhc3MnKTtcbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbmZ1bmN0aW9uIF9hcnJheXNBcmVEaWZmZXJlbnQoYXJyYXkxLCBhcnJheTIpIHtcbiAgaWYgKGFycmF5MS5sZW5ndGggIT0gYXJyYXkyLmxlbmd0aCl7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZm9yICh2YXIgaSA9IGFycmF5Mi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChhcnJheTJbaV0gIT09IGFycmF5MVtpXSl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBIHR5cGVhaGVhZCB0aGF0LCB3aGVuIGFuIG9wdGlvbiBpcyBzZWxlY3RlZCwgaW5zdGVhZCBvZiBzaW1wbHkgZmlsbGluZ1xuICogdGhlIHRleHQgZW50cnkgd2lkZ2V0LCBwcmVwZW5kcyBhIHJlbmRlcmFibGUgXCJ0b2tlblwiLCB0aGF0IG1heSBiZSBkZWxldGVkXG4gKiBieSBwcmVzc2luZyBiYWNrc3BhY2Ugb24gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZSB3aXRoIHRoZSBrZXlib2FyZC5cbiAqL1xudmFyIFR5cGVhaGVhZFRva2VuaXplciA9IGNyZWF0ZVJlYWN0Q2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9wdGlvbnM6IFByb3BUeXBlcy5hcnJheSxcbiAgICBjdXN0b21DbGFzc2VzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGFsbG93Q3VzdG9tVmFsdWVzOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGRlZmF1bHRTZWxlY3RlZDogUHJvcFR5cGVzLmFycmF5LFxuICAgIGluaXRpYWxWYWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBwbGFjZWhvbGRlcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgaW5wdXRQcm9wczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBvblRva2VuUmVtb3ZlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbktleURvd246IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uS2V5UHJlc3M6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uS2V5VXA6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uVG9rZW5BZGQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRm9jdXM6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uQmx1cjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgZmlsdGVyT3B0aW9uOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBQcm9wVHlwZXMuZnVuY1xuICAgIF0pLFxuICAgIHNlYXJjaE9wdGlvbnM6IFByb3BUeXBlcy5mdW5jLFxuICAgIGRpc3BsYXlPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgZm9ybUlucHV0T3B0aW9uOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBQcm9wVHlwZXMuZnVuY1xuICAgIF0pLFxuICAgIG1heFZpc2libGU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgcmVzdWx0c1RydW5jYXRlZE1lc3NhZ2U6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgZGVmYXVsdENsYXNzTmFtZXM6IFByb3BUeXBlcy5ib29sLFxuICAgIHNob3dPcHRpb25zV2hlbkVtcHR5OiBQcm9wVHlwZXMuYm9vbCxcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBXZSBuZWVkIHRvIGNvcHkgdGhpcyB0byBhdm9pZCBpbmNvcnJlY3Qgc2hhcmluZ1xuICAgICAgLy8gb2Ygc3RhdGUgYWNyb3NzIGluc3RhbmNlcyAoZS5nLiwgdmlhIGdldERlZmF1bHRQcm9wcygpKVxuICAgICAgc2VsZWN0ZWQ6IHRoaXMucHJvcHMuZGVmYXVsdFNlbGVjdGVkLnNsaWNlKDApXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25zOiBbXSxcbiAgICAgIGRlZmF1bHRTZWxlY3RlZDogW10sXG4gICAgICBjdXN0b21DbGFzc2VzOiB7fSxcbiAgICAgIGFsbG93Q3VzdG9tVmFsdWVzOiAwLFxuICAgICAgaW5pdGlhbFZhbHVlOiBcIlwiLFxuICAgICAgcGxhY2Vob2xkZXI6IFwiXCIsXG4gICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICBpbnB1dFByb3BzOiB7fSxcbiAgICAgIGRlZmF1bHRDbGFzc05hbWVzOiB0cnVlLFxuICAgICAgZmlsdGVyT3B0aW9uOiBudWxsLFxuICAgICAgc2VhcmNoT3B0aW9uczogbnVsbCxcbiAgICAgIGRpc3BsYXlPcHRpb246IGZ1bmN0aW9uKHRva2VuKXsgcmV0dXJuIHRva2VuIH0sXG4gICAgICBmb3JtSW5wdXRPcHRpb246IG51bGwsXG4gICAgICBvbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uQmx1cjogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25Ub2tlbkFkZDogZnVuY3Rpb24oKSB7fSxcbiAgICAgIG9uVG9rZW5SZW1vdmU6IGZ1bmN0aW9uKCkge30sXG4gICAgICBzaG93T3B0aW9uc1doZW5FbXB0eTogZmFsc2UsXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpe1xuICAgIC8vIGlmIHdlIGdldCBuZXcgZGVmYXVsdFByb3BzLCB1cGRhdGUgc2VsZWN0ZWRcbiAgICBpZiAoX2FycmF5c0FyZURpZmZlcmVudCh0aGlzLnByb3BzLmRlZmF1bHRTZWxlY3RlZCwgbmV4dFByb3BzLmRlZmF1bHRTZWxlY3RlZCkpe1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWQ6IG5leHRQcm9wcy5kZWZhdWx0U2VsZWN0ZWQuc2xpY2UoMCl9KVxuICAgIH1cbiAgfSxcblxuICBmb2N1czogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlZnMudHlwZWFoZWFkLmZvY3VzKCk7XG4gIH0sXG5cbiAgZ2V0U2VsZWN0ZWRUb2tlbnM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VsZWN0ZWQ7XG4gIH0sXG5cbiAgLy8gVE9ETzogU3VwcG9ydCBpbml0aWFsaXplZCB0b2tlbnNcbiAgLy9cbiAgX3JlbmRlclRva2VuczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRva2VuQ2xhc3NlcyA9IHt9O1xuICAgIHRva2VuQ2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMudG9rZW5dID0gISF0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMudG9rZW47XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXModG9rZW5DbGFzc2VzKTtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZC5tYXAoZnVuY3Rpb24oc2VsZWN0ZWQpIHtcbiAgICAgIHZhciBkaXNwbGF5U3RyaW5nID0gQWNjZXNzb3IudmFsdWVGb3JPcHRpb24odGhpcy5wcm9wcy5kaXNwbGF5T3B0aW9uLCBzZWxlY3RlZCk7XG4gICAgICB2YXIgdmFsdWUgPSBBY2Nlc3Nvci52YWx1ZUZvck9wdGlvbih0aGlzLnByb3BzLmZvcm1JbnB1dE9wdGlvbiB8fCB0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24sIHNlbGVjdGVkKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxUb2tlbiBrZXk9e2Rpc3BsYXlTdHJpbmd9IGNsYXNzTmFtZT17Y2xhc3NMaXN0fVxuICAgICAgICAgIG9uUmVtb3ZlPXt0aGlzLl9yZW1vdmVUb2tlbkZvclZhbHVlfVxuICAgICAgICAgIG9iamVjdD17c2VsZWN0ZWR9XG4gICAgICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgICAgIG5hbWU9e3RoaXMucHJvcHMubmFtZX0+XG4gICAgICAgICAge2Rpc3BsYXlTdHJpbmd9XG4gICAgICAgIDwvVG9rZW4+XG4gICAgICApO1xuICAgIH0sIHRoaXMpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgX2dldE9wdGlvbnNGb3JUeXBlYWhlYWQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIHJldHVybiB0aGlzLnByb3BzLm9wdGlvbnMgd2l0aG91dCB0aGlzLnNlbGVjdGVkXG4gICAgcmV0dXJuIHRoaXMucHJvcHMub3B0aW9ucztcbiAgfSxcblxuICBfb25LZXlEb3duOiBmdW5jdGlvbihldmVudCkge1xuICAgIC8vIFdlIG9ubHkgY2FyZSBhYm91dCBpbnRlcmNlcHRpbmcgYmFja3NwYWNlc1xuICAgIGlmIChldmVudC5rZXlDb2RlID09PSBLZXlFdmVudC5ET01fVktfQkFDS19TUEFDRSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZUJhY2tzcGFjZShldmVudCk7XG4gICAgfVxuICAgIHRoaXMucHJvcHMub25LZXlEb3duKGV2ZW50KTtcbiAgfSxcblxuICBfaGFuZGxlQmFja3NwYWNlOiBmdW5jdGlvbihldmVudCl7XG4gICAgLy8gTm8gdG9rZW5zXG4gICAgaWYgKCF0aGlzLnN0YXRlLnNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0b2tlbiBPTkxZIHdoZW4gYmtzcCBwcmVzc2VkIGF0IGJlZ2lubmluZyBvZiBsaW5lXG4gICAgLy8gd2l0aG91dCBhIHNlbGVjdGlvblxuICAgIHZhciBlbnRyeSA9IHRoaXMucmVmcy50eXBlYWhlYWQucmVmcy5lbnRyeTtcbiAgICBpZiAoZW50cnkuc2VsZWN0aW9uU3RhcnQgPT0gZW50cnkuc2VsZWN0aW9uRW5kICYmXG4gICAgICAgIGVudHJ5LnNlbGVjdGlvblN0YXJ0ID09IDApIHtcbiAgICAgIHRoaXMuX3JlbW92ZVRva2VuRm9yVmFsdWUoXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRbdGhpcy5zdGF0ZS5zZWxlY3RlZC5sZW5ndGggLSAxXSk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfSxcblxuICBfcmVtb3ZlVG9rZW5Gb3JWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkLmluZGV4T2YodmFsdWUpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZH0pO1xuICAgIHRoaXMucHJvcHMub25Ub2tlblJlbW92ZSh2YWx1ZSk7XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIF9hZGRUb2tlbkZvclZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkLmluZGV4T2YodmFsdWUpICE9IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWQucHVzaCh2YWx1ZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWR9KTtcbiAgICB0aGlzLnJlZnMudHlwZWFoZWFkLnNldEVudHJ5VGV4dChcIlwiKTtcbiAgICB0aGlzLnByb3BzLm9uVG9rZW5BZGQodmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzZXMgPSB7fTtcbiAgICBjbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy50eXBlYWhlYWRdID0gISF0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMudHlwZWFoZWFkO1xuICAgIHZhciBjbGFzc0xpc3QgPSBjbGFzc05hbWVzKGNsYXNzZXMpO1xuICAgIHZhciB0b2tlbml6ZXJDbGFzc2VzID0gW3RoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXMgJiYgXCJ0eXBlYWhlYWQtdG9rZW5pemVyXCJdO1xuICAgIHRva2VuaXplckNsYXNzZXNbdGhpcy5wcm9wcy5jbGFzc05hbWVdID0gISF0aGlzLnByb3BzLmNsYXNzTmFtZTtcbiAgICB2YXIgdG9rZW5pemVyQ2xhc3NMaXN0ID0gY2xhc3NOYW1lcyh0b2tlbml6ZXJDbGFzc2VzKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXt0b2tlbml6ZXJDbGFzc0xpc3R9PlxuICAgICAgICB7IHRoaXMuX3JlbmRlclRva2VucygpIH1cbiAgICAgICAgPFR5cGVhaGVhZCByZWY9XCJ0eXBlYWhlYWRcIlxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NMaXN0fVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgIGlucHV0UHJvcHM9e3RoaXMucHJvcHMuaW5wdXRQcm9wc31cbiAgICAgICAgICBhbGxvd0N1c3RvbVZhbHVlcz17dGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlc31cbiAgICAgICAgICBjdXN0b21DbGFzc2VzPXt0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXN9XG4gICAgICAgICAgb3B0aW9ucz17dGhpcy5fZ2V0T3B0aW9uc0ZvclR5cGVhaGVhZCgpfVxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsVmFsdWV9XG4gICAgICAgICAgbWF4VmlzaWJsZT17dGhpcy5wcm9wcy5tYXhWaXNpYmxlfVxuICAgICAgICAgIHJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlPXt0aGlzLnByb3BzLnJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlfVxuICAgICAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ9e3RoaXMuX2FkZFRva2VuRm9yVmFsdWV9XG4gICAgICAgICAgb25LZXlEb3duPXt0aGlzLl9vbktleURvd259XG4gICAgICAgICAgb25LZXlQcmVzcz17dGhpcy5wcm9wcy5vbktleVByZXNzfVxuICAgICAgICAgIG9uS2V5VXA9e3RoaXMucHJvcHMub25LZXlVcH1cbiAgICAgICAgICBvbkZvY3VzPXt0aGlzLnByb3BzLm9uRm9jdXN9XG4gICAgICAgICAgb25CbHVyPXt0aGlzLnByb3BzLm9uQmx1cn1cbiAgICAgICAgICBkaXNwbGF5T3B0aW9uPXt0aGlzLnByb3BzLmRpc3BsYXlPcHRpb259XG4gICAgICAgICAgZGVmYXVsdENsYXNzTmFtZXM9e3RoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXN9XG4gICAgICAgICAgZmlsdGVyT3B0aW9uPXt0aGlzLnByb3BzLmZpbHRlck9wdGlvbn1cbiAgICAgICAgICBzZWFyY2hPcHRpb25zPXt0aGlzLnByb3BzLnNlYXJjaE9wdGlvbnN9XG4gICAgICAgICAgc2hvd09wdGlvbnNXaGVuRW1wdHk9e3RoaXMucHJvcHMuc2hvd09wdGlvbnNXaGVuRW1wdHl9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlYWhlYWRUb2tlbml6ZXI7XG4iXX0=
},{"../accessor":16,"../keyevent":17,"../typeahead":21,"./token":20,"classnames":1,"create-react-class":3,"prop-types":14,"react":"react"}],20:[function(require,module,exports){
var React = window.React || require('react');
var classNames = require('classnames');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = createReactClass({
  displayName: 'Token',

  propTypes: {
    className: PropTypes.string,
    name: PropTypes.string,
    children: PropTypes.string,
    object: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onRemove: PropTypes.func,
    value: PropTypes.string
  },

  render: function () {
    var className = classNames(["typeahead-token", this.props.className]);

    return React.createElement(
      'div',
      { className: className },
      this._renderHiddenInput(),
      this.props.children,
      this._renderCloseButton()
    );
  },

  _renderHiddenInput: function () {
    // If no name was set, don't create a hidden input
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name + '[]',
      value: this.props.value || this.props.object
    });
  },

  _renderCloseButton: function () {
    if (!this.props.onRemove) {
      return "";
    }
    return React.createElement(
      'a',
      { className: this.props.className || "typeahead-token-close", href: '#', onClick: function (event) {
          this.props.onRemove(this.props.object);
          event.preventDefault();
        }.bind(this) },
      '\xD7'
    );
  }
});

module.exports = Token;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRva2VuLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsImNsYXNzTmFtZXMiLCJjcmVhdGVSZWFjdENsYXNzIiwiUHJvcFR5cGVzIiwiVG9rZW4iLCJwcm9wVHlwZXMiLCJjbGFzc05hbWUiLCJzdHJpbmciLCJuYW1lIiwiY2hpbGRyZW4iLCJvYmplY3QiLCJvbmVPZlR5cGUiLCJvblJlbW92ZSIsImZ1bmMiLCJ2YWx1ZSIsInJlbmRlciIsInByb3BzIiwiX3JlbmRlckhpZGRlbklucHV0IiwiX3JlbmRlckNsb3NlQnV0dG9uIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImJpbmQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxRQUFRQyxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlDLGFBQWFELFFBQVEsWUFBUixDQUFqQjtBQUNBLElBQUlFLG1CQUFtQkYsUUFBUSxvQkFBUixDQUF2QjtBQUNBLElBQUlHLFlBQVlILFFBQVEsWUFBUixDQUFoQjs7QUFFQTs7OztBQUlBLElBQUlJLFFBQVFGLGlCQUFpQjtBQUFBOztBQUMzQkcsYUFBVztBQUNUQyxlQUFXSCxVQUFVSSxNQURaO0FBRVRDLFVBQU1MLFVBQVVJLE1BRlA7QUFHVEUsY0FBVU4sVUFBVUksTUFIWDtBQUlURyxZQUFRUCxVQUFVUSxTQUFWLENBQW9CLENBQzFCUixVQUFVSSxNQURnQixFQUUxQkosVUFBVU8sTUFGZ0IsQ0FBcEIsQ0FKQztBQVFURSxjQUFVVCxVQUFVVSxJQVJYO0FBU1RDLFdBQU9YLFVBQVVJO0FBVFIsR0FEZ0I7O0FBYTNCUSxVQUFRLFlBQVc7QUFDakIsUUFBSVQsWUFBWUwsV0FBVyxDQUN6QixpQkFEeUIsRUFFekIsS0FBS2UsS0FBTCxDQUFXVixTQUZjLENBQVgsQ0FBaEI7O0FBS0EsV0FDRTtBQUFBO0FBQUEsUUFBSyxXQUFXQSxTQUFoQjtBQUNHLFdBQUtXLGtCQUFMLEVBREg7QUFFRyxXQUFLRCxLQUFMLENBQVdQLFFBRmQ7QUFHRyxXQUFLUyxrQkFBTDtBQUhILEtBREY7QUFPRCxHQTFCMEI7O0FBNEIzQkQsc0JBQW9CLFlBQVc7QUFDN0I7QUFDQSxRQUFJLENBQUMsS0FBS0QsS0FBTCxDQUFXUixJQUFoQixFQUFzQjtBQUNwQixhQUFPLElBQVA7QUFDRDs7QUFFRCxXQUNFO0FBQ0UsWUFBSyxRQURQO0FBRUUsWUFBTyxLQUFLUSxLQUFMLENBQVdSLElBQVgsR0FBa0IsSUFGM0I7QUFHRSxhQUFRLEtBQUtRLEtBQUwsQ0FBV0YsS0FBWCxJQUFvQixLQUFLRSxLQUFMLENBQVdOO0FBSHpDLE1BREY7QUFPRCxHQXpDMEI7O0FBMkMzQlEsc0JBQW9CLFlBQVc7QUFDN0IsUUFBSSxDQUFDLEtBQUtGLEtBQUwsQ0FBV0osUUFBaEIsRUFBMEI7QUFDeEIsYUFBTyxFQUFQO0FBQ0Q7QUFDRCxXQUNFO0FBQUE7QUFBQSxRQUFHLFdBQVcsS0FBS0ksS0FBTCxDQUFXVixTQUFYLElBQXdCLHVCQUF0QyxFQUErRCxNQUFLLEdBQXBFLEVBQXdFLFNBQVMsVUFBU2EsS0FBVCxFQUFnQjtBQUM3RixlQUFLSCxLQUFMLENBQVdKLFFBQVgsQ0FBb0IsS0FBS0ksS0FBTCxDQUFXTixNQUEvQjtBQUNBUyxnQkFBTUMsY0FBTjtBQUNELFNBSDhFLENBRzdFQyxJQUg2RSxDQUd4RSxJQUh3RSxDQUFqRjtBQUFBO0FBQUEsS0FERjtBQU1EO0FBckQwQixDQUFqQixDQUFaOztBQXdEQUMsT0FBT0MsT0FBUCxHQUFpQm5CLEtBQWpCIiwiZmlsZSI6InRva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIGNyZWF0ZVJlYWN0Q2xhc3MgPSByZXF1aXJlKCdjcmVhdGUtcmVhY3QtY2xhc3MnKTtcbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIHRoZSByZW5kZXJpbmcgb2YgYW4gb3B0aW9uIHRoYXQgaGFzIGJlZW4gXCJzZWxlY3RlZFwiIGluIGFcbiAqIFR5cGVhaGVhZFRva2VuaXplclxuICovXG52YXIgVG9rZW4gPSBjcmVhdGVSZWFjdENsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgb2JqZWN0OiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBQcm9wVHlwZXMub2JqZWN0LFxuICAgIF0pLFxuICAgIG9uUmVtb3ZlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB2YWx1ZTogUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzTmFtZXMoW1xuICAgICAgXCJ0eXBlYWhlYWQtdG9rZW5cIixcbiAgICAgIHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgXSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZX0+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJIaWRkZW5JbnB1dCgpfVxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAge3RoaXMuX3JlbmRlckNsb3NlQnV0dG9uKCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG4gIF9yZW5kZXJIaWRkZW5JbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgLy8gSWYgbm8gbmFtZSB3YXMgc2V0LCBkb24ndCBjcmVhdGUgYSBoaWRkZW4gaW5wdXRcbiAgICBpZiAoIXRoaXMucHJvcHMubmFtZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxpbnB1dFxuICAgICAgICB0eXBlPVwiaGlkZGVuXCJcbiAgICAgICAgbmFtZT17IHRoaXMucHJvcHMubmFtZSArICdbXScgfVxuICAgICAgICB2YWx1ZT17IHRoaXMucHJvcHMudmFsdWUgfHwgdGhpcy5wcm9wcy5vYmplY3QgfVxuICAgICAgLz5cbiAgICApO1xuICB9LFxuXG4gIF9yZW5kZXJDbG9zZUJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uUmVtb3ZlKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxhIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWUgfHwgXCJ0eXBlYWhlYWQtdG9rZW4tY2xvc2VcIn0gaHJlZj1cIiNcIiBvbkNsaWNrPXtmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5vYmplY3QpO1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKX0+JiN4MDBkNzs8L2E+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9rZW47XG4iXX0=
},{"classnames":1,"create-react-class":3,"prop-types":14,"react":"react"}],21:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Accessor = require('../accessor');
var React = window.React || require('react');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');
var classNames = require('classnames');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = createReactClass({
  displayName: 'Typeahead',

  propTypes: {
    name: PropTypes.string,
    customClasses: PropTypes.object,
    maxVisible: PropTypes.number,
    resultsTruncatedMessage: PropTypes.string,
    options: PropTypes.array,
    allowCustomValues: PropTypes.number,
    initialValue: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    textarea: PropTypes.bool,
    inputProps: PropTypes.object,
    onOptionSelected: PropTypes.func,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyPress: PropTypes.func,
    onKeyUp: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    filterOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    searchOptions: PropTypes.func,
    displayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    inputDisplayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    formInputOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    defaultClassNames: PropTypes.bool,
    customListComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    showOptionsWhenEmpty: PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      options: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      value: "",
      placeholder: "",
      disabled: false,
      textarea: false,
      inputProps: {},
      onOptionSelected: function (option) {},
      onChange: function (event) {},
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      filterOption: null,
      searchOptions: null,
      inputDisplayOption: null,
      defaultClassNames: true,
      customListComponent: TypeaheadSelector,
      showOptionsWhenEmpty: false,
      resultsTruncatedMessage: null
    };
  },

  getInitialState: function () {
    return {
      // The options matching the entry value
      searchResults: this.getOptionsForValue(this.props.initialValue, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.value || this.props.initialValue,

      // A valid typeahead value
      selection: this.props.value,

      // Index of the selection
      selectionIndex: null,

      // Keep track of the focus state of the input element, to determine
      // whether to show options when empty (if showOptionsWhenEmpty is true)
      isFocused: false,

      // true when focused, false onOptionSelected
      showResults: false
    };
  },

  _shouldSkipSearch: function (input) {
    var emptyValue = !input || input.trim().length == 0;

    // this.state must be checked because it may not be defined yet if this function
    // is called from within getInitialState
    var isFocused = this.state && this.state.isFocused;
    return !(this.props.showOptionsWhenEmpty && isFocused) && emptyValue;
  },

  getOptionsForValue: function (value, options) {
    if (this._shouldSkipSearch(value)) {
      return [];
    }

    var searchOptions = this._generateSearchFunction();
    return searchOptions(value, options);
  },

  setEntryText: function (value) {
    this.refs.entry.value = value;
    this._onTextEntryUpdated();
  },

  focus: function () {
    this.refs.entry.focus();
  },

  _hasCustomValue: function () {
    if (this.props.allowCustomValues > 0 && this.state.entryValue.length >= this.props.allowCustomValues && this.state.searchResults.indexOf(this.state.entryValue) < 0) {
      return true;
    }
    return false;
  },

  _getCustomValue: function () {
    if (this._hasCustomValue()) {
      return this.state.entryValue;
    }
    return null;
  },

  _renderIncrementalSearchResults: function () {
    // Nothing has been entered into the textbox
    if (this._shouldSkipSearch(this.state.entryValue)) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    return React.createElement(this.props.customListComponent, {
      ref: 'sel', options: this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible) : this.state.searchResults,
      areResultsTruncated: this.props.maxVisible && this.state.searchResults.length > this.props.maxVisible,
      resultsTruncatedMessage: this.props.resultsTruncatedMessage,
      onOptionSelected: this._onOptionSelected,
      allowCustomValues: this.props.allowCustomValues,
      customValue: this._getCustomValue(),
      customClasses: this.props.customClasses,
      selectionIndex: this.state.selectionIndex,
      defaultClassNames: this.props.defaultClassNames,
      displayOption: Accessor.generateOptionToStringFor(this.props.displayOption) });
  },

  getSelection: function () {
    var index = this.state.selectionIndex;
    if (this._hasCustomValue()) {
      if (index === 0) {
        return this.state.entryValue;
      } else {
        index--;
      }
    }
    return this.state.searchResults[index];
  },

  _onOptionSelected: function (option, event) {
    var nEntry = this.refs.entry;
    nEntry.focus();

    var displayOption = Accessor.generateOptionToStringFor(this.props.inputDisplayOption || this.props.displayOption);
    var optionString = displayOption(option, 0);

    var formInputOption = Accessor.generateOptionToStringFor(this.props.formInputOption || displayOption);
    var formInputOptionString = formInputOption(option);

    nEntry.value = optionString;
    this.setState({ searchResults: this.getOptionsForValue(optionString, this.props.options),
      selection: formInputOptionString,
      entryValue: optionString,
      showResults: false });
    return this.props.onOptionSelected(option, event);
  },

  _onTextEntryUpdated: function () {
    var value = this.refs.entry.value;
    this.setState({ searchResults: this.getOptionsForValue(value, this.props.options),
      selection: '',
      entryValue: value });
  },

  _onEnter: function (event) {
    var selection = this.getSelection();
    if (!selection) {
      return this.props.onKeyDown(event);
    }
    return this._onOptionSelected(selection, event);
  },

  _onEscape: function () {
    this.setState({
      selectionIndex: null
    });
  },

  _onTab: function (event) {
    var selection = this.getSelection();
    var option = selection ? selection : this.state.searchResults.length > 0 ? this.state.searchResults[0] : null;

    if (option === null && this._hasCustomValue()) {
      option = this._getCustomValue();
    }

    if (option !== null) {
      return this._onOptionSelected(option, event);
    }
  },

  eventMap: function (event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  },

  _nav: function (delta) {
    if (!this._hasHint()) {
      return;
    }
    var newIndex = this.state.selectionIndex === null ? delta == 1 ? 0 : delta : this.state.selectionIndex + delta;
    var length = this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible).length : this.state.searchResults.length;
    if (this._hasCustomValue()) {
      length += 1;
    }

    if (newIndex < 0) {
      newIndex += length;
    } else if (newIndex >= length) {
      newIndex -= length;
    }

    this.setState({ selectionIndex: newIndex });
  },

  navDown: function () {
    this._nav(1);
  },

  navUp: function () {
    this._nav(-1);
  },

  _onChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }

    this._onTextEntryUpdated();
  },

  _onKeyDown: function (event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler.
    // Also skip if the user is pressing the shift key, since none of our handlers are looking for shift
    if (!this._hasHint() || event.shiftKey) {
      return this.props.onKeyDown(event);
    }

    var handler = this.eventMap()[event.keyCode];

    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  },

  componentWillReceiveProps: function (nextProps) {
    var searchResults = this.getOptionsForValue(this.state.entryValue, nextProps.options);
    var showResults = Boolean(searchResults.length) && this.state.isFocused;
    this.setState({
      searchResults: searchResults,
      showResults: showResults
    });
  },

  render: function () {
    var inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: this.props.defaultClassNames
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    var InputElement = this.props.textarea ? 'textarea' : 'input';
    return React.createElement(
      'div',
      { className: classList },
      this._renderHiddenInput(),
      React.createElement(InputElement, _extends({ ref: 'entry', type: 'text',
        disabled: this.props.disabled
      }, this.props.inputProps, {
        placeholder: this.props.placeholder,
        className: inputClassList,
        value: this.state.entryValue,
        onChange: this._onChange,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this._onFocus,
        onBlur: this._onBlur
      })),
      this.state.showResults && this._renderIncrementalSearchResults()
    );
  },

  _onFocus: function (event) {
    this.setState({ isFocused: true, showResults: true }, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if (this.props.onFocus) {
      return this.props.onFocus(event);
    }
  },

  _onBlur: function (event) {
    this.setState({ isFocused: false }, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if (this.props.onBlur) {
      return this.props.onBlur(event);
    }
  },

  _renderHiddenInput: function () {
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name,
      value: this.state.selection
    });
  },

  _generateSearchFunction: function () {
    var searchOptionsProp = this.props.searchOptions;
    var filterOptionProp = this.props.filterOption;
    if (typeof searchOptionsProp === 'function') {
      if (filterOptionProp !== null) {
        console.warn('searchOptions prop is being used, filterOption prop will be ignored');
      }
      return searchOptionsProp;
    } else if (typeof filterOptionProp === 'function') {
      return function (value, options) {
        return options.filter(function (o) {
          return filterOptionProp(value, o);
        });
      };
    } else {
      var mapper;
      if (typeof filterOptionProp === 'string') {
        mapper = Accessor.generateAccessor(filterOptionProp);
      } else {
        mapper = Accessor.IDENTITY_FN;
      }
      return function (value, options) {
        return fuzzy.filter(value, options, { extract: mapper }).map(function (res) {
          return options[res.index];
        });
      };
    }
  },

  _hasHint: function () {
    return this.state.searchResults.length > 0 || this._hasCustomValue();
  }
});

module.exports = Typeahead;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiVHlwZWFoZWFkU2VsZWN0b3IiLCJLZXlFdmVudCIsImZ1enp5IiwiY2xhc3NOYW1lcyIsImNyZWF0ZVJlYWN0Q2xhc3MiLCJQcm9wVHlwZXMiLCJUeXBlYWhlYWQiLCJwcm9wVHlwZXMiLCJuYW1lIiwic3RyaW5nIiwiY3VzdG9tQ2xhc3NlcyIsIm9iamVjdCIsIm1heFZpc2libGUiLCJudW1iZXIiLCJyZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZSIsIm9wdGlvbnMiLCJhcnJheSIsImFsbG93Q3VzdG9tVmFsdWVzIiwiaW5pdGlhbFZhbHVlIiwidmFsdWUiLCJwbGFjZWhvbGRlciIsImRpc2FibGVkIiwiYm9vbCIsInRleHRhcmVhIiwiaW5wdXRQcm9wcyIsIm9uT3B0aW9uU2VsZWN0ZWQiLCJmdW5jIiwib25DaGFuZ2UiLCJvbktleURvd24iLCJvbktleVByZXNzIiwib25LZXlVcCIsIm9uRm9jdXMiLCJvbkJsdXIiLCJmaWx0ZXJPcHRpb24iLCJvbmVPZlR5cGUiLCJzZWFyY2hPcHRpb25zIiwiZGlzcGxheU9wdGlvbiIsImlucHV0RGlzcGxheU9wdGlvbiIsImZvcm1JbnB1dE9wdGlvbiIsImRlZmF1bHRDbGFzc05hbWVzIiwiY3VzdG9tTGlzdENvbXBvbmVudCIsImVsZW1lbnQiLCJzaG93T3B0aW9uc1doZW5FbXB0eSIsImdldERlZmF1bHRQcm9wcyIsIm9wdGlvbiIsImV2ZW50IiwiZ2V0SW5pdGlhbFN0YXRlIiwic2VhcmNoUmVzdWx0cyIsImdldE9wdGlvbnNGb3JWYWx1ZSIsInByb3BzIiwiZW50cnlWYWx1ZSIsInNlbGVjdGlvbiIsInNlbGVjdGlvbkluZGV4IiwiaXNGb2N1c2VkIiwic2hvd1Jlc3VsdHMiLCJfc2hvdWxkU2tpcFNlYXJjaCIsImlucHV0IiwiZW1wdHlWYWx1ZSIsInRyaW0iLCJsZW5ndGgiLCJzdGF0ZSIsIl9nZW5lcmF0ZVNlYXJjaEZ1bmN0aW9uIiwic2V0RW50cnlUZXh0IiwicmVmcyIsImVudHJ5IiwiX29uVGV4dEVudHJ5VXBkYXRlZCIsImZvY3VzIiwiX2hhc0N1c3RvbVZhbHVlIiwiaW5kZXhPZiIsIl9nZXRDdXN0b21WYWx1ZSIsIl9yZW5kZXJJbmNyZW1lbnRhbFNlYXJjaFJlc3VsdHMiLCJzbGljZSIsIl9vbk9wdGlvblNlbGVjdGVkIiwiZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0ZvciIsImdldFNlbGVjdGlvbiIsImluZGV4IiwibkVudHJ5Iiwib3B0aW9uU3RyaW5nIiwiZm9ybUlucHV0T3B0aW9uU3RyaW5nIiwic2V0U3RhdGUiLCJfb25FbnRlciIsIl9vbkVzY2FwZSIsIl9vblRhYiIsImV2ZW50TWFwIiwiZXZlbnRzIiwiRE9NX1ZLX1VQIiwibmF2VXAiLCJET01fVktfRE9XTiIsIm5hdkRvd24iLCJET01fVktfUkVUVVJOIiwiRE9NX1ZLX0VOVEVSIiwiRE9NX1ZLX0VTQ0FQRSIsIkRPTV9WS19UQUIiLCJfbmF2IiwiZGVsdGEiLCJfaGFzSGludCIsIm5ld0luZGV4IiwiX29uQ2hhbmdlIiwiX29uS2V5RG93biIsInNoaWZ0S2V5IiwiaGFuZGxlciIsImtleUNvZGUiLCJwcmV2ZW50RGVmYXVsdCIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJCb29sZWFuIiwicmVuZGVyIiwiaW5wdXRDbGFzc2VzIiwiaW5wdXRDbGFzc0xpc3QiLCJjbGFzc2VzIiwidHlwZWFoZWFkIiwiY2xhc3NOYW1lIiwiY2xhc3NMaXN0IiwiSW5wdXRFbGVtZW50IiwiX3JlbmRlckhpZGRlbklucHV0IiwiX29uRm9jdXMiLCJfb25CbHVyIiwiYmluZCIsInNlYXJjaE9wdGlvbnNQcm9wIiwiZmlsdGVyT3B0aW9uUHJvcCIsImNvbnNvbGUiLCJ3YXJuIiwiZmlsdGVyIiwibyIsIm1hcHBlciIsImdlbmVyYXRlQWNjZXNzb3IiLCJJREVOVElUWV9GTiIsImV4dHJhY3QiLCJtYXAiLCJyZXMiLCJtb2R1bGUiLCJleHBv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T0osaUJBQWlCcEcsS0FBakIsRUFBd0J3RyxDQUF4QixDQUFQO0FBQW9DLFNBQWpFLENBQVA7QUFDRCxPQUZEO0FBR0QsS0FKTSxNQUlBO0FBQ0wsVUFBSUMsTUFBSjtBQUNBLFVBQUksT0FBT0wsZ0JBQVAsS0FBNEIsUUFBaEMsRUFBMEM7QUFDeENLLGlCQUFTL0gsU0FBU2dJLGdCQUFULENBQTBCTixnQkFBMUIsQ0FBVDtBQUNELE9BRkQsTUFFTztBQUNMSyxpQkFBUy9ILFNBQVNpSSxXQUFsQjtBQUNEO0FBQ0QsYUFBTyxVQUFTM0csS0FBVCxFQUFnQkosT0FBaEIsRUFBeUI7QUFDOUIsZUFBT2IsTUFDSndILE1BREksQ0FDR3ZHLEtBREgsRUFDVUosT0FEVixFQUNtQixFQUFDZ0gsU0FBU0gsTUFBVixFQURuQixFQUVKSSxHQUZJLENBRUEsVUFBU0MsR0FBVCxFQUFjO0FBQUUsaUJBQU9sSCxRQUFRa0gsSUFBSXRELEtBQVosQ0FBUDtBQUE0QixTQUY1QyxDQUFQO0FBR0QsT0FKRDtBQUtEO0FBQ0YsR0ExWThCOztBQTRZL0JvQixZQUFVLFlBQVc7QUFDbkIsV0FBTyxLQUFLbkMsS0FBTCxDQUFXYixhQUFYLENBQXlCWSxNQUF6QixHQUFrQyxDQUFsQyxJQUF1QyxLQUFLUSxlQUFMLEVBQTlDO0FBQ0Q7QUE5WThCLENBQWpCLENBQWhCOztBQWlaQStELE9BQU9DLE9BQVAsR0FBaUI3SCxTQUFqQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBY2Nlc3NvciA9IHJlcXVpcmUoJy4uL2FjY2Vzc29yJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFR5cGVhaGVhZFNlbGVjdG9yID0gcmVxdWlyZSgnLi9zZWxlY3RvcicpO1xudmFyIEtleUV2ZW50ID0gcmVxdWlyZSgnLi4va2V5ZXZlbnQnKTtcbnZhciBmdXp6eSA9IHJlcXVpcmUoJ2Z1enp5Jyk7XG52YXIgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBjcmVhdGVSZWFjdENsYXNzID0gcmVxdWlyZSgnY3JlYXRlLXJlYWN0LWNsYXNzJyk7XG52YXIgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG4vKipcbiAqIEEgXCJ0eXBlYWhlYWRcIiwgYW4gYXV0by1jb21wbGV0aW5nIHRleHQgaW5wdXRcbiAqXG4gKiBSZW5kZXJzIGFuIHRleHQgaW5wdXQgdGhhdCBzaG93cyBvcHRpb25zIG5lYXJieSB0aGF0IHlvdSBjYW4gdXNlIHRoZVxuICoga2V5Ym9hcmQgb3IgbW91c2UgdG8gc2VsZWN0LiAgUmVxdWlyZXMgQ1NTIGZvciBNQVNTSVZFIERBTUFHRS5cbiAqL1xudmFyIFR5cGVhaGVhZCA9IGNyZWF0ZVJlYWN0Q2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGN1c3RvbUNsYXNzZXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgbWF4VmlzaWJsZTogUHJvcFR5cGVzLm51bWJlcixcbiAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBvcHRpb25zOiBQcm9wVHlwZXMuYXJyYXksXG4gICAgYWxsb3dDdXN0b21WYWx1ZXM6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB0ZXh0YXJlYTogUHJvcFR5cGVzLmJvb2wsXG4gICAgaW5wdXRQcm9wczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBvbk9wdGlvblNlbGVjdGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlEb3duOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbktleVByZXNzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbktleVVwOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkZvY3VzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIGZpbHRlck9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUHJvcFR5cGVzLmZ1bmNcbiAgICBdKSxcbiAgICBzZWFyY2hPcHRpb25zOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBkaXNwbGF5T3B0aW9uOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBQcm9wVHlwZXMuZnVuY1xuICAgIF0pLFxuICAgIGlucHV0RGlzcGxheU9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUHJvcFR5cGVzLmZ1bmNcbiAgICBdKSxcbiAgICBmb3JtSW5wdXRPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgZGVmYXVsdENsYXNzTmFtZXM6IFByb3BUeXBlcy5ib29sLFxuICAgIGN1c3RvbUxpc3RDb21wb25lbnQ6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUHJvcFR5cGVzLmVsZW1lbnQsXG4gICAgICBQcm9wVHlwZXMuZnVuY1xuICAgIF0pLFxuICAgIHNob3dPcHRpb25zV2hlbkVtcHR5OiBQcm9wVHlwZXMuYm9vbFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgY3VzdG9tQ2xhc3Nlczoge30sXG4gICAgICBhbGxvd0N1c3RvbVZhbHVlczogMCxcbiAgICAgIGluaXRpYWxWYWx1ZTogXCJcIixcbiAgICAgIHZhbHVlOiBcIlwiLFxuICAgICAgcGxhY2Vob2xkZXI6IFwiXCIsXG4gICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICB0ZXh0YXJlYTogZmFsc2UsXG4gICAgICBpbnB1dFByb3BzOiB7fSxcbiAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ6IGZ1bmN0aW9uKG9wdGlvbikge30sXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25LZXlEb3duOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbktleVByZXNzOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbktleVVwOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbkZvY3VzOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbkJsdXI6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIGZpbHRlck9wdGlvbjogbnVsbCxcbiAgICAgIHNlYXJjaE9wdGlvbnM6IG51bGwsXG4gICAgICBpbnB1dERpc3BsYXlPcHRpb246IG51bGwsXG4gICAgICBkZWZhdWx0Q2xhc3NOYW1lczogdHJ1ZSxcbiAgICAgIGN1c3RvbUxpc3RDb21wb25lbnQ6IFR5cGVhaGVhZFNlbGVjdG9yLFxuICAgICAgc2hvd09wdGlvbnNXaGVuRW1wdHk6IGZhbHNlLFxuICAgICAgcmVzdWx0c1RydW5jYXRlZE1lc3NhZ2U6IG51bGxcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFRoZSBvcHRpb25zIG1hdGNoaW5nIHRoZSBlbnRyeSB2YWx1ZVxuICAgICAgc2VhcmNoUmVzdWx0czogdGhpcy5nZXRPcHRpb25zRm9yVmFsdWUodGhpcy5wcm9wcy5pbml0aWFsVmFsdWUsIHRoaXMucHJvcHMub3B0aW9ucyksXG5cbiAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCBzb21ldGhpbmcgZWxzZSwgXCJlbnRyeVZhbHVlXCJcbiAgICAgIGVudHJ5VmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfHwgdGhpcy5wcm9wcy5pbml0aWFsVmFsdWUsXG5cbiAgICAgIC8vIEEgdmFsaWQgdHlwZWFoZWFkIHZhbHVlXG4gICAgICBzZWxlY3Rpb246IHRoaXMucHJvcHMudmFsdWUsXG5cbiAgICAgIC8vIEluZGV4IG9mIHRoZSBzZWxlY3Rpb25cbiAgICAgIHNlbGVjdGlvbkluZGV4OiBudWxsLFxuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBmb2N1cyBzdGF0ZSBvZiB0aGUgaW5wdXQgZWxlbWVudCwgdG8gZGV0ZXJtaW5lXG4gICAgICAvLyB3aGV0aGVyIHRvIHNob3cgb3B0aW9ucyB3aGVuIGVtcHR5IChpZiBzaG93T3B0aW9uc1doZW5FbXB0eSBpcyB0cnVlKVxuICAgICAgaXNGb2N1c2VkOiBmYWxzZSxcblxuICAgICAgLy8gdHJ1ZSB3aGVuIGZvY3VzZWQsIGZhbHNlIG9uT3B0aW9uU2VsZWN0ZWRcbiAgICAgIHNob3dSZXN1bHRzOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgX3Nob3VsZFNraXBTZWFyY2g6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgdmFyIGVtcHR5VmFsdWUgPSAhaW5wdXQgfHwgaW5wdXQudHJpbSgpLmxlbmd0aCA9PSAwO1xuXG4gICAgLy8gdGhpcy5zdGF0ZSBtdXN0IGJlIGNoZWNrZWQgYmVjYXVzZSBpdCBtYXkgbm90IGJlIGRlZmluZWQgeWV0IGlmIHRoaXMgZnVuY3Rpb25cbiAgICAvLyBpcyBjYWxsZWQgZnJvbSB3aXRoaW4gZ2V0SW5pdGlhbFN0YXRlXG4gICAgdmFyIGlzRm9jdXNlZCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5pc0ZvY3VzZWQ7XG4gICAgcmV0dXJuICEodGhpcy5wcm9wcy5zaG93T3B0aW9uc1doZW5FbXB0eSAmJiBpc0ZvY3VzZWQpICYmIGVtcHR5VmFsdWU7XG4gIH0sXG5cbiAgZ2V0T3B0aW9uc0ZvclZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLl9zaG91bGRTa2lwU2VhcmNoKHZhbHVlKSkgeyByZXR1cm4gW107IH1cblxuICAgIHZhciBzZWFyY2hPcHRpb25zID0gdGhpcy5fZ2VuZXJhdGVTZWFyY2hGdW5jdGlvbigpO1xuICAgIHJldHVybiBzZWFyY2hPcHRpb25zKHZhbHVlLCBvcHRpb25zKTtcbiAgfSxcblxuICBzZXRFbnRyeVRleHQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdGhpcy5yZWZzLmVudHJ5LnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5fb25UZXh0RW50cnlVcGRhdGVkKCk7XG4gIH0sXG5cbiAgZm9jdXM6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5yZWZzLmVudHJ5LmZvY3VzKClcbiAgfSxcblxuICBfaGFzQ3VzdG9tVmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzID4gMCAmJlxuICAgICAgdGhpcy5zdGF0ZS5lbnRyeVZhbHVlLmxlbmd0aCA+PSB0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzICYmXG4gICAgICB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMuaW5kZXhPZih0aGlzLnN0YXRlLmVudHJ5VmFsdWUpIDwgMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICBfZ2V0Q3VzdG9tVmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5lbnRyeVZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICBfcmVuZGVySW5jcmVtZW50YWxTZWFyY2hSZXN1bHRzOiBmdW5jdGlvbigpIHtcbiAgICAvLyBOb3RoaW5nIGhhcyBiZWVuIGVudGVyZWQgaW50byB0aGUgdGV4dGJveFxuICAgIGlmICh0aGlzLl9zaG91bGRTa2lwU2VhcmNoKHRoaXMuc3RhdGUuZW50cnlWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8vIFNvbWV0aGluZyB3YXMganVzdCBzZWxlY3RlZFxuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGlvbikge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDx0aGlzLnByb3BzLmN1c3RvbUxpc3RDb21wb25lbnRcbiAgICAgICAgcmVmPVwic2VsXCIgb3B0aW9ucz17dGhpcy5wcm9wcy5tYXhWaXNpYmxlID8gdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzLnNsaWNlKDAsIHRoaXMucHJvcHMubWF4VmlzaWJsZSkgOiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHN9XG4gICAgICAgIGFyZVJlc3VsdHNUcnVuY2F0ZWQ9e3RoaXMucHJvcHMubWF4VmlzaWJsZSAmJiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMubGVuZ3RoID4gdGhpcy5wcm9wcy5tYXhWaXNpYmxlfVxuICAgICAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZT17dGhpcy5wcm9wcy5yZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZX1cbiAgICAgICAgb25PcHRpb25TZWxlY3RlZD17dGhpcy5fb25PcHRpb25TZWxlY3RlZH1cbiAgICAgICAgYWxsb3dDdXN0b21WYWx1ZXM9e3RoaXMucHJvcHMuYWxsb3dDdXN0b21WYWx1ZXN9XG4gICAgICAgIGN1c3RvbVZhbHVlPXt0aGlzLl9nZXRDdXN0b21WYWx1ZSgpfVxuICAgICAgICBjdXN0b21DbGFzc2VzPXt0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXN9XG4gICAgICAgIHNlbGVjdGlvbkluZGV4PXt0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4fVxuICAgICAgICBkZWZhdWx0Q2xhc3NOYW1lcz17dGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc31cbiAgICAgICAgZGlzcGxheU9wdGlvbj17QWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0Zvcih0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24pfSAvPlxuICAgICk7XG4gIH0sXG5cbiAgZ2V0U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4O1xuICAgIGlmICh0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZW50cnlWYWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4LS07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHNbaW5kZXhdO1xuICB9LFxuXG4gIF9vbk9wdGlvblNlbGVjdGVkOiBmdW5jdGlvbihvcHRpb24sIGV2ZW50KSB7XG4gICAgdmFyIG5FbnRyeSA9IHRoaXMucmVmcy5lbnRyeTtcbiAgICBuRW50cnkuZm9jdXMoKTtcblxuICAgIHZhciBkaXNwbGF5T3B0aW9uID0gQWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0Zvcih0aGlzLnByb3BzLmlucHV0RGlzcGxheU9wdGlvbiB8fCB0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24pO1xuICAgIHZhciBvcHRpb25TdHJpbmcgPSBkaXNwbGF5T3B0aW9uKG9wdGlvbiwgMCk7XG5cbiAgICB2YXIgZm9ybUlucHV0T3B0aW9uID0gQWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0Zvcih0aGlzLnByb3BzLmZvcm1JbnB1dE9wdGlvbiB8fCBkaXNwbGF5T3B0aW9uKTtcbiAgICB2YXIgZm9ybUlucHV0T3B0aW9uU3RyaW5nID0gZm9ybUlucHV0T3B0aW9uKG9wdGlvbik7XG5cbiAgICBuRW50cnkudmFsdWUgPSBvcHRpb25TdHJpbmc7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VhcmNoUmVzdWx0czogdGhpcy5nZXRPcHRpb25zRm9yVmFsdWUob3B0aW9uU3RyaW5nLCB0aGlzLnByb3BzLm9wdGlvbnMpLFxuICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbjogZm9ybUlucHV0T3B0aW9uU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgIGVudHJ5VmFsdWU6IG9wdGlvblN0cmluZyxcbiAgICAgICAgICAgICAgICAgICBzaG93UmVzdWx0czogZmFsc2V9KTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbk9wdGlvblNlbGVjdGVkKG9wdGlvbiwgZXZlbnQpO1xuICB9LFxuXG4gIF9vblRleHRFbnRyeVVwZGF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMucmVmcy5lbnRyeS52YWx1ZTtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWFyY2hSZXN1bHRzOiB0aGlzLmdldE9wdGlvbnNGb3JWYWx1ZSh2YWx1ZSwgdGhpcy5wcm9wcy5vcHRpb25zKSxcbiAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb246ICcnLFxuICAgICAgICAgICAgICAgICAgIGVudHJ5VmFsdWU6IHZhbHVlfSk7XG4gIH0sXG5cbiAgX29uRW50ZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgaWYgKCFzZWxlY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uS2V5RG93bihldmVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vbk9wdGlvblNlbGVjdGVkKHNlbGVjdGlvbiwgZXZlbnQpO1xuICB9LFxuXG4gIF9vbkVzY2FwZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3Rpb25JbmRleDogbnVsbFxuICAgIH0pO1xuICB9LFxuXG4gIF9vblRhYjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgc2VsZWN0aW9uID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICB2YXIgb3B0aW9uID0gc2VsZWN0aW9uID9cbiAgICAgIHNlbGVjdGlvbiA6ICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMubGVuZ3RoID4gMCA/IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0c1swXSA6IG51bGwpO1xuXG4gICAgaWYgKG9wdGlvbiA9PT0gbnVsbCAmJiB0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICBvcHRpb24gPSB0aGlzLl9nZXRDdXN0b21WYWx1ZSgpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb24gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vbk9wdGlvblNlbGVjdGVkKG9wdGlvbiwgZXZlbnQpO1xuICAgIH1cbiAgfSxcblxuICBldmVudE1hcDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZXZlbnRzID0ge307XG5cbiAgICBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX1VQXSA9IHRoaXMubmF2VXA7XG4gICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19ET1dOXSA9IHRoaXMubmF2RG93bjtcbiAgICBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX1JFVFVSTl0gPSBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX0VOVEVSXSA9IHRoaXMuX29uRW50ZXI7XG4gICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19FU0NBUEVdID0gdGhpcy5fb25Fc2NhcGU7XG4gICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19UQUJdID0gdGhpcy5fb25UYWI7XG5cbiAgICByZXR1cm4gZXZlbnRzO1xuICB9LFxuXG4gIF9uYXY6IGZ1bmN0aW9uKGRlbHRhKSB7XG4gICAgaWYgKCF0aGlzLl9oYXNIaW50KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG5ld0luZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleCA9PT0gbnVsbCA/IChkZWx0YSA9PSAxID8gMCA6IGRlbHRhKSA6IHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXggKyBkZWx0YTtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5wcm9wcy5tYXhWaXNpYmxlID8gdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzLnNsaWNlKDAsIHRoaXMucHJvcHMubWF4VmlzaWJsZSkubGVuZ3RoIDogdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzLmxlbmd0aDtcbiAgICBpZiAodGhpcy5faGFzQ3VzdG9tVmFsdWUoKSkge1xuICAgICAgbGVuZ3RoICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKG5ld0luZGV4IDwgMCkge1xuICAgICAgbmV3SW5kZXggKz0gbGVuZ3RoO1xuICAgIH0gZWxzZSBpZiAobmV3SW5kZXggPj0gbGVuZ3RoKSB7XG4gICAgICBuZXdJbmRleCAtPSBsZW5ndGg7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0aW9uSW5kZXg6IG5ld0luZGV4fSk7XG4gIH0sXG5cbiAgbmF2RG93bjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbmF2KDEpO1xuICB9LFxuXG4gIG5hdlVwOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9uYXYoLTEpO1xuICB9LFxuXG4gIF9vbkNoYW5nZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb25UZXh0RW50cnlVcGRhdGVkKCk7XG4gIH0sXG5cbiAgX29uS2V5RG93bjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gdmlzaWJsZSBlbGVtZW50cywgZG9uJ3QgcGVyZm9ybSBzZWxlY3RvciBuYXZpZ2F0aW9uLlxuICAgIC8vIEp1c3QgcGFzcyB0aGlzIHVwIHRvIHRoZSB1cHN0cmVhbSBvbktleWRvd24gaGFuZGxlci5cbiAgICAvLyBBbHNvIHNraXAgaWYgdGhlIHVzZXIgaXMgcHJlc3NpbmcgdGhlIHNoaWZ0IGtleSwgc2luY2Ugbm9uZSBvZiBvdXIgaGFuZGxlcnMgYXJlIGxvb2tpbmcgZm9yIHNoaWZ0XG4gICAgaWYgKCF0aGlzLl9oYXNIaW50KCkgfHwgZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uS2V5RG93bihldmVudCk7XG4gICAgfVxuXG4gICAgdmFyIGhhbmRsZXIgPSB0aGlzLmV2ZW50TWFwKClbZXZlbnQua2V5Q29kZV07XG5cbiAgICBpZiAoaGFuZGxlcikge1xuICAgICAgaGFuZGxlcihldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uS2V5RG93bihldmVudCk7XG4gICAgfVxuICAgIC8vIERvbid0IHByb3BhZ2F0ZSB0aGUga2V5c3Ryb2tlIGJhY2sgdG8gdGhlIERPTS9icm93c2VyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB2YXIgc2VhcmNoUmVzdWx0cyA9IHRoaXMuZ2V0T3B0aW9uc0ZvclZhbHVlKHRoaXMuc3RhdGUuZW50cnlWYWx1ZSwgbmV4dFByb3BzLm9wdGlvbnMpO1xuICAgIHZhciBzaG93UmVzdWx0cyA9IEJvb2xlYW4oc2VhcmNoUmVzdWx0cy5sZW5ndGgpICYmIHRoaXMuc3RhdGUuaXNGb2N1c2VkO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VhcmNoUmVzdWx0czogc2VhcmNoUmVzdWx0cyxcbiAgICAgIHNob3dSZXN1bHRzOiBzaG93UmVzdWx0c1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlucHV0Q2xhc3NlcyA9IHt9O1xuICAgIGlucHV0Q2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMuaW5wdXRdID0gISF0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMuaW5wdXQ7XG4gICAgdmFyIGlucHV0Q2xhc3NMaXN0ID0gY2xhc3NOYW1lcyhpbnB1dENsYXNzZXMpO1xuXG4gICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICB0eXBlYWhlYWQ6IHRoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXNcbiAgICB9O1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jbGFzc05hbWVdID0gISF0aGlzLnByb3BzLmNsYXNzTmFtZTtcbiAgICB2YXIgY2xhc3NMaXN0ID0gY2xhc3NOYW1lcyhjbGFzc2VzKTtcblxuICAgIHZhciBJbnB1dEVsZW1lbnQgPSB0aGlzLnByb3BzLnRleHRhcmVhID8gJ3RleHRhcmVhJyA6ICdpbnB1dCc7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc0xpc3R9PlxuICAgICAgICB7IHRoaXMuX3JlbmRlckhpZGRlbklucHV0KCkgfVxuICAgICAgICA8SW5wdXRFbGVtZW50IHJlZj1cImVudHJ5XCIgdHlwZT1cInRleHRcIlxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgIHsuLi50aGlzLnByb3BzLmlucHV0UHJvcHN9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgY2xhc3NOYW1lPXtpbnB1dENsYXNzTGlzdH1cbiAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5lbnRyeVZhbHVlfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZX1cbiAgICAgICAgICBvbktleURvd249e3RoaXMuX29uS2V5RG93bn1cbiAgICAgICAgICBvbktleVByZXNzPXt0aGlzLnByb3BzLm9uS2V5UHJlc3N9XG4gICAgICAgICAgb25LZXlVcD17dGhpcy5wcm9wcy5vbktleVVwfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMuX29uRm9jdXN9XG4gICAgICAgICAgb25CbHVyPXt0aGlzLl9vbkJsdXJ9XG4gICAgICAgIC8+XG4gICAgICAgIHsgdGhpcy5zdGF0ZS5zaG93UmVzdWx0cyAmJiB0aGlzLl9yZW5kZXJJbmNyZW1lbnRhbFNlYXJjaFJlc3VsdHMoKSB9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG4gIF9vbkZvY3VzOiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe2lzRm9jdXNlZDogdHJ1ZSwgc2hvd1Jlc3VsdHM6IHRydWV9LCBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLl9vblRleHRFbnRyeVVwZGF0ZWQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIGlmICggdGhpcy5wcm9wcy5vbkZvY3VzICkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25Gb2N1cyhldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkJsdXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7aXNGb2N1c2VkOiBmYWxzZX0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX29uVGV4dEVudHJ5VXBkYXRlZCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgaWYgKCB0aGlzLnByb3BzLm9uQmx1ciApIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uQmx1cihldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW5kZXJIaWRkZW5JbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8aW5wdXRcbiAgICAgICAgdHlwZT1cImhpZGRlblwiXG4gICAgICAgIG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgfVxuICAgICAgICB2YWx1ZT17IHRoaXMuc3RhdGUuc2VsZWN0aW9uIH1cbiAgICAgIC8+XG4gICAgKTtcbiAgfSxcblxuICBfZ2VuZXJhdGVTZWFyY2hGdW5jdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlYXJjaE9wdGlvbnNQcm9wID0gdGhpcy5wcm9wcy5zZWFyY2hPcHRpb25zO1xuICAgIHZhciBmaWx0ZXJPcHRpb25Qcm9wID0gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb247XG4gICAgaWYgKHR5cGVvZiBzZWFyY2hPcHRpb25zUHJvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGZpbHRlck9wdGlvblByb3AgIT09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdzZWFyY2hPcHRpb25zIHByb3AgaXMgYmVpbmcgdXNlZCwgZmlsdGVyT3B0aW9uIHByb3Agd2lsbCBiZSBpZ25vcmVkJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2VhcmNoT3B0aW9uc1Byb3A7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZmlsdGVyT3B0aW9uUHJvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmZpbHRlcihmdW5jdGlvbihvKSB7IHJldHVybiBmaWx0ZXJPcHRpb25Qcm9wKHZhbHVlLCBvKTsgfSk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbWFwcGVyO1xuICAgICAgaWYgKHR5cGVvZiBmaWx0ZXJPcHRpb25Qcm9wID09PSAnc3RyaW5nJykge1xuICAgICAgICBtYXBwZXIgPSBBY2Nlc3Nvci5nZW5lcmF0ZUFjY2Vzc29yKGZpbHRlck9wdGlvblByb3ApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwcGVyID0gQWNjZXNzb3IuSURFTlRJVFlfRk47XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1enp5XG4gICAgICAgICAgLmZpbHRlcih2YWx1ZSwgb3B0aW9ucywge2V4dHJhY3Q6IG1hcHBlcn0pXG4gICAgICAgICAgLm1hcChmdW5jdGlvbihyZXMpIHsgcmV0dXJuIG9wdGlvbnNbcmVzLmluZGV4XTsgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICBfaGFzSGludDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5sZW5ndGggPiAwIHx8IHRoaXMuX2hhc0N1c3RvbVZhbHVlKCk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVhaGVhZDtcbiJdfQ==
},{"../accessor":16,"../keyevent":17,"./selector":23,"classnames":1,"create-react-class":3,"fuzzy":8,"prop-types":14,"react":"react"}],22:[function(require,module,exports){
var React = window.React || require('react');
var classNames = require('classnames');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = createReactClass({
  displayName: 'TypeaheadOption',

  propTypes: {
    customClasses: PropTypes.object,
    customValue: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.string,
    hover: PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      customClasses: {},
      onClick: function (event) {
        event.preventDefault();
      }
    };
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    var classList = classNames(classes);

    // For some reason onClick is not fired when clicked on an option
    // onMouseDown is used here as a workaround of #205 and other
    // related tickets
    return React.createElement(
      'li',
      { className: classList, onClick: this._onClick, onMouseDown: this._onClick },
      React.createElement(
        'a',
        { href: 'javascript: void 0;', className: this._getClasses(), ref: 'anchor' },
        this.props.children
      )
    );
  },

  _getClasses: function () {
    var classes = {
      "typeahead-option": true
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  },

  _onClick: function (event) {
    event.preventDefault();
    return this.props.onClick(event);
  }
});

module.exports = TypeaheadOption;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wdGlvbi5qcyJdLCJuYW1lcyI6WyJSZWFjdCIsInJlcXVpcmUiLCJjbGFzc05hbWVzIiwiY3JlYXRlUmVhY3RDbGFzcyIsIlByb3BUeXBlcyIsIlR5cGVhaGVhZE9wdGlvbiIsInByb3BUeXBlcyIsImN1c3RvbUNsYXNzZXMiLCJvYmplY3QiLCJjdXN0b21WYWx1ZSIsInN0cmluZyIsIm9uQ2xpY2siLCJmdW5jIiwiY2hpbGRyZW4iLCJob3ZlciIsImJvb2wiLCJnZXREZWZhdWx0UHJvcHMiLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwicmVuZGVyIiwiY2xhc3NlcyIsInByb3BzIiwibGlzdEl0ZW0iLCJjdXN0b21BZGQiLCJjbGFzc0xpc3QiLCJfb25DbGljayIsIl9nZXRDbGFzc2VzIiwibGlzdEFuY2hvciIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLElBQUlBLFFBQVFDLFFBQVEsT0FBUixDQUFaO0FBQ0EsSUFBSUMsYUFBYUQsUUFBUSxZQUFSLENBQWpCO0FBQ0EsSUFBSUUsbUJBQW1CRixRQUFRLG9CQUFSLENBQXZCO0FBQ0EsSUFBSUcsWUFBWUgsUUFBUSxZQUFSLENBQWhCOztBQUVBOzs7QUFHQSxJQUFJSSxrQkFBa0JGLGlCQUFpQjtBQUFBOztBQUNyQ0csYUFBVztBQUNUQyxtQkFBZUgsVUFBVUksTUFEaEI7QUFFVEMsaUJBQWFMLFVBQVVNLE1BRmQ7QUFHVEMsYUFBU1AsVUFBVVEsSUFIVjtBQUlUQyxjQUFVVCxVQUFVTSxNQUpYO0FBS1RJLFdBQU9WLFVBQVVXO0FBTFIsR0FEMEI7O0FBU3JDQyxtQkFBaUIsWUFBVztBQUMxQixXQUFPO0FBQ0xULHFCQUFlLEVBRFY7QUFFTEksZUFBUyxVQUFTTSxLQUFULEVBQWdCO0FBQ3ZCQSxjQUFNQyxjQUFOO0FBQ0Q7QUFKSSxLQUFQO0FBTUQsR0FoQm9DOztBQWtCckNDLFVBQVEsWUFBVztBQUNqQixRQUFJQyxVQUFVLEVBQWQ7QUFDQUEsWUFBUSxLQUFLQyxLQUFMLENBQVdkLGFBQVgsQ0FBeUJPLEtBQXpCLElBQWtDLE9BQTFDLElBQXFELENBQUMsQ0FBQyxLQUFLTyxLQUFMLENBQVdQLEtBQWxFO0FBQ0FNLFlBQVEsS0FBS0MsS0FBTCxDQUFXZCxhQUFYLENBQXlCZSxRQUFqQyxJQUE2QyxDQUFDLENBQUMsS0FBS0QsS0FBTCxDQUFXZCxhQUFYLENBQXlCZSxRQUF4RTs7QUFFQSxRQUFJLEtBQUtELEtBQUwsQ0FBV1osV0FBZixFQUE0QjtBQUMxQlcsY0FBUSxLQUFLQyxLQUFMLENBQVdkLGFBQVgsQ0FBeUJnQixTQUFqQyxJQUE4QyxDQUFDLENBQUMsS0FBS0YsS0FBTCxDQUFXZCxhQUFYLENBQXlCZ0IsU0FBekU7QUFDRDs7QUFFRCxRQUFJQyxZQUFZdEIsV0FBV2tCLE9BQVgsQ0FBaEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FDRTtBQUFBO0FBQUEsUUFBSSxXQUFXSSxTQUFmLEVBQTBCLFNBQVMsS0FBS0MsUUFBeEMsRUFBa0QsYUFBYSxLQUFLQSxRQUFwRTtBQUNFO0FBQUE7QUFBQSxVQUFHLE1BQUsscUJBQVIsRUFBOEIsV0FBVyxLQUFLQyxXQUFMLEVBQXpDLEVBQTZELEtBQUksUUFBakU7QUFDSSxhQUFLTCxLQUFMLENBQVdSO0FBRGY7QUFERixLQURGO0FBT0QsR0F2Q29DOztBQXlDckNhLGVBQWEsWUFBVztBQUN0QixRQUFJTixVQUFVO0FBQ1osMEJBQW9CO0FBRFIsS0FBZDtBQUdBQSxZQUFRLEtBQUtDLEtBQUwsQ0FBV2QsYUFBWCxDQUF5Qm9CLFVBQWpDLElBQStDLENBQUMsQ0FBQyxLQUFLTixLQUFMLENBQVdkLGFBQVgsQ0FBeUJvQixVQUExRTs7QUFFQSxXQUFPekIsV0FBV2tCLE9BQVgsQ0FBUDtBQUNELEdBaERvQzs7QUFrRHJDSyxZQUFVLFVBQVNSLEtBQVQsRUFBZ0I7QUFDeEJBLFVBQU1DLGNBQU47QUFDQSxXQUFPLEtBQUtHLEtBQUwsQ0FBV1YsT0FBWCxDQUFtQk0sS0FBbkIsQ0FBUDtBQUNEO0FBckRvQyxDQUFqQixDQUF0Qjs7QUF5REFXLE9BQU9DLE9BQVAsR0FBaUJ4QixlQUFqQiIsImZpbGUiOiJvcHRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGNsYXNzTmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoJ2NyZWF0ZS1yZWFjdC1jbGFzcycpO1xudmFyIFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxuLyoqXG4gKiBBIHNpbmdsZSBvcHRpb24gd2l0aGluIHRoZSBUeXBlYWhlYWRTZWxlY3RvclxuICovXG52YXIgVHlwZWFoZWFkT3B0aW9uID0gY3JlYXRlUmVhY3RDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIGN1c3RvbUNsYXNzZXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgY3VzdG9tVmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaG92ZXI6IFByb3BUeXBlcy5ib29sXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3VzdG9tQ2xhc3Nlczoge30sXG4gICAgICBvbkNsaWNrOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcyA9IHt9O1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmhvdmVyIHx8IFwiaG92ZXJcIl0gPSAhIXRoaXMucHJvcHMuaG92ZXI7XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMubGlzdEl0ZW1dID0gISF0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMubGlzdEl0ZW07XG5cbiAgICBpZiAodGhpcy5wcm9wcy5jdXN0b21WYWx1ZSkge1xuICAgICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMuY3VzdG9tQWRkXSA9ICEhdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmN1c3RvbUFkZDtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NMaXN0ID0gY2xhc3NOYW1lcyhjbGFzc2VzKTtcblxuICAgIC8vIEZvciBzb21lIHJlYXNvbiBvbkNsaWNrIGlzIG5vdCBmaXJlZCB3aGVuIGNsaWNrZWQgb24gYW4gb3B0aW9uXG4gICAgLy8gb25Nb3VzZURvd24gaXMgdXNlZCBoZXJlIGFzIGEgd29ya2Fyb3VuZCBvZiAjMjA1IGFuZCBvdGhlclxuICAgIC8vIHJlbGF0ZWQgdGlja2V0c1xuICAgIHJldHVybiAoXG4gICAgICA8bGkgY2xhc3NOYW1lPXtjbGFzc0xpc3R9IG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9IG9uTW91c2VEb3duPXt0aGlzLl9vbkNsaWNrfT5cbiAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6IHZvaWQgMDtcIiBjbGFzc05hbWU9e3RoaXMuX2dldENsYXNzZXMoKX0gcmVmPVwiYW5jaG9yXCI+XG4gICAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9LFxuXG4gIF9nZXRDbGFzc2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgIFwidHlwZWFoZWFkLW9wdGlvblwiOiB0cnVlLFxuICAgIH07XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMubGlzdEFuY2hvcl0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5saXN0QW5jaG9yO1xuXG4gICAgcmV0dXJuIGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG4gIH0sXG5cbiAgX29uQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkNsaWNrKGV2ZW50KTtcbiAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlYWhlYWRPcHRpb247XG4iXX0=
},{"classnames":1,"create-react-class":3,"prop-types":14,"react":"react"}],23:[function(require,module,exports){
var React = window.React || require('react');
var TypeaheadOption = require('./option');
var classNames = require('classnames');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = createReactClass({
  displayName: 'TypeaheadSelector',

  propTypes: {
    options: PropTypes.array,
    allowCustomValues: PropTypes.number,
    customClasses: PropTypes.object,
    customValue: PropTypes.string,
    selectionIndex: PropTypes.number,
    onOptionSelected: PropTypes.func,
    displayOption: PropTypes.func.isRequired,
    defaultClassNames: PropTypes.bool,
    areResultsTruncated: PropTypes.bool,
    resultsTruncatedMessage: PropTypes.string
  },

  getDefaultProps: function () {
    return {
      selectionIndex: null,
      customClasses: {},
      allowCustomValues: 0,
      customValue: null,
      onOptionSelected: function (option) {},
      defaultClassNames: true
    };
  },

  render: function () {
    // Don't render if there are no options to display
    if (!this.props.options.length && this.props.allowCustomValues <= 0) {
      return false;
    }

    var classes = {
      "typeahead-selector": this.props.defaultClassNames
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    var classList = classNames(classes);

    // CustomValue should be added to top of results list with different class name
    var customValue = null;
    var customValueOffset = 0;
    if (this.props.customValue !== null) {
      customValueOffset++;
      customValue = React.createElement(
        TypeaheadOption,
        { ref: this.props.customValue, key: this.props.customValue,
          hover: this.props.selectionIndex === 0,
          customClasses: this.props.customClasses,
          customValue: this.props.customValue,
          onClick: this._onClick.bind(this, this.props.customValue) },
        this.props.customValue
      );
    }

    var results = this.props.options.map(function (result, i) {
      var displayString = this.props.displayOption(result, i);
      var uniqueKey = displayString + '_' + i;
      return React.createElement(
        TypeaheadOption,
        { ref: uniqueKey, key: uniqueKey,
          hover: this.props.selectionIndex === i + customValueOffset,
          customClasses: this.props.customClasses,
          onClick: this._onClick.bind(this, result) },
        displayString
      );
    }, this);

    if (this.props.areResultsTruncated && this.props.resultsTruncatedMessage !== null) {
      var resultsTruncatedClasses = {
        "results-truncated": this.props.defaultClassNames
      };
      resultsTruncatedClasses[this.props.customClasses.resultsTruncated] = this.props.customClasses.resultsTruncated;
      var resultsTruncatedClassList = classNames(resultsTruncatedClasses);

      results.push(React.createElement(
        'li',
        { key: 'results-truncated', className: resultsTruncatedClassList },
        this.props.resultsTruncatedMessage
      ));
    }

    return React.createElement(
      'ul',
      { className: classList },
      customValue,
      results
    );
  },

  _onClick: function (result, event) {
    return this.props.onOptionSelected(result, event);
  }

});

module.exports = TypeaheadSelector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsIlR5cGVhaGVhZE9wdGlvbiIsImNsYXNzTmFtZXMiLCJjcmVhdGVSZWFjdENsYXNzIiwiUHJvcFR5cGVzIiwiVHlwZWFoZWFkU2VsZWN0b3IiLCJwcm9wVHlwZXMiLCJvcHRpb25zIiwiYXJyYXkiLCJhbGxvd0N1c3RvbVZhbHVlcyIsIm51bWJlciIsImN1c3RvbUNsYXNzZXMiLCJvYmplY3QiLCJjdXN0b21WYWx1ZSIsInN0cmluZyIsInNlbGVjdGlvbkluZGV4Iiwib25PcHRpb25TZWxlY3RlZCIsImZ1bmMiLCJkaXNwbGF5T3B0aW9uIiwiaXNSZXF1aXJlZCIsImRlZmF1bHRDbGFzc05hbWVzIiwiYm9vbCIsImFyZVJlc3VsdHNUcnVuY2F0ZWQiLCJyZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZSIsImdldERlZmF1bHRQcm9wcyIsIm9wdGlvbiIsInJlbmRlciIsInByb3BzIiwibGVuZ3RoIiwiY2xhc3NlcyIsInJlc3VsdHMiLCJjbGFzc0xpc3QiLCJjdXN0b21WYWx1ZU9mZnNldCIsIl9vbkNsaWNrIiwiYmluZCIsIm1hcCIsInJlc3VsdCIsImkiLCJkaXNwbGF5U3RyaW5nIiwidW5pcXVlS2V5IiwicmVzdWx0c1RydW5jYXRlZENsYXNzZXMiLCJyZXN1bHRzVHJ1bmNhdGVkIiwicmVzdWx0c1RydW5jYXRlZENsYXNzTGlzdCIsInB1c2giLCJldmVudCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLElBQUlBLFFBQVFDLFFBQVEsT0FBUixDQUFaO0FBQ0EsSUFBSUMsa0JBQWtCRCxRQUFRLFVBQVIsQ0FBdEI7QUFDQSxJQUFJRSxhQUFhRixRQUFRLFlBQVIsQ0FBakI7QUFDQSxJQUFJRyxtQkFBbUJILFFBQVEsb0JBQVIsQ0FBdkI7QUFDQSxJQUFJSSxZQUFZSixRQUFRLFlBQVIsQ0FBaEI7O0FBRUE7Ozs7QUFJQSxJQUFJSyxvQkFBb0JGLGlCQUFpQjtBQUFB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MEI7QUFDNUIsNkJBQXFCLEtBQUtiLEtBQUwsQ0FBV1A7QUFESixPQUE5QjtBQUdBb0IsOEJBQXdCLEtBQUtiLEtBQUwsQ0FBV2hCLGFBQVgsQ0FBeUI4QixnQkFBakQsSUFBcUUsS0FBS2QsS0FBTCxDQUFXaEIsYUFBWCxDQUF5QjhCLGdCQUE5RjtBQUNBLFVBQUlDLDRCQUE0QnhDLFdBQVdzQyx1QkFBWCxDQUFoQzs7QUFFQVYsY0FBUWEsSUFBUixDQUNFO0FBQUE7QUFBQSxVQUFJLEtBQUksbUJBQVIsRUFBNEIsV0FBV0QseUJBQXZDO0FBQ0csYUFBS2YsS0FBTCxDQUFXSjtBQURkLE9BREY7QUFLRDs7QUFFRCxXQUNFO0FBQUE7QUFBQSxRQUFJLFdBQVdRLFNBQWY7QUFDSWxCLGlCQURKO0FBRUlpQjtBQUZKLEtBREY7QUFNRCxHQXRGc0M7O0FBd0Z2Q0csWUFBVSxVQUFTRyxNQUFULEVBQWlCUSxLQUFqQixFQUF3QjtBQUNoQyxXQUFPLEtBQUtqQixLQUFMLENBQVdYLGdCQUFYLENBQTRCb0IsTUFBNUIsRUFBb0NRLEtBQXBDLENBQVA7QUFDRDs7QUExRnNDLENBQWpCLENBQXhCOztBQThGQUMsT0FBT0MsT0FBUCxHQUFpQnpDLGlCQUFqQiIsImZpbGUiOiJzZWxlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVHlwZWFoZWFkT3B0aW9uID0gcmVxdWlyZSgnLi9vcHRpb24nKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIGNyZWF0ZVJlYWN0Q2xhc3MgPSByZXF1aXJlKCdjcmVhdGUtcmVhY3QtY2xhc3MnKTtcbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbi8qKlxuICogQ29udGFpbmVyIGZvciB0aGUgb3B0aW9ucyByZW5kZXJlZCBhcyBwYXJ0IG9mIHRoZSBhdXRvY29tcGxldGlvbiBwcm9jZXNzXG4gKiBvZiB0aGUgdHlwZWFoZWFkXG4gKi9cbnZhciBUeXBlYWhlYWRTZWxlY3RvciA9IGNyZWF0ZVJlYWN0Q2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBvcHRpb25zOiBQcm9wVHlwZXMuYXJyYXksXG4gICAgYWxsb3dDdXN0b21WYWx1ZXM6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgY3VzdG9tQ2xhc3NlczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBjdXN0b21WYWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBzZWxlY3Rpb25JbmRleDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBvbk9wdGlvblNlbGVjdGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBkaXNwbGF5T3B0aW9uOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGRlZmF1bHRDbGFzc05hbWVzOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBhcmVSZXN1bHRzVHJ1bmNhdGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlbGVjdGlvbkluZGV4OiBudWxsLFxuICAgICAgY3VzdG9tQ2xhc3Nlczoge30sXG4gICAgICBhbGxvd0N1c3RvbVZhbHVlczogMCxcbiAgICAgIGN1c3RvbVZhbHVlOiBudWxsLFxuICAgICAgb25PcHRpb25TZWxlY3RlZDogZnVuY3Rpb24ob3B0aW9uKSB7IH0sXG4gICAgICBkZWZhdWx0Q2xhc3NOYW1lczogdHJ1ZVxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAvLyBEb24ndCByZW5kZXIgaWYgdGhlcmUgYXJlIG5vIG9wdGlvbnMgdG8gZGlzcGxheVxuICAgIGlmICghdGhpcy5wcm9wcy5vcHRpb25zLmxlbmd0aCAmJiB0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzIDw9IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgIFwidHlwZWFoZWFkLXNlbGVjdG9yXCI6IHRoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXNcbiAgICB9O1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnJlc3VsdHNdID0gdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnJlc3VsdHM7XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG5cbiAgICAvLyBDdXN0b21WYWx1ZSBzaG91bGQgYmUgYWRkZWQgdG8gdG9wIG9mIHJlc3VsdHMgbGlzdCB3aXRoIGRpZmZlcmVudCBjbGFzcyBuYW1lXG4gICAgdmFyIGN1c3RvbVZhbHVlID0gbnVsbDtcbiAgICB2YXIgY3VzdG9tVmFsdWVPZmZzZXQgPSAwO1xuICAgIGlmICh0aGlzLnByb3BzLmN1c3RvbVZhbHVlICE9PSBudWxsKSB7XG4gICAgICBjdXN0b21WYWx1ZU9mZnNldCsrO1xuICAgICAgY3VzdG9tVmFsdWUgPSAoXG4gICAgICAgIDxUeXBlYWhlYWRPcHRpb24gcmVmPXt0aGlzLnByb3BzLmN1c3RvbVZhbHVlfSBrZXk9e3RoaXMucHJvcHMuY3VzdG9tVmFsdWV9XG4gICAgICAgICAgaG92ZXI9e3RoaXMucHJvcHMuc2VsZWN0aW9uSW5kZXggPT09IDB9XG4gICAgICAgICAgY3VzdG9tQ2xhc3Nlcz17dGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzfVxuICAgICAgICAgIGN1c3RvbVZhbHVlPXt0aGlzLnByb3BzLmN1c3RvbVZhbHVlfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2suYmluZCh0aGlzLCB0aGlzLnByb3BzLmN1c3RvbVZhbHVlKX0+XG4gICAgICAgICAgeyB0aGlzLnByb3BzLmN1c3RvbVZhbHVlIH1cbiAgICAgICAgPC9UeXBlYWhlYWRPcHRpb24+XG4gICAgICApO1xuICAgIH1cblxuICAgIHZhciByZXN1bHRzID0gdGhpcy5wcm9wcy5vcHRpb25zLm1hcChmdW5jdGlvbihyZXN1bHQsIGkpIHtcbiAgICAgIHZhciBkaXNwbGF5U3RyaW5nID0gdGhpcy5wcm9wcy5kaXNwbGF5T3B0aW9uKHJlc3VsdCwgaSk7XG4gICAgICB2YXIgdW5pcXVlS2V5ID0gZGlzcGxheVN0cmluZyArICdfJyArIGk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8VHlwZWFoZWFkT3B0aW9uIHJlZj17dW5pcXVlS2V5fSBrZXk9e3VuaXF1ZUtleX1cbiAgICAgICAgICBob3Zlcj17dGhpcy5wcm9wcy5zZWxlY3Rpb25JbmRleCA9PT0gaSArIGN1c3RvbVZhbHVlT2Zmc2V0fVxuICAgICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrLmJpbmQodGhpcywgcmVzdWx0KX0+XG4gICAgICAgICAgeyBkaXNwbGF5U3RyaW5nIH1cbiAgICAgICAgPC9UeXBlYWhlYWRPcHRpb24+XG4gICAgICApO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgaWYgKHRoaXMucHJvcHMuYXJlUmVzdWx0c1RydW5jYXRlZCAmJiB0aGlzLnByb3BzLnJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlICE9PSBudWxsKSB7XG4gICAgICB2YXIgcmVzdWx0c1RydW5jYXRlZENsYXNzZXMgPSB7XG4gICAgICAgIFwicmVzdWx0cy10cnVuY2F0ZWRcIjogdGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc1xuICAgICAgfTtcbiAgICAgIHJlc3VsdHNUcnVuY2F0ZWRDbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5yZXN1bHRzVHJ1bmNhdGVkXSA9IHRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5yZXN1bHRzVHJ1bmNhdGVkO1xuICAgICAgdmFyIHJlc3VsdHNUcnVuY2F0ZWRDbGFzc0xpc3QgPSBjbGFzc05hbWVzKHJlc3VsdHNUcnVuY2F0ZWRDbGFzc2VzKTtcblxuICAgICAgcmVzdWx0cy5wdXNoKFxuICAgICAgICA8bGkga2V5PVwicmVzdWx0cy10cnVuY2F0ZWRcIiBjbGFzc05hbWU9e3Jlc3VsdHNUcnVuY2F0ZWRDbGFzc0xpc3R9PlxuICAgICAgICAgIHt0aGlzLnByb3BzLnJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlfVxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT17Y2xhc3NMaXN0fT5cbiAgICAgICAgeyBjdXN0b21WYWx1ZSB9XG4gICAgICAgIHsgcmVzdWx0cyB9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH0sXG5cbiAgX29uQ2xpY2s6IGZ1bmN0aW9uKHJlc3VsdCwgZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbk9wdGlvblNlbGVjdGVkKHJlc3VsdCwgZXZlbnQpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVhaGVhZFNlbGVjdG9yO1xuIl19
},{"./option":22,"classnames":1,"create-react-class":3,"prop-types":14,"react":"react"}]},{},[18])(18)
});