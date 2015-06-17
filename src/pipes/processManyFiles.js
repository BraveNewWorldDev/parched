import deepEqual from 'deep-equal'
import through2 from 'through2'
import anymatch from 'anymatch'
import xtend from 'node.extend'

let caches = {}
let cacheSkeleton = {
  files: {}
}

function getCacheFromContext (context) {
  if (!caches[context.taskNameUnique]) {
    caches[context.taskNameUnique] = xtend(true, {}, cacheSkeleton)
  }

  return caches[context.taskNameUnique]
}

function getFilesByMTime (cache) {
  return Object.keys(cache.files).reduce((memo, filePath) => {
    memo[filePath] = cache.files[filePath].stat.mtime
    return memo
  }, {})
}

function addFileToCache (cache, file) {
  cache.files[file.path] = cache.files[file.path] || file
}

export default function (src, context, done) {
  let cache = getCacheFromContext(context)
  let previousCache = getFilesByMTime(cache)

  function transform (file, enc, doneTransform) {
    if (src) {
      if (anymatch(src, file.relative)) {
        addFileToCache(cache, file)
      }
    } else {
      addFileToCache(cache, file)
    }

    this.push(file)
    doneTransform()
  }

  function flush (doneFlush) {
    let shouldRun = !deepEqual(getFilesByMTime(cache), previousCache)

    if (!shouldRun) {
      return doneFlush()
    }

    let files = Object.keys(cache.files).map((key) => {
      return cache.files[key]
    })

    done(files, doneFlush)
  }

  return through2.obj(transform, flush)
}
