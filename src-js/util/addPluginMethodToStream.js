import plumberErrors from './plumberErrors'

import {
  combine,
  xtend,
  gulpif,
} from './vendor'

import {
  getAllInstances,
} from './plugins/PluginStore'

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

      combined = combine(__result)

      stream
          .pipe(plumberErrors())
          .pipe(gulpif(pluginInstance.src, combined))
    })
  })

  return stream
}
