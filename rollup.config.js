import typescript from '@rollup/plugin-typescript';
import addUserScriptMetadata from './meta.js';
import { createFilter } from '@rollup/pluginutils';
import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';

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
    input: 'src/admin/admin.user.ts',
    output: {
      file: 'dist/admin.user.js',
      format: 'iife',
      name: 'b1userscript',
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
        inlineSourceMap: false
      }),
      addUserScriptMetadata({
        name: "B1 additional functions",
        description: "Markup calculator",
      }),
      // terser()
    ],
    onwarn: (warning, warn) => {
      // Suppress warnings for barcodeGenerator.ts
      if (warning.loc && warning.loc.file.includes('barcodeGenerator.ts')) {
        return;
      }
      // Use default for everything else
      warn(warning)
    },
  }, {
  input: 'src/script.user.ts',
  output: {
    file: 'dist/script.user.js',
    format: 'iife',
    name: 'b1userscript',
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
      inlineSourceMap: false
    }
    ),
    addUserScriptMetadata(),
    terser()
  ],
  onwarn: (warning, warn) => {
    // Suppress warnings for barcodeGenerator.ts
    if (warning.loc && warning.loc.file.includes('barcodeGenerator.ts')) {
      return;
    }
    // Use default for everything else
    warn(warning)
  },
}];