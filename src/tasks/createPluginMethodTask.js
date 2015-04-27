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

  let taskNameProxy = `${taskName}--${methodName}`

  gulp().task(taskNameProxy, false, () => {
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

      if (taskOptions.modifyContext) {
        taskOptions.modifyContext(taskOptions)
      }

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

// Creates a stream to be merged into `createPluginMethodTask`
// Respects `shouldProcessAssets`
// Returns null if `pluginInstance[methodName]` returns null
//
// Also modifies the stream with a series of callbacks, that can
// resemble something like:
// let stream = gulp()
//     .src(pluginInstance.src)
//     .pipe(plumberErrors())
//     .pipe(skipLeadingUnderscores())
//
// stream = taskOptions.beforeMinify(stream, taskOptions)
// stream = taskOptions.beforeEach(stream, taskOptions)
// stream = appConfig.beforeEach(stream, taskOptions)
//
// stream = stream
//     .pipe(...pluginInstance.minify())
//
// stream = taskOptions.afterMinify(stream, taskOptions)
// stream = taskOptions.afterEach(stream, taskOptions)
// stream = appConfig.afterEach(stream, taskOptions)

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
      .pipe(plumberErrors())

  //if (global.isWatching) {
    //console.log(src)
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
      .pipe(gulpif(
        pluginInstance.src,
        combine(__pipeline),
        // TODO gutil.noop?
        through2.obj((file, enc, cb) => {
          cb()
        })
      ))

  if (taskOptions[afterNameTargeted]) {
    stream = taskOptions[afterNameTargeted](stream, taskOptions)
  }

  if (afterEach) {
    stream = afterEach(stream, taskOptions)
  }

  if (afterFromConfig) {
    stream = afterFromConfig(stream, taskOptions)
  }

  //console.log(taskOptions)

  return stream
}
