__gulpReference = require 'gulp'

getGulpReference = ->
  __gulpReference

setGulpReference = (gulpReference) ->
  if !gulpReference
    return

  __gulpReference = gulpReference

module.exports = {
  getGulpReference
  setGulpReference
}
