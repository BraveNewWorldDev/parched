import gulpmatch from 'gulp-match'
import sortBeforeAfter from '../util/sortBeforeAfter'

import {
  xtend,
} from '../vendor'

import {
  getAppConfig,
} from '../ConfigStore'

let registeredNames = []
let registeredPlugins = []
let allInstances = []
let areAllInstancesLoaded = false

export function addPlugin (plugin) {
  let proto = plugin.prototype
  if (!proto.displayName) {
    throw new Error(`No 'displayName' given to parched plugin`)
  }

  if (!proto.src) {
    throw new Error(`No 'src' given to '${proto.displayName}'`)
  }

  if (registeredNames.indexOf(proto.displayName) !== -1) {
    throw new Error(`The name '${proto.displayName}' has already been registered`)
  }

  if (!Array.isArray(proto.src)) {
    proto.src = [proto.src]
  }

  proto.src = proto.src.map((item) => {
    if (typeof item === 'string') {
      if (item.indexOf('/') === -1) {
        return `**/${item}`
      } else {
        return item
      }
    } else {
      return item
    }
  })

  registeredNames.push(proto.displayName)
  registeredPlugins.push(plugin)
}

export function clearPlugins () {
  while (registeredPlugins.length > 0) {
    registeredPlugins.pop()
  }

  while (registeredNames.length > 0) {
    registeredNames.pop()
  }
}

export function getAllInstances () {
  if (areAllInstancesLoaded) {
    return allInstances
  }

  let config = getAppConfig()
  registeredPlugins.forEach((plugin) => {
    let instance = new plugin()
    instance.options = xtend(
      true,
      instance.getDefaultOptions(),
      config.plugins[instance.displayName]
    )

    allInstances.push(instance)
  })

  allInstances = sortBeforeAfter({
    collection: allInstances,
    before: config.plugins.order.before,
    after: config.plugins.order.after,
    getItem (item) {
      return item.displayName
    }
  })

  areAllInstancesLoaded = true
  return allInstances
}

export function clearAllInstances () {
  while (allInstances.length > 0) {
    allInstances.pop()
  }
}
