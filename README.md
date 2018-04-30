# Clean Entry Webpack Plugin

A webpack plugin to remove unwanted files which may have been created and output due to multiple entry points

This plugin supports only `webpack@4` aka the latest and the greatest.

## Problem

I have generally used Webpack with a `javascript` entry point. But this is not
mandatory.

Webpack can have a css, sass or postcss entry point. Maybe others types as well,
but I have not checked. However, one problem with a non-javascript entry point
is that the postcss entry will still output a javascript file.

Even with specifying Webpack's `output.filename` as `[name]-[hash].css`
generates a javascript file with a mis-named css extension.
And `ExtractTextPlugin` solves it by extracting the css file from the bundle
but the javascript file still remains.

This is of particular interest, for css-only Webpack builds ie. using Webpack
where we might have used Gulp in the past.

This plugin removes:

1. javascript files for entries
2. references to (1) above from `manifest.json`, if you are using the [webpack-manifest-plugin](https://github.com/danethurber/webpack-manifest-plugin)
3. sourcemap files for entries

## Usage

Install using `npm` or `yarn`
```js
npm install clean-entry-webpack-plugin --save-dev
yarn add clean-entry-webpack-plugin --dev
```

In your `webpack.config.js` file:

```js
const CleanEntryPlugin = require('clean-entry-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new CleanEntryPlugin()
  ]
}
```

## All Configuration Options

The CleanEntryPlugin accepts an object of options with the following attributes:

```js
new CleanEntryPlugin({
  manifestPath: path.join(path.resolve(__dirname, 'data'), 'manifest.json')
  verbose: true
})
```

* `entries` - a list of entries to clean. defaults to all of Webpack's entries.
* `manifestPath` - full path to the `manifest.json` file (not relative), if any. Build does not fail if path does not exist.
* `verbose` - log which files are deleted. defaults to false.
* `dryRun` - do not actually delete any files. assumes `verbose`. defaults to false

## Development

[brew](https://brew.sh/) works on OSX and Linux

```sh
brew install yarn git-hooks
git hooks --install
echo "to test commit message without actually commiting" | commitlint
# inside this plugin
yarn link
# in your webpack project
yarn link "clean-entry-webpack-plugin"
```

## TODO

- have tried only with `webpack-manifest-plugin`. how to handle other alternatives ?
- add tests
- tested on OSX. need to test on Windows
- supports only webpack 4
- annotate options with typescript

## CREDITS

- forked code from https://github.com/AnujRNair/webpack-extraneous-file-cleanup-plugin
  Anuj's code deals with the actual files, extension globs and min-size but this fork
  has Webpack's entry as the abstraction not the actual files. Also we do not care about min-size.
- webpack@4 support from https://github.com/bookwyrm/webpack-extraneous-file-cleanup-plugin/tree/webpack4