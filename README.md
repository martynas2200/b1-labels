# b1-labels
A case-specific userscript for generating and printing labels designed for items utilized within the online accounting program b1.lt. 

## Features
- Generates item labels from data in the b1.lt online accounting program;
- Label size: 32 mm x 57 mm (Dymo Medium label);
- Designed for a tiny grocery store in my hometown;
- Could be used in combination with silent (kiosk) printing for faster operation
- Barcode and Datamatrix generation done locally
- Uses Google Text-to-Speech API to say out loud the item price
- User-friendly modal for weighted item labeling


## Installation
1. Make sure you have a userscript manager installed in your browser (e.g. Tampermonkey, Greasemonkey)
2. Open [script.user.js](https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/script.user.js) file
4. The userscript manager will prompt you to install the script
5. Confirm it and you are ready to go!

## Usage
### Normal operation
After logging in to the online accounting program b1.lt, the script will add a violet print icon to the item list, any purchase list, and item edit page. Clicking on the icon will open a new tab with the labels ready to be printed.
### Possible kiosk operation
When the user has logged in, and has limited user rights in b1.lt, the script will automatically load the label printing interface. The user can then scan the barcode of items, search by name and the labels will be generated automatically from the list.
The UI is designed to be simple and user-friendly, has an option to say out loud the item price, so the user can verify the price before printing the label or use the label tagging machine to tag the items, especially useful for prepackaged tiny weighted items where a huge label would be an overkill.

## Barcode generation
To speed up the printing, the userscript utilizes barcode and Datamatrix generation locally using libraries created by Alois Zingl. More information and demo can be found [here](https://zingl.github.io/).