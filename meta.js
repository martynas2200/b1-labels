import { createFilter } from '@rollup/pluginutils';
import { promises as fs } from 'fs';
import { connect } from 'http2';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility function to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read the version from package.json
export async function getVersion() {
  try {
    const packageJsonPath = path.resolve(__dirname, 'package.json');
    const packageJson = await fs.readFile(packageJsonPath, 'utf8');
    const { version } = JSON.parse(packageJson);
    return version;
  } catch (error) {
    console.error('Error reading package.json:', error);
    throw error;
  }
}

const metadata = {
  name: "Label Generator for the items in b1.lt",
  namespace: "http://tampermonkey.net/",
  homepage: "https://github.com/martynas2200/b1-labels",
  version: "1.0.0",
  description: "Generate labels for the selected items on the b1.lt website",
  author: "Martynas Miliauskas",
  match: "https://www.b1.lt/*",
  icon: "https://b1.lt/favicon.ico",
  "run-at": "document-start",
  connect: ["b1.lt", "raw.githubusercontent.com"],
  downloadURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/script.user.js",
  updateURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/script.user.js",
  grant: ["GM.setValue", "GM.getValue", "unsafeWindow", "GM_xmlhttpRequest"],
  license: "GNU GPLv3",
};

function addSpaces(key) {
  return ' '.repeat(16 - key.length);
}

export default async function addUserScriptMetadata(overwrites = {}) {
  for (const key in overwrites) {
    if (key in metadata) {
      metadata[key] = overwrites[key];
    }
  }
  metadata.version = await getVersion();
  const filter = createFilter(['**/*.js']);

  return {
    name: 'add-userscript-metadata',
    generateBundle(_, bundle) {
      for (const fileName in bundle) {
        if (filter(fileName)) {
          const content = bundle[fileName].code;
          let metadataBlock = `// ==UserScript==\n`;
          for (const key in metadata) {
            if (Array.isArray(metadata[key])) {
              metadata[key].forEach(value => {
                metadataBlock += `// @${key} ${addSpaces(key)} ${value}\n`;
              });
              continue;
            }
            metadataBlock += `// @${key} ${addSpaces(key)} ${metadata[key]}\n`;
          }
          metadataBlock += `// ==/UserScript==\n\n`;
          bundle[fileName].code = metadataBlock + content;
        }
      }
    }
  };
}
