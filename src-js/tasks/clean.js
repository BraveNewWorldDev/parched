import {
  gulp,
  rimraf,
} from '../vendor'

gulp().task('parched-clean', (done) => {
  rimraf('tmp', done)
})
