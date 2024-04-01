const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        resourceQuery: /raw/,
        type: "asset/source",
      },
    ],
  },
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  externals: { graphql: "graphql", "@apollo/client": "@apollo/client" },
  experiments: {
    outputModule: true,
  },
  externalsType: "module",
};
