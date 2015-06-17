import plumberErrors from '../pipes/plumberErrors'

import {
  combine,
  xtend,
  gulpif,
} from '../vendor'

import {
  getAllInstances,
} from '../plugins/PluginStore'

// Adds the result of each in `methodNames` for each `pluginInstance` to an
// existing stream
// Respects `shouldProcessAssets`
//
// For example, the webapp tasks use this to optionally minify when NODE_ENV
// is production
export default function (taskOptions) {
  let allPlugins = getAllInstances()
  let {
    methodNames,
    stream,
    shouldProcessAssets,
  } = taskOptions

  methodNames.forEach((methodName) => {
    allPlugins.forEach((pluginInstance) => {
      if (!pluginInstance[methodName]) {
        return
      }

      let pluginShouldProcessAssets = pluginInstance.shouldProcessAssets()
      if (shouldProcessAssets) {
        if (!pluginShouldProcessAssets) {
          return
        }
      } else {
        if (pluginShouldProcessAssets) {
          return
        }
      }

      let callbackContext = xtend({}, taskOptions)
      let __result = pluginInstance[methodName](callbackContext)

      if (!__result) {
        return
      }

      let combined = combine(__result)
      stream = stream
          //.pipe(plumberErrors())
          .pipe(gulpif(pluginInstance.src, combined))
    })
  })

  return stream
}
