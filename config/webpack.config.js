'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      mountaineer: PATHS.src + '/content-script/mountaineer.ts',
      background: PATHS.src + '/service_worker/background.ts',
      popup: PATHS.src + '/popup/popup.ts',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
