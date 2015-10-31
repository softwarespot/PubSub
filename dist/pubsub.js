'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { return obj && obj.constructor === Symbol ? "symbol" : typeof obj; }

/*
 * PubSub module
 * https://github.com/softwarespot/pubsub
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 2.2.4
 */
; // jshint ignore:line
(function (global, name, IPubSub, undefined) {
    // Constants

    // Create an instance of the PubSub interface
    var _pubSubInstance = new IPubSub();

    // Public API
    var _pubSubAPI = {
        // See subscribe in the documentation below
        subscribe: function subscribe(subscriptions, callbacks) {
            return _pubSubInstance.subscribe(subscriptions, callbacks);
        },

        // See unsubscribe in the documentation below
        unsubscribe: function unsubscribe(subscriptions, callbacks) {
            return _pubSubInstance.unsubscribe(subscriptions, callbacks);
        },

        // See publish in the documentation below
        publish: function publish(subscriptions) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return _pubSubInstance.publish.apply(_pubSubInstance, [subscriptions].concat(args));
        },

        // See clear in the documentation below
        clear: function clear() {
            return _pubSubInstance.clear();
        },

        /**
         * Expose the underlying interface to create multiple instances of the module
         *
         * @return {class|object} Underlying interface, which is a class in ES2015 or a function object in ES5
         */
        getInterface: function getInterface() {
            return IPubSub;
        },

        // See getVersion in the documentation below
        getVersion: function getVersion() {
            return _pubSubInstance.getVersion();
        }
    };

    // Define a 'constructor' function for modules to instantiate, which is a wrapper around the _pubSubAPI
    var _pubSubConstructor = function _pubSubConstructor() {
        return _pubSubAPI;
    };

    // Store a 'module' reference
    var module = global.module;

    // Store a 'define' reference
    var define = global.define;

    if (module !== undefined && module.exports) {
        // Node.js Module
        module.exports = _pubSubConstructor;
    } else if (typeof define === 'function' && define.amd) {
        // AMD Module
        global.define(name, [], _pubSubConstructor);
    }

    // Check if PubSub has already been registered beforehand and if so, throw an error
    if (global[name] !== undefined) {
        throw new global.Error('PubSub appears to be already registered with the global object, therefore the module has not been registered.');
    }

    // Append the PubSub API to the global object reference
    global[name] = _pubSubAPI;
})(window, 'PubSub', (function (global) {
    // Can't be 'this' with babelJS, as it gets set to 'undefined'
    // Constants

    // Version number of the module
    var VERSION = '2.2.4';

    // Array constants enumeration
    var HANDLE_ID = 0;
    var HANDLE_SUBSCRIPTION = 1;
    var HANDLE_CALLBACK = 2;
    var HANDLE_MAX = 3;

    // Return strings of toString() found on the Object prototype
    var _objectStrings = {
        ARRAY: '[object Array]',
        FUNCTION: '[object Function]',
        GENERATOR: '[object GeneratorFunction]',
        STRING: '[object String]'
    };

    // Store the Object prototype toString method
    var _objectToString = global.Object.prototype.toString;

    // Unique identifier (advanced leet speak for PubSub_Module)
    var _handleId = '|>|_|85|_|8_|\\/|0|)|_|13';

    // Generic handle for an error
    // This is an array so the reference can be used as a
    // way of verifying that it's an error
    var _handleError = [_handleId];

    // Methods

    /**
     * Check if a variable is a function datatype
     *
     * @param {mixed} value Value to check
     * @returns {boolean} True the value is a function datatype; otherwise, false
     */
    function _isFunction(value) {
        var tag = _isObject(value) ? _objectToString.call(value) : '';
        return tag === _objectStrings.FUNCTION || tag === _objectStrings.GENERATOR;
    }

    /**
     * Check if a variable is an array datatype
     *
     * @param {mixed} value Value to check
     * @returns {boolean} True, the value is an array datatype; otherwise, false
     */
    var _isArray = _isFunction(global.Array.isArray) ? global.Array.isArray : function (value) {
        return _objectToString.call(value) === _objectStrings.ARRAY;
    };

    /**
     * Check if a variable is an opaque handle
     *
     * @param {mixed} handle Handle to check
     * @returns {boolean} True, the handle is an opaque handle; otherwise, false
     */
    function _isHandle(handle) {
        // The opaque 'PubSub' handle must be an array
        return _isArray(handle) &&

        // Have a length equal to that of HANDLE_MAX
        handle.length === HANDLE_MAX &&

        // Contain a handle at the 'id position'
        handle[HANDLE_ID] === _handleId &&

        // Contain a string at the 'subscription position'
        _isString(handle[HANDLE_SUBSCRIPTION]) &&

        // Contain a function at the 'callback position'
        _isFunction(handle[HANDLE_CALLBACK]);
    }

    /**
     * Check if a variable is an object
     *
     * @param {mixed} value Value to check
     * @returns {boolean} True, the value is an object; otherwise, false
     */
    function _isObject(value) {
        // Store the typeof value
        var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

        // !!value is basically checking if value is not 'truthy' e.g. null or zero and then inverts that boolean value
        // So, !'Some test' is false and then inverting false is true. There if value contains 'something', continue
        return !!value && (type === 'object' || type === 'function');
    }

    /**
     * Check if a variable is a string datatype
     *
     * @param {mixed} value Value to check
     * @returns {boolean} True, the value is a string datatype; otherwise, false
     */
    function _isString(value) {
        return (typeof value === 'string' || _objectToString.call(value) === _objectStrings.STRING) && value.trim().length > 0;
    }

    /**
     * PubSub class
     */
    return (function () {
        /**
         * Constructor for the class
         *
         * @return {undefined}
         */

        function PubSub() {
            _classCallCheck(this, PubSub);

            this._subscribers = {};
        }

        /**
         * Clear the internal subscribers store
         *
         * @return {undefined}
         */

        _createClass(PubSub, [{
            key: 'clear',
            value: function clear() {
                this._subscribers = {};
            }

            /**
             * Get the version number of the module
             *
             * @return {string} Module version number
             */

        }, {
            key: 'getVersion',
            value: function getVersion() {
                return VERSION;
            }

            /**
             * Publish a subscription to all subscribers with an unlimited number of arguments
             *
             * Note: A comma separated subscription list is appended as the last argument passed to the callback function
             *
             * @param {array|handle|string} subscriptions An array of subscription strings, a single subscription string or an opaque handle
             * returned by the subscribe function
             * @param {...[mixed]} args A argument list to pass to the registered subscribers
             * @return {number} Number of subscribers published to; otherwise zero on error
             */

        }, {
            key: 'publish',
            value: function publish(subscriptions) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                // Set the following variable(s), if it's an opaque 'PubSub' handle returned from subscribe()
                if (_isHandle(subscriptions)) {
                    // Convert to an array datatype
                    subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];

                    // If a string has been passed, then convert to an array datatype
                } else if (_isString(subscriptions)) {
                        subscriptions = [subscriptions];
                    }

                // Store the number of subscriptions published
                var published = 0;

                // If not an array, then the subscription was an invalid array, handle or string
                if (!_isArray(subscriptions)) {
                    return published;
                }

                // Push the subscription to the end of the arguments array as a comma separated string,
                // just in case it's required. Of course this will kind of fail if the user uses a subscription with a comma,
                // but that's up to them I guess!
                args.push(subscriptions.join(','));

                /**
                 * Queue calling the callback function (idea by Nicolas Bevacqua)
                 *
                 * @param {function} callbackFn Callback function to apply the arguments to
                 * @return {undefined}
                 */
                function _publishCallback(callbackFn) {
                    // Queue the callback function, as setTimeout is asynchronous
                    global.setTimeout(function () {
                        callbackFn.apply(undefined, _toConsumableArray(args));
                    }, 0);
                }

                // Iterate through all the subscriptions
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = subscriptions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var subscription = _step.value;

                        // The subscription hasn't been created as of yet
                        if (!this._subscribers.hasOwnProperty(subscription)) {
                            continue;
                        }

                        // Retrieve the callback functions for the subscription
                        var functions = this._subscribers[subscription];

                        // There are no callback functions assigned to the subscription
                        if (!functions.length) {
                            continue;
                        }

                        // Iterate through all the functions for the particular subscription
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = functions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var callbackFn = _step2.value;

                                // Call the function with the arguments array using the spread operator
                                // callbackFn(...args); // Synchronous
                                _publishCallback(callbackFn); // Asynchronous

                                // Increase the number of published subscriptions
                                published++;
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    }

                    // Return the number of subscribers published to
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return published;
            }

            /**
             * Subscribe to a subscription with a callback function
             *
             * Note: It's best practice not to make this an anonymous function as you then can't unsubscribe,
             * since the callback function reference is required
             *
             * @param {array|string} subscriptions An array of subscription strings or a single subscription string
             * @param {array|string} callbacks An array of callback functions or a single callback function
             * @return {handle} An array of opaque handles if an array is passed or a single opaque handle; otherwise,
             * an error opaque handle on error
             */

        }, {
            key: 'subscribe',
            value: function subscribe(subscriptions, callbacks) {
                // Store as to whether or not the first parameter is a string
                var isStringTypes = _isString(subscriptions) && _isFunction(callbacks);

                // If a string and a function datatype, then create an array for each parameter
                if (isStringTypes) {
                    callbacks = [callbacks];
                    subscriptions = [subscriptions];
                }

                // If either of the arguments are not an array or the lengths mismatch, then return a handle error
                if (!_isArray(subscriptions) || !_isArray(callbacks) || subscriptions.length !== callbacks.length) {
                    return _handleError;
                }

                // Return an array of opaque 'PubSub' handles i.e. [handle id, subscription, callback]
                var handles = [];

                // Iterate through all the subscriptions. Must be a for loop
                for (var i = 0, length = subscriptions.length; i < length; i++) {
                    // Store the subscription
                    var subscription = subscriptions[i];

                    // The subscription should be a string datatype with a length greater than zero
                    if (!_isString(subscription)) {
                        continue;
                    }

                    // Store the callback
                    var callback = callbacks[i];

                    // The callback should be a function datatype
                    if (!_isFunction(callback)) {
                        continue;
                    }

                    // If an array for the event name doesn't exist, then generate a new empty array
                    // This cannot be done on the function datatype for obvious reasons (it's an array)
                    if (!this._subscribers.hasOwnProperty(subscription)) {
                        this._subscribers[subscription] = [];
                    }

                    // Retrieve the callbacks for the subscription
                    var functions = this._subscribers[subscription];

                    // Check if the callback hasn't already been registered for the event name
                    // Could use include() when ES2015 is widely available
                    if (functions.indexOf(callback) === -1) {
                        // Push the callback function to the event name array
                        functions.push(callback);

                        // An opaque 'PubSub' handle
                        handles.push([_handleId, subscription, callback]);
                    }
                }

                // If an error occurred as no opaque 'PubSub' handles were pushed to the handles array
                if (handles.length === 0) {
                    return isStringTypes ? _handleError : [_handleError];
                }

                // If a string was passed as the first parameter, then return a single handle instead of an array of handles
                return isStringTypes ? handles[0] : handles;
            }

            /**
             * Unsubscribe from a subscription
             *
             * @param {array|handle|string} subscriptions An array of subscription strings, a single subscription string or an opaque handle
             * returned by the subscribe function
             *
             * @param {array|string} callbacks An array of callback functions or a single callback function. If an opaque handle is passed as
             * the first argument then this parameter is ignored
             * @return {boolean} True on success; otherwise, false
             */

        }, {
            key: 'unsubscribe',
            value: function unsubscribe(subscriptions, callbacks) {
                // If the reference is equal to the handle error array, then an error occurred with previously subscribing
                if (subscriptions === _handleError) {
                    return false;
                }

                // Set the following variable(s), if it's an opaque 'PubSub' handle returned from subscribe()
                if (_isHandle(subscriptions)) {
                    // Do not swap these around, otherwise it will cause an error with overwriting subscriptions before
                    // setting the callbacks variable
                    callbacks = [subscriptions[HANDLE_CALLBACK]];
                    subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];

                    // If a string and function datatype, then create an array for each variable
                } else if (_isString(subscriptions) && _isFunction(callbacks)) {
                        callbacks = [callbacks];
                        subscriptions = [subscriptions];
                    }

                // If either of the arguments are not an array or the lengths simply mismatch, then return false
                if (!_isArray(subscriptions) || !_isArray(callbacks) || subscriptions.length !== callbacks.length) {
                    return false;
                }

                // Iterate through all the subscriptions. Must be a for loop
                for (var i = 0, length = subscriptions.length; i < length; i++) {
                    // The subscription hasn't been created as of yet
                    if (!this._subscribers.hasOwnProperty(subscriptions[i])) {
                        continue;
                    }

                    // Retrieve the callback functions for the subscription
                    var functions = this._subscribers[subscriptions[i]];

                    // There are no callback functions assigned to the subscription
                    if (!functions.length) {
                        continue;
                    }

                    // If a callback function reference exists for the subscription,
                    // then remove from the array using the index value
                    var index = functions.indexOf(callbacks[i]);
                    if (index !== -1) {
                        functions.splice(index, 1);
                    }
                }

                return true;
            }
        }]);

        return PubSub;
    })();
})(window));

//
// PubSub pattern in JavaScript
//      By LearnCodeAcademy, URL: https://gist.github.com/learncodeacademy/777349747d8382bfb722
//
// Additional info:
//      Tuts+, URL: https://www.youtube.com/watch?v=U4cigUpzW2U&list=PL15G0RGjxzGdBqDPF4DDrlOt9YmjampzO&index=8
//      Peter Higgins, URL: https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js
//      PubSubJS, handle/token concept, URL: https://github.com/mroderick/PubSubJS/blob/master/src/pubsub.js
//      PubSub, subscription array concept, URL: https://github.com/drublic/PubSub/
//      PubSub Wikipedia, URL: https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern
//
// Performance tests:
//      forEach-vs-for-loop: http://jsperf.com/array-foreach-vs-for-loop/5
//      for-loop-vs-indexOf: http://jsperf.com/js-for-loop-vs-array-indexof/8
//      shift-vs-splice: http://jsperf.com/shift-vs-splice
//