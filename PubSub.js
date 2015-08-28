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

/**
 * PubSub module
 *
 * Modified: 2015/08/28
 * @author softwarespot
 */
var PubSub = (function (Array, Object) {
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

    // Fields

    // Hold event names with an array of callbacks for each one
    var _subscribers = {};

    // Unique identifier. Leet speak for PubSub_Module
    var _handleId = '|>|_|85|_|8_|\\/|0|)|_|13';

    // Generic handle for an error. This is an array so the reference can be used as a
    // way of verifying that it's an error
    var _handleError = [_handleId];

    // Store the Object toString method
    var _objectToString = Object.prototype.toString;

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
        // Returns an opaque handle for use with unsubscribe(), though it's optional to use
        subscribe: function (subscriptions, callbacks) { // on()
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

            // Variables used with inside the loop(s)
            var subscription = null;
            var functions = null;
            var callback = null;

            // Return array of handles i.e. [handle id, subscription, callback]
            var handles = [];

            // Iterate through all the subscriptions
            for (var i = 0, subscriptionsLength = subscriptions.length; i < subscriptionsLength; i++) {
                // Store the subscription
                subscription = subscriptions[i];

                // If an array for the event name doesn't exist, then generate a new empty array
                // This cannot be done on the function datatype for obvious reasons
                _subscribers[subscription] = _subscribers[subscription] || [];

                // Retrieve the callbacks for the subscription
                functions = _subscribers[subscription];

                // Store the callback
                callback = callbacks[i];

                // The callback should be a function datatype
                if (!isFunction(callback)) {
                    continue;
                }

                // Check if the callback hasn't already been registered for the event name
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
        unsubscribe: function (subscriptions, callbacks) { // off()
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

            // Variables used with the loop(s)
            var functions = null;
            var index = 0;

            // Iterate through all the subscriptions
            for (var i = 0, subscriptionsLength = subscriptions.length; i < subscriptionsLength; i++) {
                // Retrieve the callbacks for the subscription
                functions = _subscribers[subscriptions[i]];

                // The subscription hasn't been created or there are simply no callbacks assigned
                if (!functions) {
                    continue;
                }

                // If a callback function reference exists for the subscription,
                // then remove from the array using the index value
                index = functions.indexOf(callbacks[i]);
                if (index !== -1) {
                    // Only remove one value
                    functions.splice(index, 1);
                }
            }

            return true;
        },

        // Publish a subscription to all subscribers with an unlimited number of arguments. The subscription is the last argument i.e. arguments[arguments.length]
        // Returns number of subscriptions published
        publish: function (subscriptions) { // emit()
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

            var i = 0;
            var length = 0;

            // Construct new arguments to pass to the callback function

            // Convert the array-like object to an array
            // URL: https://shifteleven.com/articles/2007/06/28/array-like-objects-in-javascript/
            // var callbackParams = Array.prototype.slice.call(arguments);

            // Remove the first element from the arguments array-like object, as this contains
            // the subscription name that is not required
            // callbackParams.shift(); // Quicker than .splice()

            // According to MDN, this is a safer approach to constructing a new array. It starts from 1 to
            // skip the first parameter which is the subscription name
            // URL: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
            var callbackParams = [];
            for (i = 1, length = arguments.length; i < length; i++) {
                callbackParams.push(arguments[i]);
            }

            // Push the subscription to the end of the arguments array as a comma separated string,
            // just in case it's required
            callbackParams.push(subscriptions.join(','));

            // Variables used with the loop(s)
            var functionsLength = 0;
            var functions = null;
            var j = 0;

            // Iterate through all the subscriptions
            for (i = 0, length = subscriptions.length; i < length; i++) {
                // Retrieve the callbacks for the subscription
                functions = _subscribers[subscriptions[i]];

                // The subscription hasn't been created or there are simply no callbacks assigned
                if (!functions) {
                    continue;
                }

                // For each callback function, call the function with the callback arguments
                // by using apply() and passing the (new) array of arguments
                for (j = 0, functionsLength = functions.length; j < functionsLength; j++) {
                    functions[j].apply(this, callbackParams);
                    // Increase the number of publish subscriptions
                    published++;
                }
            }

            return published;
        },

        // Clear the internal subscribers store
        clear: function () {
            _subscribers = {};
        },

        // Get the version number of the module
        getVersion: function () {
            return VERSION;
        }
    };
})(Array, Object);

// Demo

// A simple demo of how to use the following PubSub module
// DO NOT USE ANONYMOUS FUNCTIONS AS YOU WILL BE UNABLE TO UNSUBSCRIBE LATER ON

function fireFirst() {
    console.log('fireFirst: %o', arguments);
}

function fireSecond(arg1, arg2) {
    console.log('fireSecond: %o', arguments);
    // console.log('Arguments: %s, %s', arg1, arg2);
}

console.log('!!! START PubSub DEMO');

// Subscribe to an event and bind a callback for each by passing a function reference
var handle = PubSub.subscribe('search/twitter', fireFirst);

// Display the handle returned by the subscription
console.log('Handle: %o', handle);

PubSub.subscribe('search/twitter', fireSecond);

// Publish the event
PubSub.publish('search/twitter', 'Example arg1', 'Example arg2');

// Look in the browser's console

// Destroy the event only for the second function by passing the event name and the function reference i.e. fireSecond (no parentheses)
PubSub.unsubscribe('search/twitter', fireSecond);

// Publish the event
// Notice how there is only one console.log() displayed, which is for the fireFirst() function
console.log('This should NOT show for the fireSecond function');
PubSub.publish('search/twitter', 'Example arg1', 'Example arg2');

// Destroy the event for the fist function by passing the handle
PubSub.unsubscribe(handle);

// Publish the event
// Notice no event fired
console.log('This should NOT show for any events, as all were unsubscribed previously');
PubSub.publish('search/twitter', 'Example arg1', 'Example arg2');

// Test subscribing to multiple subscriptions and unsubscribing
console.log('Testing multiple subscriptions:');
PubSub.subscribe(['search/github', 'search/js'], [fireFirst, fireSecond]);
console.log('Events should display below:');
PubSub.publish(['search/github', 'search/js']);
PubSub.unsubscribe(['search/github', 'search/js'], [fireFirst, fireSecond]);
console.log('Events should NOT display below:');
PubSub.publish(['search/github', 'search/js']);

console.log('!!! END PubSub DEMO');
