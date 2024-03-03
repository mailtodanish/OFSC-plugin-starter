const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: ["./src/main.ts"],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: ["ts-loader"],
        include: [path.resolve(__dirname, "src")],
        exclude: "/node_modules",
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
        include: [path.resolve(__dirname, "src")],
        exclude: "/node_modules",
      },
    ],
  },

  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
