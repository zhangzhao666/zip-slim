import path from "path";
import { fileURLToPath } from "url";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: process.env.NODE_ENV || "development", // 或 'production'
  entry: {
    "zip-slim": "./src/main.ts", // 主应用入口
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.worker\.(js|ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "worker-loader",
            options: {
              inline: "fallback", // 使用内联 worker
              filename: "[name].js", // 明确指定输出文件名
            },
          },
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 移除 console
          },
          format: {
            comments: false, // 移除注释
          },
        },
        extractComments: false,
      }),
    ],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
    library: {
      type: "module",
    },
    assetModuleFilename: "[name][ext]",
    module: true, // 确保生成的模块格式与 HMR 配合使用
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    new CleanWebpackPlugin(), // 添加清理插件
    new ForkTsCheckerWebpackPlugin(), // 添加 TypeScript 类型检查插件
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "examples"),
    },
    client: {
      overlay: false, // 如果想要禁用错误覆盖，可以关闭
    },
    // compress: true,
    // port: 9000,
    open: true,
    hot: false,
    historyApiFallback: {
      index: "/index.html", // 指定 index.html 文件的位置
    },
  },
};
