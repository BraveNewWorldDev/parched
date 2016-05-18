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
  noop = gutil.noop

  shouldProcessAssets () {
    return false
  }

  getDefaultOptions () {
    return {}
  }
}

export function createPlugin (proto) {
  class __tmpPlugin extends Plugin {
  }

  Object.keys(proto).forEach((key) => {
    __tmpPlugin.prototype[key] = proto[key]
  })

  addPlugin(__tmpPlugin)
  return __tmpPlugin
}
