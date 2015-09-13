# PubSub - v1.2.0

## What exactly is PubSub?

PubSub is a JavaScript module based around the Publish–Subscribe pattern. If you're unfamiliar with the Publish-Subscribe pattern, then please familiarise yourself by visiting the [MSDN](https://msdn.microsoft.com/en-us/library/ff649664.aspx) article about `PubSub`. You will be amazed as to why you didn't know this before.

The module is written using ES2015, though transpiled using [babel](https://babeljs.io) from ES2015 to ES5. The reason being is that not all browsers are currently supporting the full specification of ES2015, which hopefully will be in the next 6-12 months. The transpiled files are located in the `dist` directory.

## How to use

```javascript
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

## How to install

If you use bower, then just copy and paste the following command to the shell window. (**Note:** pubsub was already taken.)
```shell
    bower install pubsub-module
```

Otherwise just include `pubsub.min.js` somewhere in your document. The plugin is supports AMD, NodeJS or Browserify module loaders.

## Documentation

The following documentation outlines in detail about using the following plugin.

### Subscribe

To subscribe to a particular subscription or list of subscriptions, pass either a string or array of strings of the subscription(s). A callback function or array of callback functions must be passed as the second parameter. It's recommended that the callback function be named and not anonymous functions. This will return either a `handle` or array of `handles` depending on what was passed to the function.

```javascript
    // Using a string and callback function
    PubSub.subscribe('subscription', callbackFunction);

    // Using an array of strings and an array of callback functions. They must be the same length
    PubSub.subscribe([subscription1, subscription2, subscriptionn], [callbackFunction1, callbackFunction2, callbackFunctionn]);
```

To unsubscribe from a particular subscription or list of subscriptions, is achieved by passing a string, an array of strings or a 'handle' returned by subscribe(). If a string or array of strings if passed, then pass either a callback function or array of callback functions respectively. The second parameter is ignored if the first parameter is passed a 'handle'.

### Unsubscribe
```javascript
    // Using a string and callback function
    PubSub.unsubscribe('subscription', callbackFunction);

    // Using an array of strings and an array of callback functions. They must be the same length
    PubSub.unsubscribe(['subscription1', 'subscription2', 'subscriptionn'], [callbackFunction1, callbackFunction2, callbackFunctionn]);

    // Using the 'handle' by subscribe()
    let subHandle = PubSub.subscribe('subscription', callbackFunction);

    // ... further along in the code ...

    // Unsubscribe using the 'handle'
    PubSub.unsubscribe(subHandle);
```

To publish to a particular subscription or list of subscriptions, is achieved by passing a string, an array of strings or a 'handle' returned by subscribe().

### Publish
```javascript
    // Publish to those who have subscribed to a subscription
    PubSub.publish('subscription', arg1, arg2, argn ... [args are optional]);

    // Using an array of strings
    PubSub.publish(['subscription1', 'subscription2', 'subscriptionn'], arg1, arg2, argn ... [args are optional]);

    // Using the 'handle' by subscribe()
    let subHandle = PubSub.subscribe('subscription', callbackFunction);

    // ... further along in the code ...

    // Publish using the 'handle'
    PubSub.publish(subHandle, arg1, arg2, argn ... [args are optional]);
```

To clear all subscriptions, use the `clear` function

### Clear
```javascript
    // Clear all subscriptions
    PubSub.clear();
```

The module uses an underlying interface which is exposed via the `getInterface` function and therefore can be used adjacent to the global PubSub module without interference. The functions exposed are `subscribe`, `unsubscribe`, `publish` and `clear`.

### Interface
```javascript
    // Retrieve the module's interface
    // 'subscribe', 'unsubscribe', 'publish' and 'clear'
    let interface = PubSub.getInterface();

    // Create a new instance of the interface
    let myPubSub = new interface();

    // Publish to those who have subscribed to a subscription (see above for more details)
    // This does not publish to those subscribed to the global module
    myPubSub.publish('subscription', arg1, arg2, argn ... [args are optional]);
```

To retrieve the version number of the module, use `getVersion`

### Version
```javascript
    // Retrieve the version number of the module
    let version = PubSub.getVersion();

    // Display in the console
    console.log(version);
```

## Contribute

To contribute to the project, you will first need to install [gulp](http://gulpjs.com) globally on your system. Once installation has completed, change the working directory to the plugin's location and run the following command:

```shell
    npm install
```

After installation of the local modules, you're ready to start contributing to the project. Before you submit your PR, please don't forget to call `gulp`, which will run against [JSHint](http://jshint.com) for any errors, but will also minify the plugin and transpile using [babel](https://babeljs.io).

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
