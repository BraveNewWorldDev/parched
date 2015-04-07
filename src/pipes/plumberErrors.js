import plumber from 'gulp-plumber'
import handleErrors from '../util/handleErrors'

export default function () {
  return plumber({
    errorHandler: handleErrors
  })
}
