/* global IPubSub */

/*
 * PubSub module
 * https://github.com/softwarespot/pubsub
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 1.0.0
 */
; // jshint ignore:line
let PubSub = ((IPubSub) => { // jshint ignore:line
    // Constants

    // Version number of the module
    const VERSION = '1.0.0';

    // Create an instance of the PubSub interface
    const _pubSub = new IPubSub();

    // Public API

    return {
        // See subscribe in IPubSub documentation
        subscribe: (subscriptions, callbacks) => {
            return _pubSub.subscribe(subscriptions, callbacks);
        },

        // See unsubscribe in IPubSub documentation
        unsubscribe: (subscriptions, callbacks) => {
            return _pubSub.unsubscribe(subscriptions, callbacks);
        },

        // See publish in IPubSub documentation
        publish: (subscriptions, ...args) => {
            return _pubSub.publish(subscriptions, ...args);
        },

        // See clear in IPubSub documentation
        clear: () => {
            return _pubSub.clear();
        },

        // Get the version number of the module
        getVersion: () => {
            return VERSION;
        }
    };
})(IPubSub);
