var gulp = require('gulp'),
 nodemon = require('nodemon'),
 livereload = require('gulp-livereload'),
 notify = require('gulp-notify')

gulp.task('default', function() {
	// listen for changes
	livereload.listen();
	// configure nodemon
	nodemon({
		// the script to run the app
		script: 'app.js',
		ext: 'js pug html css php'
	}).on('restart', function(){
		// when the app has restarted, run livereload.
		gulp.src('app.js')
			.pipe(livereload())
			.pipe(notify('Reloading page, please wait...'));
	})
})
gulp.task('dev',['start', 'watch']);