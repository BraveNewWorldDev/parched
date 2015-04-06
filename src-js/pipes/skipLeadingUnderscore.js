import path from 'path'
import through2 from 'through2'

export default function () {
  function transform (file, enc, doneTransform) {
    let relativePath = path.relative(process.cwd(), file.path)

    if (relativePath.indexOf('/_') === -1) {
      this.push(file)
    }

    doneTransform()
  }

  return through2.obj(transform)
}
