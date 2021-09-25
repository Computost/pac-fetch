import webpack, { Configuration } from "webpack";
import { merge } from "webpack-merge";
const { BannerPlugin } = webpack;

const baseConfig: Configuration = {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new BannerPlugin({
      banner: "#!/usr/bin/env node",
      raw: true,
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
  target: "node",
};

export default [
  merge(baseConfig, {
    entry: "./src/download",
    output: { filename: "download.cjs" },
  }),
];
