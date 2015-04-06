let gulpReference = {}

export function getGulpReference () {
  return gulpReference
}

export function setGulpReference (gulp) {
  if (!gulp) {
    return
  }

  gulpReference = gulp
}
