# b1-labels
A case-specific userscript for generating and printing labels designed for items utilized within the online accounting program b1.lt. 

## Features
- Generates item labels from data in the b1.lt online accounting program;
- Label size: 32 mm x 57 mm (Dymo Medium label);
- Designed for a tiny grocery store in my hometown;
- Could be used in combination with silent (kiosk) printing for faster operation;
- Barcode and Datamatrix generation done locally;
- Uses Google Text-to-Speech API to say out loud the item price;
- User-friendly modal for weighted item labeling.

## Installation
1. Make sure you have a userscript manager installed in your browser (e.g. Tampermonkey, Greasemonkey).
2. Open one of the following scripts based on your needs:
   - [Standard Interface](https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/labels.user.js)
   - [Kiosk Mode](https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/kiosk.user.js)
   - [Administrative Tools](https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/accounting.user.js)
3. The userscript manager will prompt you to install the script.
4. Confirm it and you are ready to go!

## Usage
There are three different userscripts available, each serving different purposes:

### Label Printing Scripts
#### Standard Interface - `labels.user.js`
- Adds a violet print icon to item lists, purchase lists, and item edit pages
- Click the icon to open labels in a new tab ready for printing
- Intended for users with full administrative access
- Also includes a modal for printing weighted items

#### Kiosk Mode - `kiosk.user.js` 
- Simplified interface focused solely on label printing and price verification
- Automatically loads the label printing interface on login if the user has limited permissions
- Designed for users with limited permissions
- Features:
  - Barcode scanning support
  - Item name search
  - Text-to-speech price verification
  - Optimized for labeling weighted packaged items
  - Quick label generation

### Administrative Tools - `accounting.user.js`
- Adds additional functionality for accounting and inventory management:
  - Markup calculator for purchase views
  - Quick access to item history and price changes (shortcut for item movement view)
  - Pricing assistance with markup percentage calculations

## Barcode generation
To speed up the printing, the userscript utilizes barcode and Datamatrix generation locally using libraries created by Alois Zingl. More information and demo can be found [here](https://zingl.github.io/).