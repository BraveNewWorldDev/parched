import {
  getDependenciesForBuild,
} from '../DependencyStore'

import {
  gulp,
  rimraf,
  runSequence,
} from '../vendor'

gulp().task('parched-build', 'Build everything', (done) => {
  runSequence(...getDependenciesForBuild(), done)
})
