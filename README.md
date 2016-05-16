# Parched

> **NOTE:** This is hella experimental. Please give any feedback you might have.

Parched is a tiny layer built on top of Gulp that lets people write and share
plugins and tasks with minimal configuration from the end user.

It aims for convention over configuration.  
It is heavily inspired by Brunch.

See [parched-example-app](https://github.com/raisedmedia/parched-example-app), or [parched-tasks-webapp](https://github.com/raisedmedia/parched-tasks-webapp) even. The following will be based on them.

A list of ready-made plugins [can be found on npm](https://www.npmjs.com/browse/keyword/parched).

## Getting Started

```bash
npm install --save gulp parched
```

Then update your `Gulpfile.js`.

```javascript
var gulp = require('gulp');
var Parched = require('parched');

Parched.setup({
  gulp: gulp,
  
  plugins: {
    'parched-jshint': {
      reporter: 'some-other-reporter'
    }
  },
  
  parchedWillBuild: function (done) {
    console.log('Before');
    done();
  },
  
  parchedDidBuild: function (done) {
    console.log('After');
    done();
  }
});
```

Any dependencies in `package.json` starting with `/^parched-.+/` will be
loaded, and, if they export a function they will be passed a `Parched` API
object.

This is `parched-jshint`:

```javascript
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

// All plugins and tasks loaded by Parched are passed an object containing
// the API.
module.exports = function (Parched) {
  Parched.createPlugin({
    // This property is required and must be unique.
    // The upside is all plugins are more easily configured
    // and sorted in `appConfig`.
    displayName: 'parched-jshint',
    
    // This can be an array.
    src: '*.js',
    
    // Returns an empty object by default.
    getDefaultOptions: function () {
      return {
        reporter: stylish
      };
    },
    
    // This will be called in the task we create later.
    lint: function () {
      // Basically, plugins return something that will work in a regular
      // Gulp pipeline. Return one item or an array, Parched don't mind.
      var pipeline = [
        jshint(this.options),
        jshint.reporter(this.options.reporter)
      ];
      
      // There is a concept of `production`.
      if (this.isProduction()) {
        pipeline.push(jshint.reporter('fail'));
      }
      
      return pipeline;
    }
  });
};
```

Okay, sure, but how do you call these methods? First, let's define a
task:

```javascript
Parched.createTask({
  taskName: 'build-app-scripts',
  
  // This can be an array.
  src: 'app/scripts/**/*',
  
  // Parched makes heavy use of `run-sequence`, in this example `lint` and
  // `transform` will be run in parallel. Drop the nested array and they will
  // be run in sequence.
  sequence: [
    ['lint', 'transform']
  ]
});
```

Now in your terminal run `gulp build-app-scripts`. Voila!

You might expect the output of `lint` to be passed to `transform`, but Parched
opts for parallelization. To do more with the methods in the sequence, you can
simply add `before` and `after` callbacks in `createTask`.

```javascript
Parched.createTask({
  // ...
  
  // This prepended to each stream in the sequence.
  beforeEach: function (stream, streamContext) {
    // `streamContext` contains context ... about the stream.
    console.log(streamContext);
    return stream
      .pipe(cached(streamContext.taskNameUnique));
  }
  
  // This is appended to each stream in the sequence.
  afterEach: function (stream, streamContext) {
    return stream
      .pipe(remember(streamContext.taskNameUnique));
  }
  
  // This is appended to the `transform` stream.
  afterTransform: function (stream) {
    return stream
      .pipe(gulp.dest('public'));
  }
});
```

## Parched.setup(appConfig)

The main entrypoint into Parched.

Property | Description
---------|------------
`stream beforeEach(stream, streamContext)` | Will be run *before every method of every sequence of every task*
`stream afterEach(stream, streamContext)` | Will be run *after every method of every sequence of every task*
`string[]? plugins.order.before` | Specify which plugins should be run first
`string[]? plugins.order.after` | Specify which plugins should be run last
`object? plugins[plugin.displayName]` | Will be merged with `plugin.getDefaultOptions()` to create `plugin.options`
`void parchedWillBuild(done)` | Put any logic you want to run *before* any builds here.
`void parchedDidBuild(done)` | Put any logic you want to run *after* any builds here.

## Public API

### Parched.createPlugin(pluginPrototype)

Property | Description
---------|------------
`string displayName` | The unique name of the plugin
`string[] src` | Which files to act on
`bool? shouldProcessAssets()` | Does this plugin process "assets"?
`object? getDefaultOptions()` | The plugin's default options
`bool isProduction()` | `NODE_ENV === 'production'`
`stream processManyFiles(src / null, context, process(files, done))` | Returns a through stream, passing all matched files to the process callback. If no `src` was passed, the plugin's `src` will be used.
`stream noop` | `gutil.noop`

### Parched.createTask(taskOptions)

Passes each item in the sequence to `createPluginMethodTask` and a creates
a gulp task that returns a `runSequence` based on `[].concat(deps).concat(sequence)`

Property | Description
---------|------------
`string taskName` | The name of the task
`string? helpText` | Help text to be displayed with `gulp --help`
`string[] sequence` | The sequence of methods to be called in this task
`string[]? deps` | Any dependencies of this task. **Note** these are passed through `run-sequence`, so nested arrays means run in parallel.

### Parched.addPluginMethodsToStream(streamContext)

Pipe a stream through *all plugins* and their methods.

> For instance this is used in the webapp tasks in `afterTransform` of the final
> scripts and styles builds to to run `minify`

Property | Description
---------|------------
`string[] methodNames` | Flat list of plugin method names
`stream stream` | The stream to be modified
`bool? shouldProcessAssets` | To asset or not

### Parched.createPluginMethodTask(options)

Creates a Gulp task of many `gulp.src` streams that are modified in before
and after callbacks.

Property | Description
---------|------------
`string taskName` (string) | The name of the task
`string src` | Which files to act on (can also be an array)
`void? modifyContext(taskOptions)` | Modify the taskOptions / streamContext
`bool? shouldProcessAssets` | Are these files "assets"?
`stream? beforeEach(stream, streamContext)` | Will be run *before* each method in the sequence
`stream? afterEach(stream, streamContext)` | Will be run *after* each method in the sequence
`stream? beforeMethod(stream, streamContext)` | Will be run *before* the targeted method in the sequence
`stream? afterMethod(stream, streamContext)` | Will be run *after* the targeted method in the sequence

Parched has a concept of `assets`. If a task `shouldProcessAssets`, any
plugins that don't will be skipped, and vice versa.

**A note on before/after callbacks:** The targeted callbacks are called
before and after `beforeEach` / `afterEach`, ie given we are calling the
`lint` method from `parched-jshint`:

```javascript
var streamContext = {
  pluginInstance: __pluginInstance,
  methodName: 'lint',
  taskName: 'build-app-scripts',
  taskNameProxy: 'build-app-scripts--lint',
  taskNameUnique: 'build-app-scripts--lint--parched-jshint'
};

beforeLint(stream, streamContext);
beforeEach(stream, streamContext);
beforeEachFromConfig(stream, streamContext);
__pluginInstance[methodName](streamContext);
afterEachFromConfig(stream, streamContext);
afterEach(stream, streamContext);
afterLint(stream, streamContext);
```

### Parched.sortBeforeAfter(options)

Sort an array based on `before` and `after` properties.

Property | Description
---------|------------
`object[] collection` | The array to act on
`string[]? before` | What should be first
`string[]? after` | What should be last
`string? getItem(item)` | Any logic to identify the item

### Parched.gulpSort(options)

Sort a stream of gulp files with `sortBeforeAfter`

Property | Description
---------|------------
`string[]? before` | What should be first
`string[]? after` | What should be last

### Parched.processManyFiles(src, streamContext, process(files, done))

Returns a through stream that will call `process` with any files matching
`src`. When used in a watch scenario, it will run when files are updated, not
only when their contents change.

> When used in `createPlugin`, omitting `src` with give you an array
> of all files matching `plugin.src`. This allows things like `parched-webfont`
> have configurable `options.svgPath` while still watching all .svg assets
> for changes.

Property | Description
---------|------------
`object taskNameUnique` | Something unique so the cache can keep track of things.

### Parched.addDependencyToClean(taskName)

Adds gulp task `taskName` to the `parched-clean` task.

### Parched.addDependencyToBuild(taskName)

Adds gulp task `taskName` to the `parched-build` task.

### Parched.addDependencyToWatch(taskName)

Adds gulp task `taskName` to the `parched-watch` task.

### Parched.vendor

The foundation.

Exported Name | Package
--------------|--------
`gulp` | This is actually a function that returns the gulp reference defined in `appConfig`
`gulpif` | gulp-if
`gutil` | gulp-util
`through2` | through2
`combine` | stream-combiner
`merge` | merge-stream
`runSequence` | run-sequence
`xtend` | node.extend
`anymatch` | anymatch
`lazypipe` | lazypipe
`multistream` | multistream
