{ getGulpReference, setGulpReference } = require './util/gulp-reference'
resolve = require 'resolve'
xtend = require 'node.extend'
{ setAppConfig, getDefaultAppConfig } = require './util/app-config'


setup = (appConfig) ->
  console.log 'PARCHED SETUP'
  appConfigClone = xtend true, getDefaultAppConfig(), appConfig
  setAppConfig appConfigClone
  setGulpReference appConfigClone.gulp

  require './tasks/noop'
  require './tasks/watchasdfasdf'

  parchedDependencies = findNamedDependencies 'parched',
    require "#{process.cwd()}/package.json"

  for pluginName in parchedDependencies.plugins
    plugin = resolveDependency pluginName
    requirePluginWithEnv plugin

  for taskName in parchedDependencies.tasks
    plugin = resolveDependency taskName
    requirePluginWithEnv plugin


findNamedDependencies = (moduleName, packageJson) ->
  tasks = []
  plugins = []
  allDependencies = readAllDependencies packageJson

  allDependencies.forEach (packageName) ->
    # Don't run for the main module.
    if packageName is moduleName
      return

    if ///^#{moduleName}-tasks?-///.test moduleName
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

  if !typeof plugin is 'function'
    return

  plugin makePluginEnv()


module.exports = {
  setup
}
