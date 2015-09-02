/*
 * PubSub module
 * https://github.com/softwarespot/PubSub
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 0.1.0
 */
'use strict';

; // jshint ignore:line
var PubSub = (function (Array, Object) {
    // jshint ignore:line
    // Constants

    // Version number of the module
    var VERSION = '0.1.0';

    // Array constant enumeration
    var HANDLE_ID = 0,
        HANDLE_SUBSCRIPTION = 1,
        HANDLE_CALLBACK = 2,
        HANDLE_MAX = 3;

    // Return strings of toString() found on the Object prototype
    var ObjectStrings = {
        FUNCTION: '[object Function]',
        STRING: '[object String]'
    };

    // Store the Object toString method
    var _objectToString = Object.prototype.toString;

    // Unique identifier. Leet speak for PubSub_Module
    var _handleId = '|>|_|85|_|8_|\\/|0|)|_|13';

    // Generic handle for an error. This is an array so the reference can be used as a
    // way of verifying that it's an error
    var _handleError = [_handleId];

    // Fields

    // Hold event names with an array of callbacks for each one
    var _subscribers = {};

    // Methods

    // Check if a value is a function. Based on the idea by lodash
    function isFunction(value) {

        return isObject(value) && _objectToString.call(value) === ObjectStrings.FUNCTION;
    }

    // Check if an opaque 'PubSub' handle is valid
    function isHandle(handle) {

        return Array.isArray(handle) && handle.length === HANDLE_MAX && handle[HANDLE_ID] === _handleId;
    }

    // Check if a value is an object. Based on the idea by lodash
    function isObject(value) {

        // Store the typeof
        var type = typeof value;

        // !!value is basically checking if value is not 'truthy' e.g. null or zero and then inverts that boolean value
        // So, !'Some test' is false and then inverting false is true. There if value contains 'something', continue
        return !!value && (type === 'object' || type === 'function');
    }

    // Check if a value is a string datatype with a length greater than zero when whitespace is stripped. Based partially on the idea by lodash
    function isString(value) {

        return (typeof value === 'string' || _objectToString.call(value) === ObjectStrings.STRING) && value.trim().length > 0;
    }

    // Public API
    return {
        // Subscribe to a subscription with a callback function. It's best practice not to make this an anonymous function
        // as then you can't properly unsubscribe, since the callback function reference is required
        // Returns an opaque handle for use with unsubscribe(), though it's optional to use of course
        subscribe: function subscribe(subscriptions, callbacks) {
            // on()
            // Store whether the first param is a string
            var isStringTypes = isString(subscriptions) && isFunction(callbacks);

            // If a string and a function datatype, then create an array for each
            if (isStringTypes) {
                callbacks = [callbacks];
                subscriptions = [subscriptions];
            }

            // If either of the arguments are not an array or the lengths simply mismatch
            if (!Array.isArray(subscriptions) || !Array.isArray(callbacks) || subscriptions.length !== callbacks.length) {
                return _handleError;
            }

            // Return array of handles i.e. [handle id, subscription, callback]
            var handles = [];

            // Iterate through all the subscriptions
            for (var i = 0, subscriptionsLength = subscriptions.length; i < subscriptionsLength; i++) {
                // Store the subscription
                var subscription = subscriptions[i];

                // If an array for the event name doesn't exist, then generate a new empty array
                // This cannot be done on the function datatype for obvious reasons
                _subscribers[subscription] = _subscribers[subscription] || [];

                // Retrieve the callbacks for the subscription
                var functions = _subscribers[subscription];

                // Store the callback
                var callback = callbacks[i];

                // The callback should be a function datatype
                if (!isFunction(callback)) {
                    continue;
                }

                // Check if the callback hasn't already been registered for the event name
                // Could use include() when ES2015 is widely available
                if (functions.indexOf(callback) === -1) {
                    // Push the callback function to the event name array
                    functions.push(callback);

                    // An opaque 'PubSub' handle
                    handles.push([_handleId, subscription, callback]);
                }
            }

            // An error occurred as no opaque 'PubSub' handles were pushed to the handles array
            if (handles.length === 0) {
                return isStringTypes ? _handleError : [_handleError];
            }

            // If a string was passed as the first parameter, then return a single handle instead of an array of handles
            return isStringTypes ? handles[0] : handles;
        },

        // Unsubscribe from a subscription. A string and callback function reference are expected OR
        // the handle returned from subscribe()
        // Returns true or false
        unsubscribe: function unsubscribe(subscriptions, callbacks) {
            // off()
            // If the reference is equal to the handle error array, then an error occurred with subscribing
            if (subscriptions === _handleError) {
                return false;
            }

            // Set the following variable(s), if it's an opaque 'PubSub' handle returned from subscribe()
            if (isHandle(subscriptions)) {
                // Do not swap, otherwise it will cause an error with overwriting subscriptions
                // The value of callbacks will be ignored
                callbacks = [subscriptions[HANDLE_CALLBACK]];
                subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];
                // If a string and a function datatype, then create an array for each
            } else if (isString(subscriptions) && isFunction(callbacks)) {
                    callbacks = [callbacks];
                    subscriptions = [subscriptions];
                }

            // If either of the arguments are not an array or the lengths simply mismatch
            if (!Array.isArray(subscriptions) || !Array.isArray(callbacks) || subscriptions.length !== callbacks.length) {
                return false;
            }

            // Iterate through all the subscriptions
            for (var i = 0, subscriptionsLength = subscriptions.length; i < subscriptionsLength; i++) {
                // Retrieve the callbacks for the subscription
                var functions = _subscribers[subscriptions[i]];

                // The subscription hasn't been created or there are simply no callbacks assigned
                if (!functions) {
                    continue;
                }

                // If a callback function reference exists for the subscription,
                // then remove from the array using the index value
                var index = functions.indexOf(callbacks[i]);
                if (index !== -1) {
                    // Only remove one value
                    functions.splice(index, 1);
                }
            }

            return true;
        },

        // Publish a subscription to all subscribers with an unlimited number of arguments. The subscription is the last argument i.e. arguments[arguments.length]
        // Returns number of subscriptions published
        publish: function publish(subscriptions) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            // emit()
            // Set the following variable(s), if it's an opaque 'PubSub' handle returned from subscribe()
            if (isHandle(subscriptions)) {
                // Convert to an array datatype
                subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];
                // If a string has been passed, then convert to an array datatype
            } else if (isString(subscriptions)) {
                    subscriptions = [subscriptions];
                }

            // Store the number of subscriptions published
            var published = 0;

            // If not an array, then the subscription was either not a valid array, handle or string
            if (!Array.isArray(subscriptions)) {
                return published;
            }

            // Push the subscription to the end of the arguments array as a comma separated string,
            // just in case it's required
            args.push(subscriptions.join(','));

            // Iterate through all the subscriptions
            for (var i = 0, _length = subscriptions.length; i < _length; i++) {
                // Retrieve the callbacks for the subscription
                var functions = _subscribers[subscriptions[i]];

                // The subscription hasn't been created or there are simply no callbacks assigned
                if (!functions) {
                    continue;
                }

                // Error with babel changing 'this' to 'undefined', therefore cache 'this' instead
                var _this = undefined;

                // For each callback function, call the function with the callback arguments
                // by using apply() and passing the array of arguments
                for (var j = 0, functionsLength = functions.length; j < functionsLength; j++) {
                    functions[j].apply(_this, args);
                    // Increase the number of publish subscriptions
                    published++;
                }
            }

            // Return the number of subscribers published to
            return published;
        },

        // Clear the internal subscribers store
        clear: function clear() {
            _subscribers = {};
        },

        // Get the version number of the module
        getVersion: function getVersion() {
            return VERSION;
        }
    };
})(Array, Object);

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