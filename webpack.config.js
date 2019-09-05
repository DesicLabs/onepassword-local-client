const path = require("path");
const webpack = require("webpack");
const DtsBundleWebpack = require("dts-bundle-webpack");
const nodeExternals = require("webpack-node-externals");

const config = {
  entry: "./src/Client.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new DtsBundleWebpack({
      name: "onepassword",
      main: "dist/Client.d.ts",
      removeSource: true,
      outputAsModuleFolder: true
    })
  ],
  mode: "production",
  //devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    globalObject: "typeof self !== 'undefined' ? self : this"
  }
};

const serverConfig = {
  ...config,
  externals: [nodeExternals()],
  target: "node",
  output: { ...config.output, filename: "onepassword.js" },
  plugins: [
    ...config.plugins,
    new webpack.ProvidePlugin({
      FormData: "form-data",
      fetch: ["node-fetch", "default"]
    })
  ]
};

module.exports = serverConfig;
