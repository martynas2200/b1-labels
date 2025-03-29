import typescript from '@rollup/plugin-typescript';
import addUserScriptMetadata from './meta.js';
import { createFilter } from '@rollup/pluginutils';
import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

function htmlToTemplateString() {
  const filter = createFilter('**/*.html');
  return {
    name: 'html-to-template-string',
    transform(code, id) {
      if (filter(id)) {
        const escapedContent = code.replace(/`/g, '\\`').replace(/\s{2,}/g, ' ');
        return {
          code: `export default function(i18n) { return \`${escapedContent}\`; }`,
          map: { mappings: '' },
        };
      }
      return null;
    },
  };
}

export default [{
    input: 'src/scripts/accounting.user.ts',
    output: {
      file: 'dist/accounting.user.js',
      format: 'iife',
      name: 'b1userscript',
      inlineDynamicImports: true
    },
    treeshake: {
      moduleSideEffects: true,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
      preset: 'smallest'
    },
    plugins: [
      scss({
        output: false,
        outputStyle: 'compressed',
        failOnError: true
      }),
      htmlToTemplateString(),
      typescript({
        tsconfig: 'tsconfig.json',
        module: 'esnext',
        removeComments: true,
        declaration: false,
        sourceMap: false,
        inlineSources: false,
        inlineSourceMap: false,
      }),
      addUserScriptMetadata({
        name: "B1 Accounting Tools",
        description: "Additional accounting and inventory management tools",
        downloadURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/accounting.user.js",
        updateURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/accounting.user.js",
      }),
      replace({
        preventAssignment: true,
        values: {
          'TRANSLATION_SERVICE': 'MINIMAL_TRANSLATIONS',
        },
      }),
      terser()
    ],
    onwarn: (warning, warn) => {
      if (warning.loc && warning.loc.file.includes('barcodeGenerator.ts')) {
        return;
      }
      // warn(warning)
    },
  }, {
    input: 'src/scripts/labels.user.ts',
    output: {
      file: 'dist/labels.user.js',
      format: 'iife',
      name: 'b1userscript',
      inlineDynamicImports: true
    },
    treeshake: {
      moduleSideEffects: true,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
      preset: 'smallest'
    },
    plugins: [
      scss({
        output: false,
        outputStyle: 'compressed',
        failOnError: true
      }),
      htmlToTemplateString(),
      typescript({
        tsconfig: 'tsconfig.json',
        module: 'esnext',
        removeComments: true,
        declaration: false,
        sourceMap: false,
        inlineSources: false,
        inlineSourceMap: false,
      }),
      addUserScriptMetadata({
        name: "B1 Label Printing",
        description: "Standard label printing interface",
        downloadURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/labels.user.js",
        updateURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/labels.user.js",
      }),
      replace({
        preventAssignment: true,
        values: {
          'TRANSLATION_SERVICE': 'MINIMAL_TRANSLATIONS'
        },
      }),
      // terser()
    ],
    onwarn: (warning, warn) => {
      if (warning.loc && warning.loc.file.includes('barcodeGenerator.ts')) {
        return;
      }
      warn(warning)
    },
  }, {
    input: 'src/scripts/kiosk.user.ts',
    output: {
      file: 'dist/kiosk.user.js',
      format: 'iife',
      name: 'b1userscript',
      inlineDynamicImports: true
    },
    treeshake: {
      moduleSideEffects: true,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
      preset: 'smallest'
    },
    plugins: [
      scss({
        output: false,
        outputStyle: 'compressed',
        failOnError: true
      }),
      htmlToTemplateString(),
      typescript({
        tsconfig: 'tsconfig.json',
        module: 'esnext',
        removeComments: true,
        declaration: false,
        sourceMap: false,
        inlineSources: false,
        inlineSourceMap: false,
      }),
      addUserScriptMetadata({
        name: "B1 Kiosk Mode",
        description: "Simplified kiosk interface for label printing",
        downloadURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/kiosk.user.js",
        updateURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/kiosk.user.js",
      }),
      replace({
        preventAssignment: true,
        values: {
          'TRANSLATION_SERVICE': 'FULL_TRANSLATIONS',
        },
      }),
      terser()
    ],
    onwarn: (warning, warn) => {
      if (warning.loc && warning.loc.file.includes('barcodeGenerator.ts')) {
        return;
      }
      warn(warning)
    },
  }];