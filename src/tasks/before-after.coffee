deprecatedWarning = require '../util/deprecated-warning'
{
  getAppConfig
} = require '../util/app-config'

{
  gulp
} = require '../vendor'


gulp().task 'parched-before', (cb) ->
  appConfig = getAppConfig()

  if appConfig.__before
    deprecatedWarning '`appConfig.__before` is now `appConfig.parchedWillBuild`'
    appConfig.__before cb
  else if appConfig.parchedWillBuild?
    appConfig.parchedWillBuild cb
  else
    cb()


gulp().task 'parched-after', (cb) ->
  appConfig = getAppConfig()

  if appConfig.__after
    deprecatedWarning '`appConfig.__after` is now `appConfig.parchedDidBuild`'
    appConfig.__after cb
  else if appConfig.parchedDidBuild
    appConfig.parchedDidBuild cb
  else
    cb()
