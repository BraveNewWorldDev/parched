{
  getTask
} = require './task-store'


module.exports = (taskName) ->
  taskOptions = getTask taskName

  sequence = []
  if taskOptions.deps
    sequence = sequence.concat taskOptions.deps

  for sequenceItem in taskOptions.sequence
    if Array.isArray sequenceItem
      __sequence = []
      for __item in sequenceItem
        __taskName = "#{taskName}--#{__item}"
        __sequence.push __taskName
      sequence.push __sequence
      continue

    taskNameProxy = "#{taskName}--#{sequenceItem}"
    sequence.push taskNameProxy

  sequence
