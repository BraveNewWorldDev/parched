{
  getAppConfig
} = require '../util/app-config'

{
  gulp
} = require '../vendor'


gulp().task 'parched-before', (cb) ->
  getAppConfig().__before cb


gulp().task 'parched-after', (cb) ->
  getAppConfig().__after cb
