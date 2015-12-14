'use strict';

/**
 * PubSub module
 *
 * https://github.com/softwarespot/pubsub
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 2.2.4
 */

// Constants

// Version number of the module
const VERSION = '2.2.4';

// Number of items to splice from the callback functions array
const DELETE_ITEMS_COUNT = 1;

// Value of indexOf when a value isn't found
const IS_NOT_FOUND = -1;

// Array constants enumeration
const HANDLE_ID = 0;
const HANDLE_SUBSCRIPTION = 1;
const HANDLE_CALLBACK = 2;
const HANDLE_MAX = 3;

// Fields

// Return strings of toString() found on the Object prototype
const _objectStringsArray = '[object Array]';
const _objectStringsFunction = '[object Function]';
const _objectStringsGenerator = '[object GeneratorFunction]';
const _objectStringsString = '[object String]';

// Store the Object prototype toString method
const _objectToString = window.Object.prototype.toString;

// Unique identifier (advanced leet speak for PubSub_Module)
const _handleId = '|>|_|85|_|8_|\\/|0|)|_|13';

// Generic handle for an error
// This is an array so the reference can be used as a
// way of verifying that it's an error
const _handleError = [_handleId];

// Helper methods

/**
 * Check if a variable is a function datatype
 *
 * @param {mixed} value Value to check
 * @returns {boolean} True, the value is a function datatype; otherwise, false
 */
function isFunction(value) {
    const tag = _objectToString.call(value);
    return tag === _objectStringsFunction || tag === _objectStringsGenerator;
}

/**
 * Check if a variable is an array datatype
 *
 * @param {mixed} value Value to check
 * @returns {boolean} True, the value is an array datatype; otherwise, false
 */
const isArray = isFunction(window.Array.isArray) ? window.Array.isArray : (value) => {
    return _objectToString.call(value) === _objectStringsArray;
};

/**
 * Check if a variable is a string datatype
 *
 * @param {mixed} value Value to check
 * @returns {boolean} True, the value is a string datatype; otherwise, false
 */
function isSubscription(value) {
    return (typeof value === 'string' || _objectToString.call(value) === _objectStringsString) && value.trim().length > 0;
}

/**
 * Check if a variable is an opaque handle
 *
 * @param {mixed} handle Handle to check
 * @returns {boolean} True, the handle is an opaque handle; otherwise, false
 */
function isHandle(handle) {
    // The opaque 'PubSub' handle must be an array
    return isArray(handle) &&

        // Have a length equal to that of HANDLE_MAX
        handle.length === HANDLE_MAX &&

        // Contain a handle at the 'id position'
        handle[HANDLE_ID] === _handleId &&

        // Contain a string at the 'subscription position'
        isSubscription(handle[HANDLE_SUBSCRIPTION]) &&

        // Contain a function at the 'callback position'
        isFunction(handle[HANDLE_CALLBACK]);
}

/**
 * Check if a variable is null
 *
 * @param {mixed} value Value to check
 * @returns {boolean} True, the value is null; otherwise, false
 */
function isNull(value) {
    return value === null;
}

/**
 * Check if a subscription string is subscribed to i.e. contains more than one callback function
 *
 * @param {string} subscription Subscription string value to check
 * @param {object} subscribers Subscription object
 * @return {boolean} True, the subscription is subscribed to; otherwise, false
 */
function isSubscribed(subscription, subscribers) {
    return isSubscription(subscription) && subscribers.hasOwnProperty(subscription) && subscribers[subscription].length > 0;
}

/**
 * Convert a subscription argument to a valid array
 *
 * @param {array|handle|string} subscriptions An array of subscription strings, a single subscription string or an opaque handle
 * returned by the subscribe function
 * @return {array|null} Subscription array; otherwise, null on error
 */
function subscriptionsToArray(subscriptions) {
    // Set the following variable(s), if it's an opaque 'PubSub' handle returned from subscribe()
    if (isHandle(subscriptions)) {
        // Convert to an array datatype
        subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];
    } else if (isSubscription(subscriptions)) {
        // If a string datatype has been passed, then convert to an array datatype
        subscriptions = [subscriptions];
    }

    return isArray(subscriptions) ? subscriptions : null;
}

// Interface

/**
 * PubSub class
 */
class PubSub {
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
        subscriptions = subscriptionsToArray(subscriptions);

        // If an invalid subscription argument is passed, then clear the subscribers object literal instead
        if (isNull(subscriptions)) {
            this._subscribers = {};
            return;
        }

        // Filter all elements that aren't a valid subscription or currently subscribed to with callback functions
        subscriptions.filter((subscription) => {
            return isSubscribed(subscription, this._subscribers);
        })

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
        subscriptions = subscriptionsToArray(subscriptions);

        // Store the number of subscriptions published
        let published = 0;

        // If not an array, then the subscription was an invalid array, handle or string
        if (isNull(subscriptions)) {
            return published;
        }

