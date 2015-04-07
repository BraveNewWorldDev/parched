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
  //require('./tasks/noop')
  require('./tasks/watch')
  require('./tasks/clean')

  //let taskListing = require('gulp-task-listing')
  //appConfig.gulp.task('omg', taskListing)

  require('gulp-task-list')(appConfig.gulp);

  if (appConfig.beforeLoad) {
    deprecatedWarning('`appConfig.beforeLoad` is now appConfig.parchedWillLoad')
    appConfig.beforeLoad()
  }
  appConfig.parchedWillLoad()

  let parchedDependencies = findNamedDependencies('parched', require(`${process.cwd()}/package`))

  parchedDependencies.tasks.forEach((taskName) => {
    let plugin = resolveDependency(taskName)
    requirePluginWithEnv(plugin)
  })

  parchedDependencies.plugins.forEach((pluginName) => {
    let plugin = resolveDependency(pluginName)
    requirePluginWithEnv(plugin)
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

  Plugin: require('./plugins').Plugin,
  createPlugin: require('./plugins').createPlugin,
  getAllInstances: require('./plugins/PluginStore').getAllInstances,
  addPlugin: require('./plugins/PluginStore').addPlugin,

  sortBeforeAfter: require('./util/sortBeforeAfter'),
  handleErrors: require('./util/handleErrors'),
  isProduction: require('./util/isProduction'),

  addPluginMethodsToStream: require('./util/addPluginMethodToStream'),
  createPluginMethodTask: require('./tasks/createPluginMethodTask'),
  createTask: require('./tasks/createTask'),
  TaskStore: require('./tasks/TaskStore'),
  getSequence: require('./tasks/getSequence'),

  processManyFiles: require('./pipes/processManyFiles'),
  plumberErrors: require('./pipes/plumberErrors'),
  gulpSort: require('./pipes/gulpSort'),

  vendor: require('./vendor'),
}
