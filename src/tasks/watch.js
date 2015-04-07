import {
  gulp,
  runSequence,
} from '../vendor'

import {
  getDependenciesForWatch,
} from '../DependencyStore'

global.isWatching = false

gulp().task('parched-watch', 'Sets watch mode', (done) => {
  global.isWatching = true
  //done()
  runSequence(...getDependenciesForWatch(), done)
})
