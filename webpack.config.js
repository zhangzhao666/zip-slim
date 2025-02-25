import path from 'path';
import { fileURLToPath } from 'url';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: process.env.NODE_ENV || 'development', // 或 'production'
  entry: {
    'zip-slim': './src/index.ts', // 主应用入口
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
              transpileOnly: true, // 只进行转译，不进行类型检查，类型检查交给 ForkTsCheckerWebpackPlugin
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.wasm'],
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
    filename: '[name].js', // 根据入口名称生成文件名
    path: path.resolve(__dirname, 'build'),
    library: {
      type: 'module',
    },
    assetModuleFilename: '[name][ext]', // 保持生成的 wasm 文件名不变
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
      directory: path.join(__dirname, 'examples'),
    },
    compress: true,
    // port: 9000,
    open: true,
    // hot: true, // 启用 HMR
    historyApiFallback: {
      index: '/index.html', // 指定 index.html 文件的位置
    },
  },
};
