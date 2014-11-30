{ getGulpReference, setGulpReference } = require './util/gulp-reference'
resolve = require 'resolve'
xtend = require 'node.extend'
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

  appConfig.beforeLoad?()

  for taskName in parchedDependencies.tasks
    plugin = resolveDependency taskName
    requirePluginWithEnv plugin

  for pluginName in parchedDependencies.plugins
    plugin = resolveDependency pluginName
    requirePluginWithEnv plugin

  appConfig.afterLoad?()

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
  delete exportsClone.setup
  exportsClone.gulp = getGulpReference
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

  Plugin: require('./plugins')
  createPlugin: require('./plugins').createPlugin
  getAllInstances: require('./plugins/store').getAllInstances
  #lazypipeFromPluginMethod: require('./plugins/store').lazypipeFromPluginMethod

  #createGulpTaskFromPluginMethod: require('./gulp-task-creator').createGulpTaskFromPluginMethod
  #getNamespaceObject: require('./gulp-task-creator').getNamespaceObject
  #getDependenciesFor: require('./gulp-task-creator').getDependenciesFor

  #makeGulpContext: require('./gulp-task-util').makeGulpContext
  #getSequenceFor: require('./gulp-task-util').getSequenceFor
  #getContextObject: require('./gulp-task-util').getContextObject

  #combinePluginMethodsForFile: require('./plugins/streams/combine-plugin-methods-for-file')
  #callPluginMethod: require('./plugins/streams/call-plugin-method')
  #filterByPluginMatcher: require('./plugins/streams/filter-by-plugin-matcher')
  handleErrors: require('./handle-errors')

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
