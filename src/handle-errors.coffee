notify = require 'gulp-notify'
isProduction = require './is-production'


module.exports = (err) ->
  args = Array.prototype.slice.call arguments

  notifyOptions = {
    title: 'Compile Error'
    message: '<%= error.message %>'
  }

  # Notify user with gulp-notify
  notify.onError(notifyOptions).apply this, args

  # Intentionally output the stack trace
  if isProduction()
    throw err
  else
    if err.stack
      console.error(err.stack)

  # Keep gulp from hanging on this task
  @emit 'end'
