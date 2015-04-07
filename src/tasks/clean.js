import {
  getDependenciesForClean,
} from '../DependencyStore'

import {
  gulp,
  rimraf,
  runSequence,
} from '../vendor'

gulp().task('parched-clean', 'Remove any artifacts', (done) => {
  rimraf('tmp', () => {
    runSequence(...getDependenciesForClean(), done)
  })
})
