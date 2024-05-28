import { createFilter } from '@rollup/pluginutils';
import { promises as fs } from 'fs';
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
  version: "1.0.0",
  description: "Generate labels for the selected items on the b1.lt website",
  author: "Martynas Miliauskas",
  match: "https://www.b1.lt/*",
  downloadURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/script.user.js",
  updateURL: "https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/script.user.js",
  license: "GNU GPLv3"
};

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
          const metadataBlock = `
// ==UserScript==
// @name         ${metadata.name}
// @namespace    ${metadata.namespace}
// @version      ${metadata.version}
// @description  ${metadata.description}
// @author       ${metadata.author}
// @match        ${metadata.match}
// @downloadURL  ${metadata.downloadURL}
// @updateURL    ${metadata.updateURL}
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        unsafeWindow
// @license      ${metadata.license}
// ==/UserScript==\n\n`;
          bundle[fileName].code = metadataBlock + content;
        }
      }
    }
  };
}
