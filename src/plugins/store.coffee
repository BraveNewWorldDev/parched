gulpmatch = require 'gulp-match'
xtend = require 'node.extend'

{ getAppConfig } = require '../util/app-config'

registeredPlugins = []
allInstances = []
areAllInstancesLoaded = false

addPlugin = (plugin) ->
  registeredPlugins.push plugin

clearPlugins = ->
  registeredPlugins.pop() while registeredPlugins.length > 0
  null

getAllInstances = ->
  if areAllInstancesLoaded
    return allInstances

  appConfig = getAppConfig()

  for plugin in registeredPlugins
    instance = new plugin()
    # TODO work in appConfig.plugins[instance.displayName]
    instance.options = xtend(true,
      instance.getDefaultOptions(),
      appConfig.plugins[instance.displayName])
    allInstances.push instance

  areAllInstancesLoaded = true
  allInstances

clearAllInstances = ->
  allInstances.pop() while allInstances.length > 0
  undefined

module.exports = {
  addPlugin
  clearPlugins
  getAllInstances
  clearAllInstances
}
