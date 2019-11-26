module.exports = {
  devServer: {
    proxy: {

      '/importer-api': {
        target: 'http://0.0.0.0:8080/api',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/importer-api': ''
        }
      },

      '/store-api': {
        target: 'http://0.0.0.0:8080/api1',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/store-api': ''
        }
      },

      '/cafe-api': {
        target: 'http://0.0.0.0:8080/api2',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/cafe-api': ''
        }
      },

      '/deliver-api': {
        target: 'http://0.0.0.0:8080/api3',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/deliver-api': ''
        }
      }

    }
  }
}
