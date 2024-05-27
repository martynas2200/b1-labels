import typescript from '@rollup/plugin-typescript';
import addUserScriptMetadata from './meta.js';
// const pkg = require('package.json');
// load it as a module
// import pkg from './package.json';

export default {
  input: 'src/script.user.ts',
  output: {
    file: 'dist/script.user.js',
    format: 'iife',
    name: 'b1userscript',
  },
  plugins: [
    typescript(
      {
        tsconfig: 'tsconfig.json',
        module: 'esnext',
        removeComments: true,
        declaration: false,
        sourceMap: false,
        inlineSources: false,
        inlineSourceMap: false
      }
    ),
    addUserScriptMetadata()
  ]
};
