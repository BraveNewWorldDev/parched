import {
  through2,
  gutil,
} from '../vendor'

export default function announceFileProcessing (pluginInstance, methodName) {
  function transform (file, enc, done) {
    console.log(` \
    Will process \
    \`${file.relative}\` \
    with \
    \`${pluginInstance.displayName}#${methodName}\` \
    `)
    this.push(file)
    done()
  }

  return gutil.noop()
  return through2.obj(transform)
}
