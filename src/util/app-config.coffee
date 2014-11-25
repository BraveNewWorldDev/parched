{
  xtend
} = require '../vendor'

defaultConfig = {
  gulp: require('gulp')

  plugins:
    order:
      before: []
      after: []

  __before: (done) ->
    done()

  __after: (done) ->
    done()
}

appConfig = defaultConfig


getAppConfig = ->
  xtend {}, appConfig


setAppConfig = (config) ->
  appConfig = xtend true, {}, defaultConfig, config


module.exports = {
  getAppConfig
  setAppConfig
}
