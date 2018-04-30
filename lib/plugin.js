const fs = require('fs');
const path = require('path');

function CleanEntryPlugin(options) {
  options = options || {}
  this.entries = options.entries;
  this.manifestPath = options.manifestPath;
  this.verbose = options.dryRun ? true : options.verbose;
  this.dryRun = options.dryRun || false;
}

CleanEntryPlugin.prototype.readManifest = (manifestPath) => {
  let manifestJson = null;

  if (fs.existsSync(manifestPath)) {
    manifestJson = JSON.parse(fs.readFileSync(manifestPath).toString())
  }

  return manifestJson;
}

CleanEntryPlugin.prototype.writeManifest = function (
  manifestPath,
  manifestJson)
{
  const dryRun = this.dryRun;
  const verbose = this.verbose;

  if (fs.existsSync(manifestPath)) {
    if (!dryRun) {
      fs.writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 2))
    }

    if (verbose) {
      console.warn(`clean-entry-plugin: writing manifest file to ${manifestJson}`);
    }
  }
}

CleanEntryPlugin.prototype.removeAsset = function (
  compilation,
  assetKey,
  extension = 'js')
{
  const outputPath = compilation.options.output.path;
  const file = path.join(outputPath, `${assetKey}.${extension}`);
  const dryRun = this.dryRun;
  const verbose = this.verbose;

  if (!dryRun && fs.existsSync(file)) {
    fs.unlinkSync(file);
    delete compilation.assets[assetKey];
  }

  if (verbose) {
    console.warn(`clean-entry-plugin: file ${file} has been removed`);
  }
}

CleanEntryPlugin.prototype.removeFromManifest = function (
  manifestJson,
  entry)
{
  const dryRun = this.dryRun;
  const verbose = this.verbose;

  if (!dryRun && manifestJson) {
    delete manifestJson[`${entry}.js`];
    delete manifestJson[`${entry}.map`];
  }

  if (verbose) {
    console.warn(`clean-entry-plugin: removed ${entry}.js & ${entry}.map from manifest`);
  }
}

CleanEntryPlugin.prototype.removeFromWebpackStats = function (
  compilation,
  assetKey)
{
  const dryRun = this.dryRun;
  const verbose = this.verbose;

  if (verbose) {
    console.warn(`clean-entry-plugin: removed ${assetKey} from webpack stats`);
  }

  if (dryRun) {
    return
  }

  for (let i = 0, iLen = compilation.chunks.length; i < iLen; i++) {
    if (typeof compilation.chunks[i] === 'undefined') {
      continue
    }

    for (let j = 0, jLen = compilation.chunks[i].files.length; j < jLen; j++) {
      if (compilation.chunks[i].files[j] === assetKey) {
        compilation.chunks[i].files.splice(j, 1)
        return
      }
    }
  }
}

CleanEntryPlugin.prototype.apply = function (compiler) {
  compiler.hooks.afterEmit.tap('CleanEntryPlugin', (compilation) => {
    const manifestPath = this.manifestPath;
    let manifestJson = this.readManifest(manifestPath);

    const _entry = compilation.compiler.options.entry;
    const entries = typeof _entry === "string" ? Array.of(_entry) : Object.keys(_entry);

    entries.forEach(entry => {
      this.removeAsset(compilation, entry)
      this.removeAsset(compilation, entry, 'map');
      this.removeFromManifest(manifestJson, entry);
      this.removeFromWebpackStats(compilation, `${entry}.js`)
    })

    this.writeManifest(manifestPath, manifestJson);
  })
}

module.exports = CleanEntryPlugin