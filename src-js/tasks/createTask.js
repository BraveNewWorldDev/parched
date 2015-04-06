import getSequence from './getSequence'
import createPluginMethodTask from './createPluginMethodTask'

import {
  xtend,
  runSequence,
  gulp,
} from '../vendor'

import {
  addTask,
} from './TaskStore'

export default function (taskOptions) {
  let {
    sequence,
    taskName,
  } = taskOptions

  // Register the task in the store
  addTask(taskName, taskOptions)

  // Create a task for each item in taskOptions.sequence
  sequence.forEach((methodName) => {
    // If the item is an array, create a task for each sub item
    if (Array.isArray(methodName)) {
      methodName.forEach((__methodName) => {
        createPluginMethodTask(xtend({}, taskOptions, {
          methodName: __methodName
        }))
      })
      return
    }

    createPluginMethodTask(xtend({}, taskOptions, {
      methodName
    }))
  })

  // Create a gulp task named after taskOptions.name
  // The gulp task is simply a proxy to a sequence of tasks returned from
  // getSequence
  return gulp().task(taskName, (done) => {
    return runSequence(...getSequence(taskName).concat(done))
  })
}
