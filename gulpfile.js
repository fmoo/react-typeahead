var gulp = require('gulp');
var mocha = require('gulp-mocha-phantomjs');

gulp.task('test', function() {
  return gulp.src('./test/index.html')
    .pipe(mocha({
      reporter: 'dot'
    }));
});

gulp.task('default', ['test']);
