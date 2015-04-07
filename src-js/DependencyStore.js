let dependencyCache = {
  clean: [],
  build: [],
  watch: [],
}

// Clean
export function addDependencyToClean (taskName) {
  if (!taskName) {
    return
  }

  dependencyCache.clean = dependencyCache.clean.concat(taskName)
}

export function getDependenciesForClean () {
  return [].concat(dependencyCache.clean)
}

// Build
export function addDependencyToBuild (taskName) {
  if (!taskName) {
    return
  }

  dependencyCache.build = dependencyCache.build.concat(taskName)
}

export function getDependenciesForBuild () {
  return [].concat(dependencyCache.build)
}

// Watch
export function addDependencyToWatch (taskName) {
  if (!taskName) {
    return
  }

  dependencyCache.watch = dependencyCache.watch.concat(taskName)
}

export function getDependenciesForWatch () {
  return [].concat(dependencyCache.watch)
}

