'use strict';
const fs = require('fs');
const gulp = require('gulp');
const util = require('gulp-util');
const browserify = require('browserify');
const watchify = require('watchify');
const uglify = require('gulp-uglify');
const babelify = require('babelify');

function compile(watch, done) {
  const b = browserify({
    debug: !util.env.production,
  })
  .transform(babelify, { presets: ['es2015'] })
  .require('./app.js', { entry: true });

  function bundle() {
    util.log('Writing Bundle in ', util.colors.magenta(
        util.env.production ?
          'production mode' :
          'dev mode'
    ));

    b.bundle()
      .on('error', (err) => {
        util.log(util.colors.red('Error: ', err.message));
      })
      .pipe(util.env.production ? uglify() : util.noop())
      .pipe(fs.createWriteStream('dist/spine-frame.js'));

    if (!watch) {
      done();
    }
  }

  if (watch) {
    b.plugin(watchify);
    b.on('update', bundle);
  }

  bundle();
}

gulp.task('build', () => compile(true));
gulp.task('watch', () => compile(true));

gulp.task('default', ['build']);
