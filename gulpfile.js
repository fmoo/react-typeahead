var gulp = require('gulp');
var mocha = require('gulp-mocha-phantomjs');
var react = require('gulp-react');

gulp.task('test', function() {
  return gulp.src('./test/index.html')
    .pipe(mocha({
      reporter: 'dot'
    }));
});

gulp.task('build', function () {
    return gulp.src('./src/**')
        .pipe(react({
            harmony: true
        }))
        .pipe(gulp.dest('./lib'));
});

gulp.task('default', ['test']);
