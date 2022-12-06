//@ts-check

const path = require("path");
//const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");
/**@type {import('webpack').Configuration} */
module.exports = {
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]"
  },
  //   devtool: "source-map",
  externals: [
    {
      vscode: "commonjs vscode"
    }
  ],
  resolve: {
    extensions: [".ts", ".js"],
    modules: ["node_modules", path.resolve(__dirname, "src")]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV
    })
  ],
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.json")
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  }
};
