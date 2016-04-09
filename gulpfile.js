var gulp = require('gulp');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha-phantomjs');

gulp.task('test', function() {
  return gulp.src('./test/index.html')
    .pipe(mocha({
      reporter: 'dot'
    }));
});

gulp.task('build', function () {
    return gulp.src('./src/**')
        .pipe(babel({
            presets: ['react']
        }))
        .pipe(gulp.dest('./lib'));
});

gulp.task('default', ['test']);
