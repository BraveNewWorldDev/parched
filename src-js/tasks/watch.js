import {
  gulp,
} from '../vendor'

global.isWatching = false

gulp().task('parched-watch', (done) => {
  global.isWatching = true
  done()
})
