/*
 * PubSub module
 * https://github.com/softwarespot/pubsub
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 2.2.4
 */
; // jshint ignore:line
((global, name, IPubSub, undefined) => {
    // Constants

    // Create an instance of the PubSub interface
    const _pubSubInstance = new IPubSub();

    // Public API
    const _pubSubAPI = {
        // See clear in the documentation below
        clear() {
                return _pubSubInstance.clear();
            },

        /**
         * Expose the underlying interface to create multiple instances of the module
         *
         * @return {class|object} Underlying interface, which is a class in ES2015 or a function object in ES5
         */
        getInterface() {
                return IPubSub;
            },

        // See getVersion in the documentation below
        getVersion() {
                return _pubSubInstance.getVersion();
            },

        // See publish in the documentation below
        publish(subscriptions, ...args) {
                return _pubSubInstance.publish(subscriptions, ...args);
            },

        // See subscribe in the documentation below
        subscribe(subscriptions, callbacks) {
                return _pubSubInstance.subscribe(subscriptions, callbacks);
            },

        // See unsubscribe in the documentation below
        unsubscribe(subscriptions, callbacks) {
                return _pubSubInstance.unsubscribe(subscriptions, callbacks);
            },
    };

    // Define a 'constructor' function for modules to instantiate, which is a wrapper around the _pubSubAPI
    const _pubSubConstructor = () => {
        return _pubSubAPI;
    };

    // Store a 'module' reference
    const module = global.module;

    // Store a 'define' reference
    const define = global.define;

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
})(window, 'PubSub', ((global) => {
    // Constants

    // Version number of the module
    const VERSION = '2.2.4';

    // Value of indexOf when a value isn't found
    var IS_NOT_FOUND = -1;

    // Array constants enumeration
    const HANDLE_ID = 0;
    const HANDLE_SUBSCRIPTION = 1;
    const HANDLE_CALLBACK = 2;
    const HANDLE_MAX = 3;

    // Return strings of toString() found on the Object prototype
    const _objectStringsArray = '[object Array]';
    const _objectStringsFunction = '[object Function]';
    const _objectStringsGenerator = '[object GeneratorFunction]';
    const _objectStringsString = '[object String]';

    // Store the Object prototype toString method
    const _objectToString = global.Object.prototype.toString;

    // Unique identifier (advanced leet speak for PubSub_Module)
    const _handleId = '|>|_|85|_|8_|\\/|0|)|_|13';

    // Generic handle for an error
    // This is an array so the reference can be used as a
    // way of verifying that it's an error
    const _handleError = [_handleId];

    // Methods

    /**
     * Check if a variable is a function datatype
     *
     * @param {mixed} value Value to check
     * @returns {boolean} True, the value is a function datatype; otherwise, false
     */
    function _isFunction(value) {
        const tag = _isObject(value) ? _objectToString.call(value) : null;
        return tag === _objectStringsFunction || tag === _objectStringsGenerator;
    }

    /**
     * Check if a variable is an array datatype
     *
     * @param {mixed} value Value to check
     * @returns {boolean} True, the value is an array datatype; otherwise, false
     */
    const _isArray = _isFunction(global.Array.isArray) ? global.Array.isArray : (value) => {
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
        const type = typeof value;

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
    return class PubSub {
        /**
         * Constructor for the class
         *
         * @return {undefined}
         */
        constructor() {
            this._subscribers = {};
        }

        /**
         * Clear the internal subscribers storage
         *
         * @param {array|handle|string} subscriptions An array of subscription strings, a single subscription string or an opaque handle
         * returned by the subscribe function
         * @return {undefined}
         */
        clear(subscriptions) {
            // Convert the subscriptions argument to an array
            subscriptions = _subscriptionsToArray(subscriptions);

            // If an invalid subscription argument is passed, then clear the subscribers object literal instead
            if (_isNull(subscriptions)) {
                this._subscribers = {};
                return;
            }

            // Filter all elements that aren't a valid subscription or currently subscribed to with callback functions
            subscriptions.filter(this._isSubscribed)

            // Iterate through all the subscription strings
            .forEach((subscription) => {
                // Retrieve the callback functions for the subscription
                const functions = this._subscribers[subscription];

                // Clear all functions for the following subscription string
                const length = functions.length;
                functions.splice(0, length);
            });
        }

        /**
         * Get the version number of the module
         *
         * @return {string} Module version number
         */
        getVersion() {
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
        publish(subscriptions, ...args) {
            // Convert the subscriptions argument to an array
            subscriptions = _subscriptionsToArray(subscriptions);

            // Store the number of subscriptions published
            let published = 0;

            // If not an array, then the subscription was an invalid array, handle or string
            if (_isNull(subscriptions)) {
                return published;
            }

            // Push the subscription to the end of the arguments array as a comma separated string,
            // just in case it's required. Of course this will kind of fail if the user uses a subscription with a comma,
            // but that's up to them I guess!
            args.push(subscriptions.join(','));

            // Filter all elements that aren't a valid subscription or currently subscribed to with callback functions
            subscriptions.filter(this._isSubscribed)

            // Iterate through all the subscription strings
            .forEach((subscription) => {

                // Iterate through all the functions for the particular subscription
                this._subscribers[subscription].forEach((fn) => {
                    // Call the function with the arguments array using the spread operator
                    // fn(...args); // Synchronous

                    // Queue the callback function, as setTimeout is asynchronous
                    global.setTimeout(() => {
                        fn(...args);
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
        subscribe(subscriptions, callbacks) {
            // Store as to whether or not the first parameter is a string
            const isStringTypes = _isSubscription(subscriptions) && _isFunction(callbacks);

            // If a string and a function datatype, then create an array for each parameter
            if (isStringTypes) {
                callbacks = [callbacks];
                subscriptions = [subscriptions];
            }

            // If either of the arguments are not an array or the lengths mismatch, then return a handle error
            if (!_isArray(subscriptions) ||
                !_isArray(callbacks) ||
                subscriptions.length !== callbacks.length) {
                return _handleError;
            }

            // Return an array of opaque 'PubSub' handles i.e. [handle id, subscription, callback]
            const handles = [];

            // Filter al elements that aren't a valid callback function
            callbacks.filter((callback, index) => {
                if (_isFunction(callback)) {
                    return true;
                }

                // Remove the subscription string
                subscriptions.splice(index, 1);

                return false;
            });

            // Filter all elements that aren't a valid subscription
            subscriptions.filter((subscription, index) => {
                if (_isSubscription(subscription)) {
                    return true;
                }

                // Remove the callback function from the callback functions array
                callbacks.splice(index, 1);

                return false;
            })

            // Iterate through all the subscription strings
            .forEach((subscription, index) => {

                // If an array for the event name doesn't exist, then generate a new empty array
                // This cannot be done on the function datatype for obvious reasons (it's an array)
                if (!this._isSubscribed(subscription)) {
                    this._subscribers[subscription] = _isArray(this._subscribers[subscription]) ? this._subscribers[subscription] : [];
                }

                // Retrieve the callbacks for the subscription
                const functions = this._subscribers[subscription];

                // Store the callback
                const callback = callbacks[index];

                // Check if the callback hasn't already been registered for the subscription
                // Could use include() when ES2015 is widely available
                if (functions.indexOf(callback) === IS_NOT_FOUND) {
                    // Push the callback function to the subscription array
                    functions.push(callback);

                    // An opaque 'PubSub' handle
                    handles.push([
                        _handleId,
                        subscription,
                        callback,
                    ]);
                }
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
        unsubscribe(subscriptions, callbacks) {
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
            if (!_isArray(subscriptions) ||
                !_isArray(callbacks) ||
                subscriptions.length !== callbacks.length) {
                return false;
            }

            // Filter all elements that aren't a valid subscription or currently subscribed to with callback functions
            subscriptions.filter((subscription, index) => {
                if (this._isSubscribed(subscription)) {
                    return true;
                }

                // Remove the callback function from the callback functions array
                callbacks.splice(index, 1);

                return false;
            })

            // Iterate through all the subscription strings
            .forEach((subscription, index) => {
                // Retrieve the callback functions for the subscription
                const functions = this._subscribers[subscription];

                // If a callback function reference exists for the subscription,
                // then remove from the array using the index value
                const indexOf = functions.indexOf(callbacks[index]);
                if (indexOf !== IS_NOT_FOUND) {
                    functions.splice(indexOf, 1);
                }
            });

            return true;
        }

        /**
         * Check if a subscription string is subscribed to i.e. contains more than one callback function
         *
         * @param {string} subscription Subscription string value to check
         * @return {boolean} True, the subscription is subscribed to; otherwise, false
         */
        _isSubscribed(subscription) {
            return _isSubscription(subscription) && this._subscribers.hasOwnProperty(subscription) && this._subscribers[subscription].length > 0;
        }
    };
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
