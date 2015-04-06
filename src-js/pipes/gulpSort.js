import through from 'through'
import sortBeforeAfter from './util/sortBeforeAfter'

export default function (options) {
  let allFiles = []

  function transform (file) {
    allFiles.push(file)
  }

  function flush () {
    let sorted = sortBeforeAfter({
      collection: allFiles,
      before: options.before,
      after: options.after,
      //matcher: options.matcher,
      getItem () {
        return item.path
      }
    })

    sorted.forEach((item) => {
      this.queue(item)
    })

    this.queue(null)
  }

  return through(transform, flush)
}
