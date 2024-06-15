let package = require('./package.json');
require('dotenv').config();

// Snowpack config
/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  root: './src',
  buildOptions: {
    out: './pub'
  },
  devOptions: {
    port: 5500,
    open: 'none'
  },
  optimize: {
    minify: true
  },
  routes: [
    {
      match: 'routes',
      src: '.*',
      dest: '/index.html',
    }
  ],
  env: {
    bungieApiKey: process.env.BUNGIE_API_KEY,
    csDeliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN,
    csAccessToken: process.env.CONTENTSTACK_ACCESS_TOKEN,
    version: `${package.version}`
  },
  plugins: ['@snowpack/plugin-postcss']
};