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
      src: '/home',
      dest: '/index.html',
    },
    {
      match: 'routes',
      src: '.*',
      dest: '/index.html',
    }
  ],
  plugins: ['@snowpack/plugin-postcss']
};