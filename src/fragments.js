const fs = require("fs");
const path = require("path");

const fragments = fs.readFileSync(
  path.resolve(__dirname, "fragments.graphql"),
  "utf8"
);

const fragmentsMetadata = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "fragments-metadata.json"), "utf8")
);

exports.fragments = fragments;
exports.fragmentsMetadata = fragmentsMetadata;
