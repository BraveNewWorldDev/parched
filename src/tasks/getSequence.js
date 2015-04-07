import {
  getTask,
} from './TaskStore'

export default function (taskName) {
  let taskOptions = getTask(taskName)
  let sequence = []

  if (taskOptions.deps) {
    sequence = sequence.concat(taskOptions.deps)
  }

  taskOptions.sequence.forEach((sequenceItem) => {
    if (Array.isArray(sequenceItem)) {
      sequence.push(sequenceItem.map((__sequenceItem) => {
        return `${taskName}--${__sequenceItem}`
      }))
      return
    }

    let taskNameProxy = `${taskName}--${sequenceItem}`
    sequence.push(taskNameProxy)
  })

  return sequence
}
