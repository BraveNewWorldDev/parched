import plumber from 'gulp-plumber'
import handleErrors from './handleErrors'

export default function () {
  return plumber({
    errorHandler: handleErrors
  })
}
