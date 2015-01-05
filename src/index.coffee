resolve = require 'resolve'
xtend = require 'node.extend'
deprecatedWarning = require './util/deprecated-warning'
{ getGulpReference, setGulpReference } = require './util/gulp-reference'
{ setAppConfig, getAppConfig } = require './util/app-config'


setup = (appConfig) ->
  appConfig = setAppConfig appConfig
  setGulpReference appConfig.gulp

  require './tasks/before-after'
  require './tasks/noop'
  require './tasks/watch'
  require './tasks/clean'

  parchedDependencies = findNamedDependencies 'parched',
    require "#{process.cwd()}/package"

  if appConfig.beforeLoad?
    deprecatedWarning '`appConfig.beforeLoad` is now appConfig.parchedWillLoad'
    appConfig.beforeLoad()

  appConfig.parchedWillLoad?()

  for taskName in parchedDependencies.tasks
    plugin = resolveDependency taskName
    requirePluginWithEnv plugin

  for pluginName in parchedDependencies.plugins
    plugin = resolveDependency pluginName
    requirePluginWithEnv plugin

  if appConfig.afterLoad?
    deprecatedWarning '`appConfig.afterLoad` is now appConfig.parchedDidLoad'
    appConfig.afterLoad()

  appConfig.parchedDidLoad?()

  return


findNamedDependencies = (moduleName, packageJson) ->
  tasks = []
  plugins = []
  allDependencies = readAllDependencies packageJson

  allDependencies.forEach (packageName) ->
    # Don't run for the main module.
    if packageName is moduleName
      return

    if ///^#{moduleName}-tasks?-///.test packageName
      tasks.push packageName
      return

    if ///^#{moduleName}///.test packageName
      plugins.push packageName
      return

  { tasks, plugins }


readAllDependencies = (packageJson) ->
  []
    .concat Object.keys(packageJson.dependencies || {})
    .concat Object.keys(packageJson.devDependencies || {})
    .concat Object.keys(packageJson.optionalDependencies || {})


resolveDependency = (packageName) ->
  require resolve.sync(packageName, basedir: process.cwd())


makePluginEnv = ->
  exportsClone = xtend {}, __exports
  exportsClone


requirePluginWithEnv = (plugin) ->
  if !plugin
    return

  if !(typeof plugin is 'function')
    return

  plugin makePluginEnv()


module.exports = __exports = {
  setup
  getAppConfig

  gulp: getGulpReference
  Plugin: require('./plugins')
  createPlugin: require('./plugins').createPlugin
  getAllInstances: require('./plugins/store').getAllInstances
  handleErrors: require('./handle-errors')
  plumberErrors: require('./plumber-errors')
  isProduction: require('./is-production')

  vendor: require('./vendor')

  addPluginMethodsToStream: require('./add-plugin-methods-to-stream')
  createPluginMethodTask: require('./create-plugin-method-task')
  processManyFiles: require('./process-many-files')
  createTask: require('./create-task')
  TaskStore: require('./task-store')
  getSequence: require('./get-sequence')

  gulpSort: require('./gulp-sort')
  sortBeforeAfter: require('./util/sort-before-after')
}
