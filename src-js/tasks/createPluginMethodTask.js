import plumberErrors from '../pipes/plumberErrors'
import skipLeadingUnderscores from '../pipes/skipLeadingUnderscore'

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

export default function (taskOptions) {
  let {
    taskName,
    methodName,
  } = taskOptions

  let taskNameProxy = `${taskName}--${methodName}`

  gulp().task(taskNameProxy, () => {
    let __streams = []

    getAllInstances().forEach((pluginInstance) => {
      if (!pluginInstance[methodName]) {
        return
      }

      let callbackContext = xtend({}, taskOptions, {
        pluginInstance,
        taskNameProxy,
        taskNameUnique: `${taskNameProxy}--${pluginInstance.displayName}`
      })

      let stream = createStreamForInstance(callbackContext)

      if (!stream) {
        return
      }

      __streams.push(stream)
    })

    if (__streams.length === 0) {
      return
    }

    return merge(__streams)
  })
}

function createStreamForInstance (taskOptions) {
  let {
    beforeEach,
    afterEach,
    methodName,
    shouldProcessAssets,
    src,
    pluginInstance,
  } = taskOptions

  let config = getAppConfig()
  let beforeFromConfig = config.beforeEach
  let afterFromConfig = config.afterEach

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

  let methodResult = pluginInstance[methodName](taskOptions)
  if (!methodResult) {
    return
  }

  let __pipeline = []
      .concat(skipLeadingUnderscores())

      // This is useful in development.
      .concat(through2.obj(function (file, enc, done) {
        console.log(` \
        Will process \
        \`${file.relative}\` \
        with \
        \`${pluginInstance.displayName}#${methodName}\` \
        `)
        this.push(file)
        done()
      }))

      .concat(methodResult)

  let beforeNameTargeted = 'before' +
      methodName.charAt(0).toUpperCase() + methodName.slice(1)
  let afterNameTargeted = 'after' +
      methodName.charAt(0).toUpperCase() + methodName.slice(1)

  let stream = gulp()
      .src(src)

  //if (global.isWatching) {
    //stream = stream.pipe(watch(src))
  //}

  if (taskOptions[beforeNameTargeted]) {
    stream = taskOptions[beforeNameTargeted](stream, taskOptions)
  }

  if (beforeEach) {
    stream = beforeEach(stream, taskOptions)
  }

  if (beforeFromConfig) {
    stream = beforeFromConfig(stream, taskOptions)
  }

  stream = stream
      .pipe(plumberErrors())
      .pipe(gulpif(
        pluginInstance.src,
        combine(__pipeline),
        through2.obj((file, enc, cb) => {
          cb()
        })
      ))

  if (afterFromConfig) {
    stream = afterFromConfig(stream, taskOptions)
  }

  if (afterEach) {
    stream = afterEach(stream, taskOptions)
  }

  if (taskOptions[afterNameTargeted]) {
    stream = taskOptions[afterNameTargeted](stream, taskOptions)
  }

  return stream
}

