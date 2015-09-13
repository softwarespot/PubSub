/* global require */

var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');

// See the uglify documentation for more details
var uglifySettings = {
    compress: {
        comparisons: true,
        conditionals: true,
        dead_code: true,
        drop_console: true,
        unsafe: true,
        unused: true
    }
};

// Assets for the project
var Assets = {
    dest: 'dist',
    main: 'pubsub.js',
    main_interface: 'ipubsub.js',
    minified: 'pubsub.min.js',
    minified_interface: 'ipubsub.min.js'
};

// Clean the 'dist' directory
gulp.task('clean', function (cb) {
    del([Assets.dest + '/*.js'], cb);
});

// Run the babel transpiler to convert from ES2015 to ES5
gulp.task('es6to5', ['clean'], function () {
    return gulp.src([
            './' + Assets.main,
            './' + Assets.main_interface
        ])
        .pipe(babel())
        .pipe(gulp.dest('./' + Assets.dest));
});

// Check the code meets the following standards outlined in .jshintrc
gulp.task('jshint', function () {
    return gulp.src(['./' + Assets.main, './' + Assets.main_interface])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Uglify aka minify the main file
gulp.task('uglify', ['es6to5'], function () {
    gulp.src('./' + Assets.dest + '/' + Assets.main_interface)
        .pipe(uglify(uglifySettings))
        .pipe(rename(Assets.minified_interface))
        .pipe(gulp.dest('./' + Assets.dest));

    return gulp.src([
            './' + Assets.dest + '/' + Assets.main_interface,
            './' + Assets.dest + '/' + Assets.main
        ])
        .pipe(concat(Assets.minified))
        .pipe(uglify(uglifySettings))
        .pipe(rename(Assets.minified))
        .pipe(gulp.dest('./' + Assets.dest));
});

// Watch for changes to the main file
gulp.task('watch', function () {
    gulp.watch('./' + Assets.main, ['jshint', 'uglify']);
});

// Register the default task
gulp.task('default', ['jshint', 'uglify']);

// 'gulp es6to5' to transpile from ES2015 to ES5
// 'gulp jshint' to check the syntax
// 'gulp uglify' to uglify the main file
// 'gulp watch' to watch for changes to the main file
