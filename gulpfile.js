/* global require */

var gulp = require('gulp');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');

// Assets for the project
var Assets = {
    dist: 'dist',
    main: 'pubsub.js',
    minified: 'pubsub.min.js'
};

// Clean the 'dist' directory
gulp.task('clean', function (cb) {
    del([Assets.dist + '/*.js'], cb);
});

// Run the babel transpiler to convert ES2015 to ES5
gulp.task('es2015', ['clean'], function () {
    return gulp.src('./' + Assets.main)
        .pipe(babel())
        .pipe(gulp.dest('./' + Assets.dist));
});

// Check the code meets the following standards outlined in .jshintrc
gulp.task('jshint', function () {
    return gulp.src('./' + Assets.main)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Uglify aka minify the main file
gulp.task('uglify', ['clean', 'es2015'], function () {
    return gulp.src('./' + Assets.dist + '/' + Assets.main)
        .pipe(uglify({
            // See the uglify documentation for more details
            compress: {
                comparisons: true,
                conditionals: true,
                dead_code: true,
                drop_console: true,
                unsafe: true,
                unused: true
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./' + Assets.dist));
});

// Watch for changes to the main file
gulp.task('watch', function () {
    gulp.watch('./' + Assets.main, ['jshint', 'uglify']);
});

// Register the default task
gulp.task('default', ['jshint', 'uglify']);

// 'gulp jshint' to check the syntax
// 'gulp uglify' to uglify the main file
