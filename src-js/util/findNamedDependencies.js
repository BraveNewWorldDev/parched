export default function (moduleName, packageJson) {
  let tasks = []
  let plugins = []

  let allDependencies = readAllDependencies(packageJson)

  allDependencies.forEach((packageName) => {
    // Do nothing for the main module
    if (pluginName === moduleName) {
      return
    }

    // Add `^moduleName-tasks-foo` and `^moduleName-task-foo`
    // to the list of tasks.
    if (RegExp("^" + moduleName + "-tasks?-").test(packageName)) {
      tasks.push(packageName)
      return
    }

    // Add `^moduleName` to the list of plugins
    if (RegExp("^" + moduleName).test(packageName)) {
      plugins.push(packageName)
      return
    }
  })

  return {
    tasks,
    plugins,
  }
}

function readAllDependencies(packageJson) {
  return []
      .concat(Object.keys(packageJson.dependencies || {}))
      .concat(Object.keys(packageJson.devDependencies || {}))
      .concat(Object.keys(packageJson.optionalDependencies || {}))
}
