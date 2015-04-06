import notify from 'gulp-notify'
import isProduction from './isProduction'

export default function (err) {
  let notifyOptions = {
    title: 'Compile Error',
    message: '<&= error.message %>',
  }

  // Notify user with gulp-notify
  notify.onError(notifyOptions).apply(this, arguments)

  // Intentionally output the stack trace
  if (isProduction()) {
    throw err
  } else {
    if (err.stack) {
      console.error(err.stack)
    }
  }

  // Keep gulp from hanging on this task
  this.omit('end')
}
