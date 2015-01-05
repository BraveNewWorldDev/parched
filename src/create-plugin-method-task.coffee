plumberErrors = require './plumber-errors'

skipLeadingUnderscore = require './skip-leading-underscore'
{
  gulp
  through2
  gulpif
  combine
  merge
  xtend
} = require './vendor'

{
  getAllInstances
} = require './plugins/store'

{
  getAppConfig
} = require './util/app-config'


module.exports = (taskOptions) ->
  {
    taskName
    beforeEach
    afterEach
    methodName
    shouldProcessAssets
    src
  } = taskOptions

  taskNameProxy = "#{taskName}--#{methodName}"

  gulp().task taskNameProxy, ->
    __streams = []

    for pluginInstance in getAllInstances() \
        when pluginInstance[methodName]?

      callbackContext = xtend {}, taskOptions, {
        pluginInstance
        taskNameProxy
        taskNameUnique: "#{taskNameProxy}--#{pluginInstance.displayName}"
      }

      stream = __createStreamForInstance(callbackContext)

      if stream
        __streams.push stream

    if __streams.length is 0
      return

    merge __streams


__createStreamForInstance = (taskOptions) ->
  {
    beforeEach
    afterEach
    methodName
    shouldProcessAssets
    src
    pluginInstance
  } = taskOptions

  appConfig = getAppConfig()

  beforeFromConfig = appConfig.beforeEach
  afterFromConfig = appConfig.afterEach

  pluginShouldProcessAssets = pluginInstance.shouldProcessAssets()
  if shouldProcessAssets
    if !pluginShouldProcessAssets
      return
  else
    if pluginShouldProcessAssets
      return

  methodResult = pluginInstance[methodName](taskOptions)
  if !methodResult
    return

  __pipeline = []
    .concat skipLeadingUnderscore()

    # This is useful in development.
    #.concat through2.obj (file, enc, cb) ->
      #console.log """
      #Will process \
      #`#{file.relative}` \
      #with \
      #`#{pluginInstance.displayName}##{methodName}` \
      #"""
      #@push file
      #cb()

    .concat methodResult

  beforeNameTargeted = 'before' +
    methodName.charAt(0).toUpperCase() + methodName.slice(1)

  afterNameTargeted = 'after' +
    methodName.charAt(0).toUpperCase() + methodName.slice(1)

  stream = gulp()
    .src src

  if taskOptions[beforeNameTargeted]
    stream = taskOptions[beforeNameTargeted](stream, taskOptions)

  if beforeEach
    stream = beforeEach(stream, taskOptions)

  if beforeFromConfig
    stream = beforeFromConfig(stream, taskOptions)

  stream = stream
    .pipe plumberErrors()
    .pipe gulpif(
      pluginInstance.src
      combine(__pipeline)
      through2.obj (file, enc, cb) ->
        cb()
    )

  if afterFromConfig
    stream = afterFromConfig(stream, taskOptions)

  if afterEach
    stream = afterEach(stream, taskOptions)

  if taskOptions[afterNameTargeted]
    stream = taskOptions[afterNameTargeted](stream, taskOptions)

  stream
