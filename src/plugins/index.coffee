{ addPlugin } = require './store'
{ gutil } = require '../vendor'
isProduction = require '../is-production'
processManyFiles = require '../process-many-files'

registeredNames = []


class Plugin
  noop: ->
    gutil.noop()

  isProduction: isProduction
  processManyFiles: processManyFiles

  shouldProcessAssets: ->
    false

  getDefaultOptions: ->
    {}


createPlugin = (proto) ->
  if !proto.displayName
    throw new Error "No `name` given to parched plugin"

  if !proto.src
    throw new Error "No `src` given to #{proto.displayName}"

  if !Array.isArray proto.src
    proto.src = [proto.src]

  if proto.displayName in registeredNames
    throw new Error "The name `#{proto.displayName}` has already been taken."

  registeredNames.push proto.displayName

  __src = []
  for item in proto.src
    if typeof item is 'string'
      if item.indexOf '/' is -1
        __src.push "**/#{item}"
      else
        __src.push item
    else
      __src.push item
  proto.src = __src

  cls = class extends Plugin
  for own key, value of proto
    cls::[key] = value

  addPlugin cls
  cls


module.exports = {
  createPlugin
}
