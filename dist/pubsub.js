/* global IPubSub */

/*
 * PubSub module
 * https://github.com/softwarespot/pubsub
 * Author: softwarespot
 * Licensed under the MIT license
 * Version: 1.0.0
 */
'use strict';

; // jshint ignore:line
var PubSub = (function (IPubSub) {
    // jshint ignore:line
    // Constants

    // Version number of the module
    var VERSION = '1.0.0';

    // Create an instance of the PubSub interface
    var _pubSub = new IPubSub();

    // Public API

    return {
        // See subscribe in IPubSub documentation
        subscribe: function subscribe(subscriptions, callbacks) {
            return _pubSub.subscribe(subscriptions, callbacks);
        },

        // See unsubscribe in IPubSub documentation
        unsubscribe: function unsubscribe(subscriptions, callbacks) {
            return _pubSub.unsubscribe(subscriptions, callbacks);
        },

        // See publish in IPubSub documentation
        publish: function publish(subscriptions) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return _pubSub.publish.apply(_pubSub, [subscriptions].concat(args));
        },

        // See clear in IPubSub documentation
        clear: function clear() {
            return _pubSub.clear();
        },

        // Get the version number of the module
        getVersion: function getVersion() {
            return VERSION;
        }
    };
})(IPubSub);