        // Push the subscription to the end of the arguments array as a comma separated string,
        // just in case it's required. Of course this will kind of fail if the user uses a subscription with a comma,
        // but that's up to them I guess!
        args.push(subscriptions.join(','));

        // Filter all elements that aren't a valid subscription or currently subscribed to with callback functions
        subscriptions.filter((subscription) => {
            return isSubscribed(subscription, this._subscribers);
        })

        // Iterate through all the subscription strings
        .forEach((subscription) => {

            // Iterate through all the functions for the particular subscription
            this._subscribers[subscription].forEach((fn) => {
                // Call the function with the arguments array using the spread operator
                // fn(...args); // Synchronous

                // Queue the callback function, as setTimeout is asynchronous
                window.setTimeout(() => {
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
        const isStringTypes = isSubscription(subscriptions) && isFunction(callbacks);

        // If a string and a function datatype, then create an array for each parameter
        if (isStringTypes) {
            callbacks = [callbacks];
            subscriptions = [subscriptions];
        }

        // If either of the arguments are not an array or the lengths mismatch, then return a handle error
        if (!isArray(subscriptions) ||
            !isArray(callbacks) ||
            subscriptions.length !== callbacks.length) {
            return _handleError;
        }

        // Return an array of opaque 'PubSub' handles i.e. [handle id, subscription, callback]
        const handles = [];

        // Filter all elements that aren't a valid callback function
        callbacks.filter((callback, index) => {
            if (isFunction(callback)) {
                return true;
            }

            // Remove the subscription
            subscriptions.splice(index, DELETE_ITEMS_COUNT);

            return false;
        });

        // Filter all elements that aren't a valid subscription and where the callback function doesn't exist
        subscriptions.filter((subscription, index) => {
            // If a valid subscription and the callback function doesn't exist. Could use include() when ES2015 is widely available
            if (isSubscription(subscription) && (this._subscribers[subscription] || []).indexOf(callbacks[index]) === IS_NOT_FOUND) {
                return true;
            }

            // Remove the callback function from the callback functions array
            callbacks.splice(index, DELETE_ITEMS_COUNT);

            return false;
        })

        // Iterate through all the subscription strings
        .forEach((subscription, index) => {

            // If an array for the event name doesn't exist, then generate a new empty array
            // This cannot be done on the function datatype for obvious reasons (it's an array)
            if (!isSubscribed(subscription, this._subscribers)) {
                this._subscribers[subscription] = isArray(this._subscribers[subscription]) ? this._subscribers[subscription] : [];
            }

            // Retrieve the callbacks for the subscription
            const functions = this._subscribers[subscription];

            // Store the callback
            const callback = callbacks[index];

            // Push the callback function to the subscription array
            functions.push(callback);

            // An opaque 'PubSub' handle
            handles.push([
                _handleId,
                subscription,
                callback,
            ]);
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
        if (isHandle(subscriptions)) {
            // Do not swap these around, otherwise it will cause an error with overwriting subscriptions before
            // setting the callbacks variable
            callbacks = [subscriptions[HANDLE_CALLBACK]];
            subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];
        } else if (isSubscription(subscriptions) && isFunction(callbacks)) {
            // If a string and function datatype, then create an array for each variable
            callbacks = [callbacks];
            subscriptions = [subscriptions];
        }

        // If either of the arguments are not an array or the lengths simply mismatch, then return false
        if (!isArray(subscriptions) ||
            !isArray(callbacks) ||
            subscriptions.length !== callbacks.length) {
            return false;
        }

        // Filter all elements that aren't a valid subscription or currently subscribed to with callback functions
        subscriptions.filter((subscription, index) => {
            if (isSubscribed(subscription, this._subscribers)) {
                return true;
            }

            // Remove the callback function from the callback functions array
            callbacks.splice(index, DELETE_ITEMS_COUNT);

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
                functions.splice(indexOf, DELETE_ITEMS_COUNT);
            }
        });

        return true;
    }
}

// Public API

// Create an instance of the PubSub interface
const _pubSubInterface = new PubSub();

// See clear in the documentation
export const clear = (subscriptions) => {
    return _pubSubInterface.clear(subscriptions);
};

// Expose the underlying interface to create multiple instances of the module
export const getInterface = () => {
    return PubSub;
};

// See getVersion in the documentation
export const getVersion = () => {
    return _pubSubInterface.getVersion();
};

// See publish in the documentation
export const publish = (subscriptions, ...args) => {
    return _pubSubInterface.publish(subscriptions, ...args);
};

// See subscribe in the documentation
export const subscribe = (subscriptions, callbacks) => {
    return _pubSubInterface.subscribe(subscriptions, callbacks);
};

// See unsubscribe in the documentation
export const unsubscribe = (subscriptions, callbacks) => {
    return _pubSubInterface.unsubscribe(subscriptions, callbacks);
};

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
