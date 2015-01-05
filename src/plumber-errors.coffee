plumber = require('gulp-plumber')


module.exports = ->
  plumber {
    errorHandler: require('./handle-errors')
    #errorHandler: ->
      #console.log arguments
      #@emit 'end'
  }
