import autoprefixer from 'gulp-autoprefixer';
import babelify from 'babelify';
import browserify from 'browserify';
import concat from 'gulp-concat';
import del from 'del';
import domain from 'domain';
import gulp from 'gulp';
import gutil from 'gulp-util';
import hbsfy from 'hbsfy';
import plumber from 'gulp-plumber';
import sass from 'gulp-sass';
import tap from 'gulp-tap';


/* Default task */
gulp.task('default', function() {
  gulp.start('build');
});


/* Removing whole ./wysadzulice/static/ directory */
gulp.task('clean', del.bind(null, './wysadzulice/static'));


/* Building JS */
gulp.task('js', function() {
  return gulp.src('./wysadzulice/assets/main.js')
    .pipe(plumber())
    .pipe(tap(function(file) {
      const dom = domain.create();
      dom.on('error', function(err) {
        gutil.log(
          gutil.colors.red('Browserify compile error:'),
          err.message, '\n\t',
          gutil.colors.cyan('in file'), file.path
        );
        gutil.beep();
      });
      dom.run(function() {
        file.contents = browserify({
          entries: [file.path],
          debug: false,
          standalone: 'Planting',
          paths: ['./node_modules/', './wysadzulice/assets/'],
          transform: [
            [hbsfy, {
              global: true,
              ignore: /\/node_modules\/(?!plantingjs\/)/,
            }],
            [babelify, {
              global: true,
              ignore: /\/node_modules\/(?!plantingjs\/)/,
            }],
          ],
        }).bundle();
      });
    }))
    .pipe(gulp.dest('./wysadzulice/static/js/'));
});
/* End of building JS */

/* Building CSS */
gulp.task('css:main', function() {
  return gulp.src('./wysadzulice/assets/styles/**/*.scss')
    .pipe(sass())
    .pipe(autoprefixer({browsers: ['last 1 version']}))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./wysadzulice/static/styles/'));
});

gulp.task('css:vendor', function() {
  return gulp.src([
    './node_modules/jquery-ui/themes/base/jquery-ui.css',
    './node_modules/jquery-ui/themes/base/jquery.ui.dialog.css',
    './node_modules/plantingjs/src/styles/*.scss',
  ])
    .pipe(sass())
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./wysadzulice/static/styles/'));
});

gulp.task('css', ['css:vendor', 'css:main']);
/* End of building CSS */


/* Building all frontend assets */
gulp.task('build', ['css', 'js']);
/* End of building all frontend assets */
