//@ts-check

const path = require("path");
const webpack = require("webpack");
/**@type  import('webpack').Configuration */
module.exports = {
  target: "node",
  entry: "server.ts",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "languageserver.js",
    libraryTarget: "commonjs",
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: ["node_modules", path.resolve(__dirname, "src")],
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
  // plugins: [
  //   new webpack.EnvironmentPlugin({
  //     NODE_ENV: process.env.NODE_ENV,
  //   }),
  // ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.json"),
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
    ],
  },
};
