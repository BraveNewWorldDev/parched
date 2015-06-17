import plumberErrors from '../pipes/plumberErrors'
import skipLeadingUnderscores from '../pipes/skipLeadingUnderscore'
import announceFileProcessing from '../util/announceFileProcessing'

import {
  gulp,
  through2,
  gulpif,
  combine,
  merge,
  xtend,
  watch,
} from '../vendor'

import {
  getAllInstances,
} from '../plugins/PluginStore'

import {
  getAppConfig,
} from '../ConfigStore'

let filesPreProcessed = {}
let filesPostProcessed = {}

function markFileAsProcessed () {
  function transform (file, enc, done) {
    filesPreProcessed[file.path] = true
    this.push(file)
    done()
  }

  return through2.obj(transform)
}

function rejectFilesNotProcessed () {
  function transform (file, enc, done) {
    if (file.path in filesPreProcessed) {
      filesPostProcessed[file.path] = true
      this.push(file)
    }
    done()
  }

  return through2.obj(transform)
}

// This is called with a `taskName` and `methodName`
// and creates a gulp task that is a merged stream of all plugins
// with `methodName` created with `createStreamForInstance`
//
// TODO However it might make more sense to use a combine stream,
// like addPluginMethodToStream. There was a reason for going with
// a merged stream ... somewhere
export default function (taskOptions) {
  let {
    taskName,
    methodName,
  } = taskOptions

  let {
    beforeEach,
    afterEach,
    //methodName,
    shouldProcessAssets,
    src,
    pluginInstance,
  } = taskOptions

  let taskNameProxy = `${taskName}--${methodName}`
  let config = getAppConfig()
  let beforeFromConfig = config.beforeEach
  let afterFromConfig = config.afterEach

  let beforeNameTargeted = 'before' +
      methodName.charAt(0).toUpperCase() + methodName.slice(1)
  let afterNameTargeted = 'after' +
      methodName.charAt(0).toUpperCase() + methodName.slice(1)

  gulp().task(taskNameProxy, false, () => {
    let stream = gulp()
        .src(src)
        .pipe(plumberErrors())
        .pipe(skipLeadingUnderscores())

    if (taskOptions[beforeNameTargeted]) {
      stream = taskOptions[beforeNameTargeted](stream, taskOptions)
    }

    if (beforeEach) {
      stream = beforeEach(stream, taskOptions)
    }

    if (beforeFromConfig) {
      stream = beforeFromConfig(stream, taskOptions)
    }

    getAllInstances().forEach((pluginInstance) => {
      if (!pluginInstance[methodName]) {
        return
      }

      let pluginShouldProcessAssets = pluginInstance.shouldProcessAssets()
      if (shouldProcessAssets) {
        if (!pluginShouldProcessAssets) {
          return
        }
      } else {
        if (pluginShouldProcessAssets) {
          return
        }
      }

      let callbackContext = xtend({}, taskOptions, {
        pluginInstance,
        taskNameProxy,
        taskNameUnique: `${taskNameProxy}--${pluginInstance.displayName}`
      })

      if (taskOptions.modifyContext) {
        taskOptions.modifyContext(callbackContext)
      }

      let methodResult = pluginInstance[methodName](callbackContext)
      if (!methodResult) {
        return
      }

      methodResult = []
          // This is useful in development.
          .concat(announceFileProcessing(pluginInstance, methodName))
          .concat(markFileAsProcessed())
          .concat(methodResult)

      stream = stream
          .pipe(gulpif(
            pluginInstance.src,
            combine(methodResult)
          ))

    })

    if (taskOptions[afterNameTargeted]) {
      stream = taskOptions[afterNameTargeted](stream, taskOptions)
    }

    if (afterEach) {
      stream = afterEach(stream, taskOptions)
    }

    if (afterFromConfig) {
      stream = afterFromConfig(stream, taskOptions)
    }

    stream = stream.pipe(rejectFilesNotProcessed())

    return stream
  })
}
