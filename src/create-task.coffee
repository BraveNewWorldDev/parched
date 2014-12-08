getSequence = require './get-sequence'
createPluginMethodTask = require './create-plugin-method-task'

{
  xtend
  runSequence
  gulp
} = require './vendor'

{
  addTask
} = require './task-store'


createTask = (taskOptions) ->
  {
    sequence
    taskName
  } = taskOptions

  addTask taskName, taskOptions

  #gulp.task taskName
  for sequenceItem in sequence
    if Array.isArray sequenceItem
      for __sequenceItem in sequenceItem
        createPluginMethodTask xtend {}, taskOptions, methodName: __sequenceItem
      #createTask xtend {}, taskOptions, sequence: sequenceItem
      continue

    createPluginMethodTask xtend {}, taskOptions, methodName: sequenceItem

  gulp().task taskName, (done) ->
    runSequence getSequence(taskName).concat(done)...


module.exports = createTask
