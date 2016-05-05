'use strict';

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	watch = require('gulp-watch'),
	preprocess = require('gulp-preprocess'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	rimraf = require('gulp-rimraf'),
	jshint = require('gulp-jshint'),
	plumber = require('gulp-plumber'),
	fileinclude = require('gulp-file-include'),
	ghPages = require('gulp-gh-pages'),
	w3cjs = require('gulp-w3cjs');


var ENVIRONMENT = 'development';

var fldr = {

	BUILD: 'build/**',
	SRC: 'src/**',
	DEST: 'build',

	// HTML
	HTML_SRC: 'src/**/*.html',

	// IMAGES
	IMG_SRC: 'src/img/**/*.{jpeg,jpg,svg,png}',
	IMG_DEST: 'build/img',

	// SASS / CSS
	SASS_SOURCE: 'src/sass/*.scss',
	SASS_MAIN: 'src/sass/main.scss',
	CSS: 'build/css/',

	// JS
	JS_VENDOR_SOURCE: 'src/js-vendor/*.js',
	JS_SOURCE: 'src/js/*.js',
	JS_DEST: 'build/js',

	// FONTS
	FONTS_SRC: 'src/fonts/**/*.{ttf,woff,eot,svg}',
	FONTS_DEST: 'build/fonts'
};

function startExpress() {
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')({ port: 35729 }));
	app.use(express.static(__dirname + '/build'));
	app.listen(4000);
}

var tinylr;
function startLiveReload() {
	tinylr = require('tiny-lr')();
	tinylr.listen(35729);
}

function notifyLiveReload(event) {
	var fileName = require('path').relative(__dirname, event.path);

	tinylr.changed({
		body: {
			files: [fileName]
		}
	});
}

// STYLE TASKS
gulp.task('styles-dev', function () {
	return gulp.src([
		fldr.SASS_MAIN
	])
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ff 30'))
		.pipe(concat('styles.css'))
		.pipe(gulp.dest(fldr.CSS));
});

gulp.task('styles-prod', function () {
	return gulp.src([
		fldr.SASS_MAIN
	])
		.pipe(sass())
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ff 30'))
		.pipe(concat('styles.min.css'))
		.pipe(gulp.dest(fldr.CSS));
});

// JAVASCRIPT TASKS
gulp.task('javascripts-vendor', function () {
	return gulp.src(fldr.JS_VENDOR_SOURCE)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'))
		.pipe(concat('scripts-vendor.js'))
		.pipe(gulp.dest(fldr.JS_DEST));
});

gulp.task('javascripts-dev', function () {
	return gulp.src(fldr.JS_SOURCE)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'))
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest(fldr.JS_DEST));
});

gulp.task('javascripts-prod', function () {
	return gulp.src([
		fldr.JS_VENDOR_SOURCE,
		fldr.JS_SOURCE
	])
		.pipe(concat('scripts.min.js'))
		//.pipe(uglify({mangle: false}))
		.pipe(gulp.dest(fldr.JS_DEST));
});

// STATIC TASKS
gulp.task('images', function () {
	return gulp.src(fldr.IMG_SRC)
		.pipe(gulp.dest(fldr.IMG_DEST));
});

gulp.task('html', function () {
	return gulp.src(fldr.HTML_SRC)
		.pipe(plumber())
		.pipe(fileinclude({
			prefix: '@@',
			basepath: './src/views'
		}))
		.pipe(preprocess({ context: { ENVIRONMENT: ENVIRONMENT } }))
		.pipe(gulp.dest(fldr.DEST));
});

gulp.task('fonts', function () {
	return gulp.src(fldr.FONTS_SRC)
		.pipe(gulp.dest(fldr.FONTS_DEST));
});

gulp.task('clean', function () {
	return gulp.src('./build', { read: false })
		.pipe(rimraf({ force: true }));
});

// COMBINED STUFF
gulp.task('dev', function () {
	startExpress();
	startLiveReload();
	gulp.watch(fldr.BUILD, notifyLiveReload);

	gulp.watch(fldr.HTML_SRC, ['html']);
	gulp.watch(fldr.SASS_SOURCE, ['styles-dev']);
	gulp.watch(fldr.JS_SOURCE, ['javascripts-dev']);
	gulp.watch(fldr.IMG_SRC, ['images']);
});

// publish contents to Github pages
gulp.task('deploy-to-github', ['prod'], function () {
	return gulp.src(['build/**/*', 'CNAME'])
		.pipe(ghPages());
});

gulp.task('copy', function () {
    return gulp.src('build/**')
        .pipe(gulp.dest('Backend/public/'));
});

gulp.task('prod', ['clean'], function () {
	ENVIRONMENT = 'production';
	gulp.start('html', 'fonts', 'images', 'javascripts-prod', 'styles-prod');
});

gulp.task('deploy', function () {
	gulp.start('deploy-to-github');
});

gulp.task('default', ['clean'], function () {
	gulp.start('html', 'fonts', 'images', 'javascripts-vendor', 'javascripts-dev', 'styles-dev');
});

gulp.task('default', ['clean'], function () {
	gulp.start('html', 'fonts', 'images', 'javascripts-vendor', 'javascripts-dev', 'styles-dev');
});