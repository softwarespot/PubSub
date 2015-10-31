# PubSub - v2.2.4

An easy to use publish subscribe module, based on the mediator pattern.

## What exactly is PubSub?

PubSub is a JavaScript module based around the Publish–Subscribe pattern. If you're unfamiliar with the Publish-Subscribe pattern, then please familiarise yourself by visiting the [MSDN](https://msdn.microsoft.com/en-us/library/ff649664.aspx) article about `PubSub`. You will be amazed as to why you didn't know this before.

## How to use

```html
    <!--Use the minified version for better performance-->
    <script src="pubsub.min.js"></script>

    <script>
        // Call the following function when
        function subscribed() {
            // Display the alert when the 'onrefresh' is published to
            window.alert('The "onrefresh" subscription was published to.');
        }

        // Register a subscription to 'onrefresh' with the 'subscribed' callback function.
        // The function will be called when a subscription is published to
        PubSub.subscribe('onrefresh', subscribed);

        // ... further along in the code ...

        // Publish to the 'onrefresh' subscription, in that any of those callback functions subscribed,
        // will be called. No additional arguments have been provided
        PubSub.publish('onrefresh');

        // See examples/index.html for additional examples
    </script>
```

## ES2015

The module is written using ES2015, but is transpiled using [babel](https://babeljs.io) to ES5. The reason for using [babel](https://babeljs.io), is not all browsers currently support the ES2015 specification, though will likely change very soon. The transpiled files are located in the `dist` directory.

## How to install

If you use bower, then just copy and paste the following command to the shell window. (**Note:** pubsub was already taken.)
```shell
    bower install pubsub-module
```

Otherwise just include `pubsub.min.js` somewhere in your document. The following module also supports AMD or Node.js module type loaders.

**Note:** The module will throw an error if the name `PubSub` is found in the global space.

## Documentation

The following documentation outlines in detail about using the following module.

### Subscribe

To subscribe to a particular subscription or a list of subscriptions, pass either a string or an array of strings of the subscription(s). A callback function or an array of callback functions must be passed as the second argument, depending on the first argument type used. It's recommended that the callback function(s) be named and not anonymous functions (see `unsubscribe`).
The function will return either a 'handle' or an array of 'handles', depending on what was passed as the first argument i.e. an array of subscriptions will return an array of 'handles' and a subscription string will return a 'handle'.

```javascript
    // Using a string and callback function
    PubSub.subscribe('subscription', callbackFunction);

    // Using an array of strings and an array of callback functions. They must be the same length
    PubSub.subscribe([subscription1, subscription2, subscriptionN], [callbackFunction1, callbackFunction2, callbackFunctionn]);
```

### Unsubscribe

To unsubscribe from a particular subscription or a list of subscriptions, can be done by passing a string, an array of strings or a 'handle' returned by `subscribe`. If a string or an array of strings if passed, then pass either a callback function or array of callback functions respectively. The second argument is ignored if the first argument is passed a 'handle'.
The function returns true on successful unsubscription; otherwise, false.

```javascript
    // Using a string and callback function
    PubSub.unsubscribe('subscription', callbackFunction);

    // Using an array of strings and an array of callback functions. They must be the same length
    PubSub.unsubscribe(['subscription1', 'subscription2', 'subscriptionN'], [callbackFunction1, callbackFunction2, callbackFunctionn]);

    // Using the 'handle' by subscribe()
    let subHandle = PubSub.subscribe('subscription', callbackFunction);

    // ... further along in the code ...

    // Unsubscribe using the 'handle'
    PubSub.unsubscribe(subHandle);
```

### Publish

To publish to a particular subscription or list of subscriptions, can be done by passing a string, an array of strings or a 'handle' returned by `subscribe`. The second argument is the argument(s) to pass to the callback functions that have registered with the subscription. The last argument passed to the callback function(s) will always be a comma delimited string (CSV), that outlines the subscription(s) that were published to (even if no arguments were passed).
The function returns the number of subscribers publish to.

```javascript
    // Publish to those who have subscribed to a subscription
    PubSub.publish('subscription', arg1, arg2, argN ... [args are optional]);

    // Using an array of strings
    PubSub.publish(['subscription1', 'subscription2', 'subscriptionN'], arg1, arg2, argN ... [args are optional]);

    // Using the 'handle' by subscribe()

    // Callback function that will be invoked when the subscription is published to
    function callBackFunction(arg1, arg2, argN, subscriptionsArg) {
        // Display the subscriptions that were published to
        console.log(subscriptionsArg);
    }

    let subHandle = PubSub.subscribe('subscription', callbackFunction);

    // ... further along in the code ...

    // Publish using the 'handle'
    PubSub.publish(subHandle, arg1, arg2, argN ... [args are optional]);
```

### Clear

To clear all subscriptions, use the `clear` function.

```javascript
    // Clear all subscriptions
    PubSub.clear();
```

### Interface

The module uses an underlying interface which is exposed via the `getInterface` function and therefore can be used adjacent to the global PubSub module without interference. The functions exposed are `subscribe`, `unsubscribe`, `publish`, `clear` and `getVersion`. See above for details about usage.

```javascript
    // Retrieve the module's interface
    // 'subscribe', 'unsubscribe', 'publish' and 'clear'
    let interface = PubSub.getInterface();

    // Create a new instance of the interface
    let myPubSub = new interface();

    // Publish to those who have subscribed to a subscription (see above for more details)
    // This does not publish to those subscribed to the global module
    myPubSub.publish('subscription', arg1, arg2, argN ... [args are optional]);

    // Publish to those who have subscribed to a subscription using the global module. This does not affect 'myPubSub'
    PubSub.publish('subscription', arg1, arg2, argN ... [args are optional]);
```

### Version

To retrieve the version number of the module, use `getVersion`.

```javascript
    // Retrieve the version number of the module
    let version = PubSub.getVersion();

    // Display in the console
    console.log(version);
```

## Contribute

To contribute to the project, you will first need to install [gulp](http://gulpjs.com) globally on your system. Once installation has completed, change the working directory to the module's location and run the following command:

```shell
    npm install
```

After installation of the local modules, you're ready to start contributing to the project. Before you submit your PR, please don't forget to call `gulp`, which will run against [JSHint](http://jshint.com) for any errors, but will also minify the module and transpile using [babel](https://babeljs.io).

##### Watch
Call the following command to start 'watching' for any changes to the main JavaScript file(s). This will automatically invoke JSHint and Uglify.
```shell
    gulp watch
```

##### JSHint
Call the following command to invoke JSHint and check that the changes meet the requirements set in .jshintrc.
```shell
    gulp jshint
```

##### Uglify
Call the following command to invoke Uglify, which will minify the main JavaScript file(s) and output to a .min.js file respectively.
```shell
    gulp uglify
```

##### Build
Call the following command to invoke both babel, JSHint and Uglify.
```shell
    gulp
```
