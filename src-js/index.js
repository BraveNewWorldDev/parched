import deprecatedWarning from './util/deprecatedWarning'
import findNamedDependencies from './util/findNamedDependencies'
import resolveDependency from './util/resolveDependency'

import {
  xtend,
} from './vendor'

import {
  getGulpReference,
  setGulpReference,
} from './util/gulpReference'

import {
  setAppConfig,
  getAppConfig,
} from './ConfigStore'

function setup (appConfig) {
  appConfig = setAppConfig(appConfig)
  setGulpReference(appConfig.gulp)

  require('./tasks/before-after')
  require('./tasks/noop')
  require('./tasks/watch')
  require('./tasks/clean')

  if (appConfig.beforeLoad) {
    deprecatedWarning('`appConfig.beforeLoad` is now appConfig.parchedWillLoad')
    appConfig.beforeLoad()
  }
  appConfig.parchedWillLoad()

  parchedDependencies = findNamedDependencies('parched', require(`${process.cwd()}/package`))

  parchedDependencies.tasks.forEach((taskName) => {
    let plugin = resolveDependency(taskName)
    requirePluginWithEnv(plugin)
  })

  parchedDependencies.plugins.forEach((pluginName) => {
    let plugin = resolveDependency(pluginName)
    requirePluginWithEnv(pluginName)
  })

  if (appConfig.afterLoad) {
    deprecatedWarning('`appConfig.afterLoad` is now appConfig.parchedWillLoad')
    appConfig.afterLoad()
  }
  appConfig.parchedDidLoad()
}

function makePluginEnv () {
  return xtend({}, module.exports)
}

function requirePluginWithEnv(plugin) {
  // If the plugin exports nothing, we do nothing
  if (!plugin) {
    return
  }

  // If the plugin doesn't export a function there's not much we can do
  if (typeof plugin !== 'function') {
    return
  }

  plugin(makePluginEnv())
}

module.exports = {
  setup,
  getAppConfig,

  gulp: getGulpReference,
  Plugin: require('./plugins'),
  createPlugin: require('./plugins').createPlugin,
  getAllInstances: require('./plugins/store').getAllInstances,
  handleErrors: require('./handle-errors'),
  plumberErrors: require('./plumber-errors'),
  isProduction: require('./is-production'),

  vendor: require('./vendor'),

  addPluginMethodsToStream: require('./add-plugin-methods-to-stream'),
  createPluginMethodTask: require('./create-plugin-method-task'),
  processManyFiles: require('./process-many-files'),
  createTask: require('./create-task'),
  TaskStore: require('./task-store'),
  getSequence: require('./get-sequence'),

  gulpSort: require('./gulp-sort'),
  sortBeforeAfter: require('./util/sort-before-after'),
}
