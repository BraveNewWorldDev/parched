import deprecatedWarning from '../util/deprecatedWarning'

import {
  getAppConfig,
} from '../ConfigStore'

import {
  gulp,
} from '../vendor'

gulp().task('parched-before', false, (done) => {
  let config = getAppConfig()

  if (config.__before) {
    deprecatedWarning('`appConfig.__before` is now `appConfig.parchedWillBuild`')
    config.__before(done)
  } else if (config.parchedWillBuild != null) {
    config.parchedWillBuild(done)
  } else {
    done()
  }
})

gulp().task('parched-after', false, (done) => {
  let config = getAppConfig()
  if (config.__after) {
    deprecatedWarning('`appConfig.__after` is now `appConfig.parchedDidBuild`')
    config.__after(done)
  } else if (config.parchedDidBuild) {
    config.parchedDidBuild(done)
  } else {
    done()
  }
})
