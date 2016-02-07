/* global require */

var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var gulpIf = require('gulp-if');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var del = require('del');
var merge = require('merge2');
var pkg = require('./package.json');

// Assets for the project
var Assets = {
    dest: './dist/',
    main: 'PubSub.js',
    minified: 'PubSub.min.js',
    minifiedES5: 'PubSub_es5.min.js',
    package: './package.json',
    readme: './README.md',
    src: './src/',
    source: './',
};

// See the uglify documentation for more details
var _uglifySettings = {
    compress: {
        comparisons: true,
        conditionals: true,
        /* jscs: disable */
        dead_code: true,
        drop_console: true,
        /* jscs: enable */
        unsafe: true,
        unused: true,
    },
};

// Clean the 'dist' directory
gulp.task('clean', function cleanTask(cb) {
    del([Assets.dest + '/*.js'], cb);
});

// Run the babel transpiler to convert from ES2015 to ES5, as well as minifying
gulp.task('es2015to5', function es2015To5Task() {
    return gulp.src(Assets.src + '/' + Assets.main)
        .pipe(babel({
            presets: ['es2015'],
            plugins: ['transform-es2015-modules-umd'],
        }))
        .pipe(uglify(_uglifySettings))
        .pipe(rename(Assets.minifiedES5))
        .pipe(gulp.dest(Assets.dest));
});

// Check the main js file(s) meets the following standards outlined in .eslintrc
gulp.task('eslint', function esLintTask() {
    // Has ESLint fixed the file contents?
    function isFixed(file) {
        return file.eslint !== undefined && file.eslint !== null && file.eslint.fixed;
    }

    return gulp.src(Assets.src + '/' + Assets.main)
        .pipe(eslint({
            fix: true,
            useEslintrc: '.eslintrc',
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(isFixed, gulp.dest(Assets.src)));
});

// Uglify aka minify the main file
gulp.task('uglify', function uglifyTask() {
    // Copy the main file to the source directory
    return gulp.src(Assets.src + '/' + Assets.main)
        .pipe(gulp.dest(Assets.dest));

    // Uglify right now is unable to uglify ES2015
    // return gulp.src(Assets.src + '/' + Assets.main)
    //     .pipe(uglify(_uglifySettings))
    //     .pipe(rename(Assets.minified))
    //     .pipe(gulp.dest(Assets.dest));
});

// Watch for changes to the main file
gulp.task('watch', function watchTask() {
    gulp.watch(Assets.src + '/' + Assets.main, ['eslint', 'uglify']);
});

// Update version numbers based on the main file version comment
gulp.task('version', function versionTask() {
    // SemVer matching is done using (?:\d+\.){2}\d+

    var reVersion = /(?:(\n\s*\*\s+Version:\s+)(?:\d+\.){2}\d+)/;
    var reVersionReadMe = /(?:^#\s+([\w\-]+)\s+-\s+v(?:\d+\.){2}\d+)/;

    var streams = merge();

    // Update the main js file version number
    streams.add(
        gulp.src(Assets.src + '/' + Assets.main)
        .pipe(replace(reVersion, '$1' + pkg.version))
        .pipe(gulp.dest(Assets.src))
    );

    // Update the README.md version number
    streams.add(
        gulp.src(Assets.readme)
        .pipe(replace(reVersionReadMe, '# $1 - v' + pkg.version))
        .pipe(gulp.dest(Assets.source))
    );

    return streams;
});

// Register the default task
gulp.task('default', ['version', 'eslint', 'uglify', 'es2015to5']);

// 'gulp es2015to5' to transpile from ES2015 to ES5, as well as minifying
// 'gulp eslint' to check the syntax of the main js file(s)
// 'gulp uglify' to uglify the main file
// 'gulp watch' to watch for changes to the main file
// 'gulp version' to update the version numbers based on the main file version comment
