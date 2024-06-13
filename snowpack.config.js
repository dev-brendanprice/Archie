let package = require('./package.json');

// // Snowpack config
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
    version: `${package.version}`
  },
  plugins: ['@snowpack/plugin-postcss']
};