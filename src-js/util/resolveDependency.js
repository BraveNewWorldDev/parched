import resolve from 'resolve'

export default function (packageName) {
  return require(resolve.sync(packageName, {
    basedir: process.cwd()
  }))
}
