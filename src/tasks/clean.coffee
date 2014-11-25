{
  gulp
  rimraf
} = require '../vendor'

gulp().task 'parched-clean', (cb) ->
  rimraf 'tmp', cb
