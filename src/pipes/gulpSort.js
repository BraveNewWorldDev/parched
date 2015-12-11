import through2 from 'through2'
import sortBeforeAfter from '../util/sortBeforeAfter'

export default function (options) {
  let allFiles = []

  function transform (file, enc, done) {
    allFiles.push(file)
    done()
  }

  function flush (done) {
    let sorted = sortBeforeAfter({
      collection: allFiles,
      before: options.before,
      after: options.after,
      //matcher: options.matcher,
      getItem (item) {
        return item.path
      }
    })

    sorted.forEach((item) => {
      this.push(item)
    })

    done()
  }

  return through2.obj(transform, flush)
}
