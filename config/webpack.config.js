'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      mountaineer: PATHS.src + '/mountaineer.ts',
      // background: PATHS.src + '/background.ts',
      popup: PATHS.src + '/popup.ts',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
