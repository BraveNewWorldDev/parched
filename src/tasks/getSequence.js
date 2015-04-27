import {
  getTask,
} from './TaskStore'

// This allows reverse lookup of `createTask`
// When a task is created via `createTask`, the methods defined in `sequence`
// are turned into many gulp tasks
// If a method is an array, those sub-tasks will be run in sequence
//
// createTask({
//   taskName: 'example',
//   sequence: [
//     ['lint', 'transform']
//     'minify'
//   ],
// })
//
// `getSequence('example')` returns:
// [
//   ['example--lint', 'example--transform'],
//   'example--minify'
// ]

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
