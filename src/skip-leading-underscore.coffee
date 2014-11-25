path = require 'path'

{
  through2
} = require './vendor'


module.exports = ->
  through2.obj (file, enc, cb) ->
    relativePath = path.relative process.cwd(), file.path

    if relativePath.indexOf('/_') == -1
      @push file

    cb()
