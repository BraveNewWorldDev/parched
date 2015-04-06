let mainTasks = {}

export function addTask (taskName, taskOptions) {
  return mainTasks[taskName] = mainTasks[taskName] || taskOptions
}

export function getTask (taskName) {
  return mainTasks[taskName]
}
