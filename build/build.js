// https://github.com/shelljs/shelljs
/* global env, rm, mkdir, cp */
require('shelljs/global')
env.NODE_ENV = 'production'

var path = require('path')
var ora = require('ora')
var webpack = require('webpack')
var webpackConfig = require('../webpack.production.config')

var spinner = ora('building for production...')
spinner.start()

webpack(webpackConfig, function (err, stats) {
  spinner.stop()
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')

  moveAssets()
})

function moveAssets () {
  var assetsRoot = path.resolve(__dirname, '../public')
  var assetsPath = path.join(assetsRoot, 'assets')
  rm('-rf', assetsPath)
  mkdir('-p', assetsPath)
  cp('-R', 'assets/*', assetsPath)
  cp('-R', 'dist', 'public')
  cp('index.html', 'public')
}
