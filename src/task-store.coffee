mainTasks = {}


addTask = (taskName, taskOptions) ->
  mainTasks[taskName] ?= taskOptions


getTask = (taskName) ->
  mainTasks[taskName]


module.exports = {
  addTask
  getTask
}
