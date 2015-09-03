# PubSub - v0.1.0

## What exactly is PubSub?

PubSub is a JavaScript module of the Publish–Subscribe pattern.

The README will be finalised by 2015/09/05

```javascript
    <!--Use the minified version for better performance-->
    <script src="pubsub.min.js"></script>

    <script>
        // See examples/index.html
    </script>
```

## How to install

If you use bower, then just copy and paste the following command to the shell window. (**Note:** pubsub was already taken.)
```shell
    bower install pubsub-module
```

Otherwise just include `pubsub.min.js` somewhere in your document.

## Documentation

The following documentation outlines in detail how to use the following plugin.

## Contribute

To contribute to the project, you will first need to install [gulp](gulpjs.com) globally on your system. Once complete change the working directory to the plugin and run the following command:

```shell
    npm install
```

Once installation of the local modules has finally completed, you're ready to start contributing to the project. Before you submit your PR, please don't forget to call `gulp`, which will run against [JSHint](jshint.com) for any errors, but will also minify the plugin.

##### Watch
Call the following command to start 'watching' for any changes to the main JavaScript file. This will automatically invoke JSHint and Uglify.
```shell
    gulp watch
```

##### JSHint
Call the following command to invoke JSHint and check that your changes meet the requirements set in .jshintrc.
```shell
    gulp jshint
```

##### Uglify the main file (automatically done whilst watching)
Call the following command to invoke Uglify, which will minify the main JavaScript file and output to a .min.js file.
```shell
    gulp uglify
```

##### Build
Call the following command to invoke both JSHint and Uglify.
```shell
    gulp
```
