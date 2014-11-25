{ gulp, watch } = require '../vendor'

global.isWatching = false
gulp().task 'parched-watch', (cb) ->
  global.isWatching = true
  cb()
