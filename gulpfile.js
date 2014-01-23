var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	compass = require('gulp-compass'),
	size = require('gulp-filesize');

gulp.task('scripts', function() {
	gulp.src(['./app/assets/scripts/hdom.js', './app/assets/scripts/**/*.js', '!./app/assets/scripts/vendor/**/*.js'])
		.pipe(concat('prod.js'))
		.pipe(gulp.dest('./app/assets/dist'))
		.pipe(size())
		.pipe(concat('prod.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./app/assets/dist'))
		.pipe(size());
});

gulp.task('styles', function() {
	gulp.src(['./scss/**/*.scss'])
		.pipe(compass({
			relative: true,
			css: 'app/assets/css',
			sass: 'scss',
			image: 'app/assets/img',
			font: 'app/assets/fonts'
		}))
		.pipe(size());
});

gulp.task('default', function() {
	gulp.run('scripts', 'styles');

	gulp.watch('scss/**', function(e) {
		gulp.run('styles');
	});

	gulp.watch('app/assets/scripts/**', function(e) {
		gulp.run('scripts');
	});
});