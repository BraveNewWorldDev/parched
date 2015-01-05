{
  combine
  xtend
  gulpif
} = require './vendor'

{
  getAllInstances
} = require './plugins/store'

plumberErrors = require './plumber-errors'


module.exports = (taskOptions) ->
  {
    methodNames
    stream
    shouldProcessAssets
  } = taskOptions

  for methodName in methodNames
    for pluginInstance in getAllInstances() \
        when pluginInstance[methodName]?

      pluginShouldProcessAssets = pluginInstance.shouldProcessAssets()
      if shouldProcessAssets
        if !pluginShouldProcessAssets
          continue
      else
        if pluginShouldProcessAssets
          continue

      callbackContext = xtend {}, taskOptions
      __result = pluginInstance[methodName](callbackContext)

      if !__result
        continue

      combined = combine(__result)

      stream
        .pipe plumberErrors()
        .pipe gulpif(pluginInstance.src, combined)

  stream
