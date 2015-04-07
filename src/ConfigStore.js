import {
  xtend,
} from './vendor'

let defaultConfig = {
  gulp: require('gulp'),

  plugins: {
    order: {
      before: [],
      after: [],
    }
  },

  parchedWillLoad () { },
  parchedDidLoad () { },
}

let appConfig = defaultConfig

export function getAppConfig () {
  return xtend({}, appConfig)
}

export function setAppConfig (config) {
  appConfig = xtend(true, {}, defaultConfig, config)
  return appConfig
}
