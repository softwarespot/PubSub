'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/*
 * PubSub module
 *
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
        // See clear in the documentation below

        clear: function clear(subscriptions) {
            return _pubSubInstance.clear(subscriptions);
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
        },

        // See publish in the documentation below
        publish: function publish(subscriptions) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return _pubSubInstance.publish.apply(_pubSubInstance, [subscriptions].concat(args));
        },

        // See subscribe in the documentation below
        subscribe: function subscribe(subscriptions, callbacks) {
            return _pubSubInstance.subscribe(subscriptions, callbacks);
        },

        // See unsubscribe in the documentation below
        unsubscribe: function unsubscribe(subscriptions, callbacks) {
            return _pubSubInstance.unsubscribe(subscriptions, callbacks);
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
    // Constants

    // Version number of the module
    var VERSION = '2.2.4';

    // Cache an empty array
    var ARRAY_EMPTY = [];

    // Value of indexOf when a value isn't found
    var IS_NOT_FOUND = -1;

    // Array constants enumeration
    var HANDLE_ID = 0;
    var HANDLE_SUBSCRIPTION = 1;
    var HANDLE_CALLBACK = 2;
    var HANDLE_MAX = 3;

    // Return strings of toString() found on the Object prototype
    var _objectStringsArray = '[object Array]';
    var _objectStringsFunction = '[object Function]';
    var _objectStringsGenerator = '[object GeneratorFunction]';
    var _objectStringsString = '[object String]';

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
     * @returns {boolean} True, the value is a function datatype; otherwise, false
     */
    function _isFunction(value) {
        var tag = _isObject(value) ? _objectToString.call(value) : null;
        return tag === _objectStringsFunction || tag === _objectStringsGenerator;
    }

    /**
     * Check if a variable is an array datatype
     *
     * @param {mixed} value Value to check
     * @returns {boolean} True, the value is an array datatype; otherwise, false
     */
    var _isArray = _isFunction(global.Array.isArray) ? global.Array.isArray : function (value) {
        return _objectToString.call(value) === _objectStringsArray;
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
        _isSubscription(handle[HANDLE_SUBSCRIPTION]) &&

        // Contain a function at the 'callback position'
        _isFunction(handle[HANDLE_CALLBACK]);
    }

    /**
     * Check if a variable is null
     *
     * @param {mixed} value Value to check
     * @returns {boolean} True, the value is null; otherwise, false
     */
    function _isNull(value) {
        return value === null;
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
    function _isSubscription(value) {
        return (typeof value === 'string' || _objectToString.call(value) === _objectStringsString) && value.trim().length > 0;
    }

    /**
     * Check if a subscription string is subscribed to i.e. contains more than one callback function
     *
     * @param {string} subscription Subscription string value to check
     * @param {object} subscribers Subscription object
     * @return {boolean} True, the subscription is subscribed to; otherwise, false
     */
    function _isSubscribed(subscription, subscribers) {
        return _isSubscription(subscription) && subscribers.hasOwnProperty(subscription) && subscribers[subscription].length > 0;
    }

    /**
     * Convert a subscription argument to a valid array
     *
     * @param {array|handle|string} subscriptions An array of subscription strings, a single subscription string or an opaque handle
     * returned by the subscribe function
     * @return {array|null} Subscription array; otherwise, null on error
     */
    function _subscriptionsToArray(subscriptions) {
        // Set the following variable(s), if it's an opaque 'PubSub' handle returned from subscribe()
        if (_isHandle(subscriptions)) {
            // Convert to an array datatype
            subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];
        } else if (_isSubscription(subscriptions)) {
            // If a string datatype has been passed, then convert to an array datatype
            subscriptions = [subscriptions];
        }

        return _isArray(subscriptions) ? subscriptions : null;
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
         * Clear the internal subscribers storage
         *
         * @param {array|handle|string} subscriptions An array of subscription strings, a single subscription string or an opaque handle
         * returned by the subscribe function
         * @return {undefined}
         */

        _createClass(PubSub, [{
            key: 'clear',
            value: function clear(subscriptions) {
                var _this = this;

                // Convert the subscriptions argument to an array
                subscriptions = _subscriptionsToArray(subscriptions);

                // If an invalid subscription argument is passed, then clear the subscribers object literal instead
                if (_isNull(subscriptions)) {
                    this._subscribers = {};
                    return;
                }

                // Filter all elements that aren't a valid subscription or currently subscribed to with callback functions
                subscriptions.filter(function (subscription) {
                    return _isSubscribed(subscription, _this._subscribers);
                })

                // Iterate through all the subscription strings
                .forEach(function (subscription) {
                    // Retrieve the callback functions for the subscription
                    var functions = _this._subscribers[subscription];

                    // Clear all functions for the following subscription string
                    var length = functions.length;
                    functions.splice(0, length);
                });
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
                var _this2 = this;

                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                // Convert the subscriptions argument to an array
                subscriptions = _subscriptionsToArray(subscriptions);

                // Store the number of subscriptions published
                var published = 0;

                // If not an array, then the subscription was an invalid array, handle or string
                if (_isNull(subscriptions)) {
                    return published;
                }

                // Push the subscription to the end of the arguments array as a comma separated string,
                // just in case it's required. Of course this will kind of fail if the user uses a subscription with a comma,
                // but that's up to them I guess!
                args.push(subscriptions.join(','));

                // Filter all elements that aren't a valid subscription or currently subscribed to with callback functions
                subscriptions.filter(function (subscription) {
                    return _isSubscribed(subscription, _this2._subscribers);
                })

                // Iterate through all the subscription strings
                .forEach(function (subscription) {

                    // Iterate through all the functions for the particular subscription
                    _this2._subscribers[subscription].forEach(function (fn) {
                        // Call the function with the arguments array using the spread operator
                        // fn(...args); // Synchronous

                        // Queue the callback function, as setTimeout is asynchronous
                        global.setTimeout(function () {
                            fn.apply(undefined, args);
                        }, 0);

                        // Increase the number of published subscriptions
                        published++;
                    });
                });

                // Return the number of subscribers published to
                return published;
            }

            /**
             *
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
                var _this3 = this;

                // Store as to whether or not the first parameter is a string
                var isStringTypes = _isSubscription(subscriptions) && _isFunction(callbacks);

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

                // Filter all elements that aren't a valid callback function
                callbacks.filter(function (callback, index) {
                    if (_isFunction(callback)) {
                        return true;
                    }

                    // Remove the subscription
                    subscriptions.splice(index, 1);

                    return false;
                });

                // Filter all elements that aren't a valid subscription and where the callback function doesn't exist
                subscriptions.filter(function (subscription, index) {
                    // If a valid subscription and the callback function doesn't exist. Could use include() when ES2015 is widely available
                    if (_isSubscription(subscription) && (_this3._subscribers[subscription] || ARRAY_EMPTY).indexOf(callbacks[index]) === IS_NOT_FOUND) {
                        return true;
                    }

                    // Remove the callback function from the callback functions array
                    callbacks.splice(index, 1);

                    return false;
                })

                // Iterate through all the subscription strings
                .forEach(function (subscription, index) {

                    // If an array for the event name doesn't exist, then generate a new empty array
                    // This cannot be done on the function datatype for obvious reasons (it's an array)
                    if (!_isSubscribed(subscription, _this3._subscribers)) {
                        _this3._subscribers[subscription] = _isArray(_this3._subscribers[subscription]) ? _this3._subscribers[subscription] : [];
                    }

                    // Retrieve the callbacks for the subscription
                    var functions = _this3._subscribers[subscription];

                    // Store the callback
                    var callback = callbacks[index];

                    // Push the callback function to the subscription array
                    functions.push(callback);

                    // An opaque 'PubSub' handle
                    handles.push([_handleId, subscription, callback]);
                });

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
                var _this4 = this;

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
                } else if (_isSubscription(subscriptions) && _isFunction(callbacks)) {
                    // If a string and function datatype, then create an array for each variable
                    callbacks = [callbacks];
                    subscriptions = [subscriptions];
                }

                // If either of the arguments are not an array or the lengths simply mismatch, then return false
                if (!_isArray(subscriptions) || !_isArray(callbacks) || subscriptions.length !== callbacks.length) {
                    return false;
                }

                // Filter all elements that aren't a valid subscription or currently subscribed to with callback functions
                subscriptions.filter(function (subscription, index) {
                    if (_isSubscribed(subscription, _this4._subscribers)) {
                        return true;
                    }

                    // Remove the callback function from the callback functions array
                    callbacks.splice(index, 1);

                    return false;
                })

                // Iterate through all the subscription strings
                .forEach(function (subscription, index) {
                    // Retrieve the callback functions for the subscription
                    var functions = _this4._subscribers[subscription];

                    // If a callback function reference exists for the subscription,
                    // then remove from the array using the index value
                    var indexOf = functions.indexOf(callbacks[index]);
                    if (indexOf !== IS_NOT_FOUND) {
                        functions.splice(indexOf, 1);
                    }
                });

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