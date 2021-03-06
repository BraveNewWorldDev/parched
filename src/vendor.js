import { getGulpReference } from './util/gulpReference'

export default {
  gulp: getGulpReference,
  gulpif: require('gulp-if'),
  gutil: require('gulp-util'),
  through2: require('through2'),
  combine: require('stream-combiner'),
  merge: require('merge-stream'),
  watch: require('gulp-watch'),

  xtend: require('node.extend'),
  anymatch: require('anymatch'),
  rimraf: require('rimraf'),

  runSequence () {
    let runSequence = require('run-sequence').use(getGulpReference())
    return runSequence(...arguments)
  },
}
