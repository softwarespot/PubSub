/*
 * PubSub module
 * https://github.com/softwarespot/pubsub
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 1.1.0
 */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

; // jshint ignore:line
(function (global, iPubSub) {
    // jshint ignore:line
    // Constants

    // Version number of the module
    var VERSION = '1.1.0';

    // Create an instance of the PubSub interface
    var _pubSubInstance = new iPubSub();

    // Public API
    var _pubSub = {
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

        // Expose the underlying interface to create multiple instances of the module
        getInterface: function getInterface() {
            return iPubSub;
        },

        // Get the version number of the module
        getVersion: function getVersion() {
            return VERSION;
        }
    };

    // Store a module reference
    var module = global.module;

    // Store a define reference
    var define = global.define;

    // Append PubSub to the global object reference
    global.PubSub = _pubSub();

    if (typeof module !== 'undefined' && module.exports && typeof global === 'undefined') {
        // NodeJS
        module.exports = _pubSub;
    } else if (typeof module !== 'undefined' && module.exports && typeof global !== 'undefined') {
        // Browserify
        module.exports = _pubSub;
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        global.define('PubSub', [], _pubSub);
    }
})(undefined, (function (global) {
    // Constants

    // Array constants enumeration
    var HANDLE_ID = 0;
    var HANDLE_SUBSCRIPTION = 1;
    var HANDLE_CALLBACK = 2;
    var HANDLE_MAX = 3;

    // Return strings of toString() found on the Object prototype
    var _objectStrings = {
        FUNCTION: '[object Function]',
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

    // Check if a value is a function. Based on the idea by lodash
    function isFunction(value) {
        return isObject(value) && _objectToString.call(value) === _objectStrings.FUNCTION;
    }

    // Check if an opaque 'PubSub' handle is valid
    function isHandle(handle) {
        // The opaque 'PubSub' handle must be an array
        return global.Array.isArray(handle) &&

        // Have a length equal to that of HANDLE_MAX
        handle.length === HANDLE_MAX &&

        // Contain a handle at the 'id position'
        handle[HANDLE_ID] === _handleId &&

        // Contain a string at the 'subscription position'
        isString(handle[HANDLE_SUBSCRIPTION]) &&

        // Contain a function at the 'callback position'
        isFunction(handle[HANDLE_CALLBACK]);
    }

    // Check if a value is an object. Based on the idea by lodash
    function isObject(value) {
        // Store the typeof value
        var type = typeof value;

        // !!value is basically checking if value is not 'truthy' e.g. null or zero and then inverts that boolean value
        // So, !'Some test' is false and then inverting false is true. There if value contains 'something', continue
        return !!value && (type === 'object' || type === 'function');
    }

    // Check if a value is a string datatype with a length greater than zero when whitespace is stripped. Based partially on the idea by lodash
    function isString(value) {
        return (typeof value === 'string' || _objectToString.call(value) === _objectStrings.STRING) && value.trim().length > 0;
    }

    // Public API

    return (function () {
        // Constructor for the class

        function PubSub() {
            _classCallCheck(this, PubSub);

            this._subscribers = {};
        }

        // Subscribe to a subscription with a callback function. It's best practice not to make this an anonymous function
        // as you then can't unsubscribe, since the callback function reference is required
        // Returns an opaque handle for use with unsubscribe() (though it's optional to use of course)

        _createClass(PubSub, [{
            key: 'subscribe',
            value: function subscribe(subscriptions, callbacks) {
                // Store as to whether or not  the first parameter is a string
                var isStringTypes = isString(subscriptions) && isFunction(callbacks);

                // If a string and a function datatype, then create an array for each parameter
                if (isStringTypes) {
                    callbacks = [callbacks];
                    subscriptions = [subscriptions];
                }

                // If either of the arguments are not an array or the lengths mismatch, then return a handle error
                if (!global.Array.isArray(subscriptions) || !global.Array.isArray(callbacks) || subscriptions.length !== callbacks.length) {
                    return _handleError;
                }

                // Return an array of opaque 'PubSub' handles i.e. [handle id, subscription, callback]
                var handles = [];

                // Iterate through all the subscriptions
                for (var i = 0, _length = subscriptions.length; i < _length; i++) {
                    // Store the subscription
                    var subscription = subscriptions[i];

                    // The subscription should be a string datatype with a length greater than zero
                    if (!isString(subscription)) {
                        continue;
                    }

                    // Store the callback
                    var callback = callbacks[i];

                    // The callback should be a function datatype
                    if (!isFunction(callback)) {
                        continue;
                    }

                    // If an array for the event name doesn't exist, then generate a new empty array
                    // This cannot be done on the function datatype for obvious reasons (it's an array)
                    this._subscribers[subscription] = this._subscribers[subscription] || [];

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

            // Unsubscribe from a subscription. A string and callback function reference are expected OR
            // the handle returned from subscribe()
            // Returns true or false
        }, {
            key: 'unsubscribe',
            value: function unsubscribe(subscriptions, callbacks) {
                // If the reference is equal to the handle error array, then an error occurred with previously subscribing
                if (subscriptions === _handleError) {
                    return false;
                }

                // Set the following variable(s), if it's an opaque 'PubSub' handle returned from subscribe()
                if (isHandle(subscriptions)) {
                    // Do not swap these around, otherwise it will cause an error with overwriting subscriptions before
                    // setting the callbacks variable
                    callbacks = [subscriptions[HANDLE_CALLBACK]];
                    subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];
                    // If a string and function datatype, then create an array for each variable
                } else if (isString(subscriptions) && isFunction(callbacks)) {
                        callbacks = [callbacks];
                        subscriptions = [subscriptions];
                    }

                // If either of the arguments are not an array or the lengths simply mismatch, then return false
                if (!global.Array.isArray(subscriptions) || !global.Array.isArray(callbacks) || subscriptions.length !== callbacks.length) {
                    return false;
                }

                // Iterate through all the subscriptions
                for (var i = 0, _length2 = subscriptions.length; i < _length2; i++) {
                    // Retrieve the callback functions for the subscription
                    var functions = this._subscribers[subscriptions[i]];

                    // The subscription hasn't been created or there are simply no callback functions assigned
                    if (!functions) {
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

            // Publish a subscription to all subscribers with an unlimited number of arguments. The subscription is the last argument
            // i.e. arguments[arguments.length]
            // Returns number of subscriptions published
        }, {
            key: 'publish',
            value: function publish(subscriptions) {
                // Set the following variable(s), if it's an opaque 'PubSub' handle returned from subscribe()
                if (isHandle(subscriptions)) {
                    // Convert to an array datatype
                    subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];
                    // If a string has been passed, then convert to an array datatype
                } else if (isString(subscriptions)) {
                        subscriptions = [subscriptions];
                    }

                // If not an array, then the subscription was not a valid array, handle or string
                if (!global.Array.isArray(subscriptions)) {
                    return 0;
                }

                // Push the subscription to the end of the arguments array as a comma separated string,
                // just in case it's required. Of course this will kind of fail if the user uses a subscription with a comma,
                // but that's up to them I guess!

                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                args.push(subscriptions.join(','));

                // Store the number of subscriptions published
                var published = 0;

                // Iterate through all the subscriptions
                for (var i = 0, _length3 = subscriptions.length; i < _length3; i++) {
                    // Retrieve the callback function for the subscription
                    var functions = this._subscribers[subscriptions[i]];

                    // The subscription hasn't been created or there are simply no callback functions assigned
                    if (!functions) {
                        continue;
                    }

                    // Iterate through all the functions for the particular subscription
                    for (var j = 0, functionsLength = functions.length; j < functionsLength; j++) {
                        // Call the function with the arguments array using the spread operator
                        functions[j].apply(functions, args);

                        // Increase the number of published subscriptions
                        published++;
                    }
                }

                // Return the number of subscribers published to
                return published;
            }

            // Clear the internal subscribers store
        }, {
            key: 'clear',
            value: function clear() {
                this._subscribers = {};
            }
        }]);

        return PubSub;
    })();
})(undefined)); // this equals window

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