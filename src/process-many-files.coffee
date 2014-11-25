deepEqual = require 'deep-equal'
through2 = require 'through2'
anymatch = require 'anymatch'

caches = {}


getCacheFromContext = (context) ->
  if !caches[context.taskNameUnique]?
    caches[context.taskNameUnique] = { files: {} }

  caches[context.taskNameUnique]


getFilesByMTime = (cache) ->
  ret = {}
  for filePath, fileObj of cache.files
    ret[filePath] = fileObj.stat.mtime

  ret


module.exports = (src, context, done) ->
  cache = getCacheFromContext context
  previousCache = getFilesByMTime cache

  transform = (file, enc, doneTransform) ->
    if src
      if anymatch(src, file.relative)
        if !cache.files[file.path]
          cache.files[file.path] = file
    else
      if !cache.files[file.path]
        cache.files[file.path] = file

    doneTransform()

  flush = (doneFlush) =>
    shouldRun = !deepEqual(getFilesByMTime(cache), previousCache)

    if !shouldRun
      return doneFlush()

    files = (value for key, value of cache.files)
    done files, doneFlush

  through2.obj transform, flush
