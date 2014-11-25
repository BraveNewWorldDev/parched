module.exports = {
  #gulp: require 'gulp'
  gulp: require('./util/gulp-reference').getGulpReference
  gulpif: require 'gulp-if'
  #rename: require 'gulp-rename'
  gutil: require 'gulp-util'
  #cached: require 'gulp-cached'
  #remember: require 'gulp-remember'
  #watch: require 'gulp-watch'
  #concat: require 'gulp-concat'
  #sourcemaps: require 'gulp-sourcemaps'

  lazypipe: require 'lazypipe'
  through2: require 'through2'
  combine: require 'stream-combiner'
  multistream: require 'multistream'
  merge: require 'merge-stream'
  #runSequence: require 'run-sequence'
  runSequence: ->
    runSequence = require('run-sequence').use require('./util/gulp-reference').getGulpReference()
    runSequence arguments...

  xtend: require 'node.extend'
  anymatch: require 'anymatch'
  rimraf: require 'rimraf'
}
