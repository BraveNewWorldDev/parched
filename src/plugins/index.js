import isProduction from '../util/isProduction'
import processManyFiles from '../pipes/processManyFiles'

import {
  addPlugin,
} from './PluginStore'

import {
  gutil,
} from '../vendor'

let registeredNames = []

export class Plugin {
  isProduction = isProduction
  processManyFiles = processManyFiles

  noop () {
    return gutil.noop()
  }

  shouldProcessAssets () {
    return false
  }

  getDefaultOptions () {
    return {}
  }
}

// TODO is there a better way of setting simple properties on an ES6 class
Plugin.prototype.isProduction = isProduction
Plugin.prototype.processManyFiles = processManyFiles

export function createPlugin (proto) {
  class __tmpPlugin extends Plugin {
  }

  Object.keys(proto).forEach((key) => {
    __tmpPlugin.prototype[key] = proto[key]
  })

  addPlugin(__tmpPlugin)
  return __tmpPlugin
}
