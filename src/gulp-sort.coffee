through = require 'through'
sortBeforeAfter = require './util/sort-before-after'


module.exports = (options) ->
  allFiles = []

  transform = (file) ->
    allFiles.push file

  flush = ->
    sorted = sortBeforeAfter {
      collection: allFiles
      before: options.before
      after: options.after
      matcher: options.matcher
      getItem: (item) ->
        item.path
    }

    for item in sorted
      @queue item

    @queue null

  through transform, flush
