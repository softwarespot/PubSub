'use strict';

(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.PubSub = mod.exports;
    }
})(this, function (exports) {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = (function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    })();

    var VERSION = '2.2.4';
    var DELETE_ITEMS_COUNT = 1;
    var IS_NOT_FOUND = -1;
    var HANDLE_ID = 0;
    var HANDLE_SUBSCRIPTION = 1;
    var HANDLE_CALLBACK = 2;
    var HANDLE_MAX = 3;
    var _objectStringsArray = '[object Array]';
    var _objectStringsFunction = '[object Function]';
    var _objectStringsGenerator = '[object GeneratorFunction]';
    var _objectStringsString = '[object String]';
    var _objectToString = window.Object.prototype.toString;
    var _handleId = '|>|_|85|_|8_|\\/|0|)|_|13';
    var _handleError = [_handleId];

    function _isFunction(value) {
        var tag = _objectToString.call(value);

        return tag === _objectStringsFunction || tag === _objectStringsGenerator;
    }

    var _isArray = _isFunction(window.Array._isArray) ? window.Array._isArray : function (value) {
        return _objectToString.call(value) === _objectStringsArray;
    };

    function _isSubscription(value) {
        return (typeof value === 'string' || _objectToString.call(value) === _objectStringsString) && value.trim().length > 0;
    }

    function _isHandle(handle) {
        return _isArray(handle) && handle.length === HANDLE_MAX && handle[HANDLE_ID] === _handleId && _isSubscription(handle[HANDLE_SUBSCRIPTION]) && _isFunction(handle[HANDLE_CALLBACK]);
    }

    function _isNull(value) {
        return value === null;
    }

    function _isSubscribed(subscription, subscribers) {
        return _isSubscription(subscription) && subscribers.hasOwnProperty(subscription) && subscribers[subscription].length > 0;
    }

    function _subscriptionsToArray(subscriptions) {
        if (_isHandle(subscriptions)) {
            subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];
        } else if (_isSubscription(subscriptions)) {
            subscriptions = [subscriptions];
        }

        return _isArray(subscriptions) ? subscriptions : null;
    }

    var PubSub = (function () {
        function PubSub() {
            _classCallCheck(this, PubSub);

            this._subscribers = {};
        }

        _createClass(PubSub, [{
            key: 'clear',
            value: function clear(subscriptions) {
                var _this = this;

                subscriptions = _subscriptionsToArray(subscriptions);

                if (_isNull(subscriptions)) {
                    this._subscribers = {};
                    return;
                }

                subscriptions.filter(function (subscription) {
                    return _isSubscribed(subscription, _this._subscribers);
                }).forEach(function (subscription) {
                    var functions = _this._subscribers[subscription];
                    var length = functions.length;
                    functions.splice(0, length);
                });
            }
        }, {
            key: 'getVersion',
            value: function getVersion() {
                return VERSION;
            }
        }, {
            key: 'publish',
            value: function publish(subscriptions) {
                var _this2 = this;

                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                subscriptions = _subscriptionsToArray(subscriptions);
                var published = 0;

                if (_isNull(subscriptions)) {
                    return published;
                }

                args.push(subscriptions.join(','));
                subscriptions.filter(function (subscription) {
                    return _isSubscribed(subscription, _this2._subscribers);
                }).forEach(function (subscription) {
                    _this2._subscribers[subscription].forEach(function (fn) {
                        window.setTimeout(function () {
                            fn.apply(undefined, args);
                        }, 0);
                        published++;
                    });
                });
                return published;
            }
        }, {
            key: 'subscribe',
            value: function subscribe(subscriptions, callbacks) {
                var _this3 = this;

                var isStringTypes = _isSubscription(subscriptions) && _isFunction(callbacks);

                if (isStringTypes) {
                    callbacks = [callbacks];
                    subscriptions = [subscriptions];
                }

                if (!_isArray(subscriptions) || !_isArray(callbacks) || subscriptions.length !== callbacks.length) {
                    return _handleError;
                }

                var handles = [];
                callbacks.filter(function (callback, index) {
                    if (_isFunction(callback)) {
                        return true;
                    }

                    subscriptions.splice(index, DELETE_ITEMS_COUNT);
                    return false;
                });
                subscriptions.filter(function (subscription, index) {
                    if (_isSubscription(subscription) && (_this3._subscribers[subscription] || []).indexOf(callbacks[index]) === IS_NOT_FOUND) {
                        return true;
                    }

                    callbacks.splice(index, DELETE_ITEMS_COUNT);
                    return false;
                }).forEach(function (subscription, index) {
                    if (!_isSubscribed(subscription, _this3._subscribers)) {
                        _this3._subscribers[subscription] = _isArray(_this3._subscribers[subscription]) ? _this3._subscribers[subscription] : [];
                    }

                    var functions = _this3._subscribers[subscription];
                    var callback = callbacks[index];
                    functions.push(callback);
                    handles.push([_handleId, subscription, callback]);
                });

                if (handles.length === 0) {
                    return isStringTypes ? _handleError : [_handleError];
                }

                return isStringTypes ? handles[0] : handles;
            }
        }, {
            key: 'unsubscribe',
            value: function unsubscribe(subscriptions, callbacks) {
                var _this4 = this;

                if (subscriptions === _handleError) {
                    return false;
                }

                if (_isHandle(subscriptions)) {
                    callbacks = [subscriptions[HANDLE_CALLBACK]];
                    subscriptions = [subscriptions[HANDLE_SUBSCRIPTION]];
                } else if (_isSubscription(subscriptions) && _isFunction(callbacks)) {
                    callbacks = [callbacks];
                    subscriptions = [subscriptions];
                }

                if (!_isArray(subscriptions) || !_isArray(callbacks) || subscriptions.length !== callbacks.length) {
                    return false;
                }

                subscriptions.filter(function (subscription, index) {
                    if (_isSubscribed(subscription, _this4._subscribers)) {
                        return true;
                    }

                    callbacks.splice(index, DELETE_ITEMS_COUNT);
                    return false;
                }).forEach(function (subscription, index) {
                    var functions = _this4._subscribers[subscription];
                    var indexOf = functions.indexOf(callbacks[index]);

                    if (indexOf !== IS_NOT_FOUND) {
                        functions.splice(indexOf, DELETE_ITEMS_COUNT);
                    }
                });
                return true;
            }
        }]);

        return PubSub;
    })();

    var _pubSubInterface = new PubSub();

    var clear = exports.clear = function clear(subscriptions) {
        return _pubSubInterface.clear(subscriptions);
    };

    var getInterface = exports.getInterface = function getInterface() {
        return PubSub;
    };

    var getVersion = exports.getVersion = function getVersion() {
        return _pubSubInterface.getVersion();
    };

    var publish = exports.publish = function publish(subscriptions) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
        }

        return _pubSubInterface.publish.apply(_pubSubInterface, [subscriptions].concat(args));
    };

    var subscribe = exports.subscribe = function subscribe(subscriptions, callbacks) {
        return _pubSubInterface.subscribe(subscriptions, callbacks);
    };

    var unsubscribe = exports.unsubscribe = function unsubscribe(subscriptions, callbacks) {
        return _pubSubInterface.unsubscribe(subscriptions, callbacks);
    };
});