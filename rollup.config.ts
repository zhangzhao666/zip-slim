import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts', // 你的入口文件
  output: [
    {
      file: 'dist/index.cjs.js', // CommonJS 格式
      format: 'cjs',
      exports: 'auto'
    },
    {
      file: 'dist/index.esm.js', // ES Module 格式
      format: 'esm'
    },
    {
      file: 'dist/index.umd.js', // UMD 格式
      format: 'umd',
      name: 'ZipSlim' // 全局变量名
    }
  ],
  plugins: [
    resolve(), // 处理 node_modules 中的依赖
    commonjs(), // 将 CommonJS 转换为 ESM
    terser(), // 压缩代码
    typescript({ 
      tsconfig: './tsconfig.json',
      declaration: true, // 生成类型声明
      declarationDir: 'dist/types', // 类型声明输出目录
    })
  ]
};