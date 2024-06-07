# b1-labels
A case-specific userscript for generating and printing labels designed for items utilized within the online accounting program b1.lt. 

## Features
- Generates item labels from the online accounting program b1.lt
- Label size: 32 mm x 57 mm (Dymo Medium label)
- Designed for a tiny grocery store in my hometown
- Could be used in combination with silent printing for faster operation
- Future plans to add different label sizes and more customization options, possible integration with DYMO LabelWriter SDK for non-blocking printing

It is also facilitates the process of entering new items into the store's inventory by simplifying the forms and providing a user-friendly interface.

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

## Barcodeapi.org limitations
The userscript uses the barcodeapi.org API to generate barcodes for the labels. Be aware that it is a free service and has some limitations, it is not recommended to generate more than 80 barcodes per bulk. The service is rate-limited, so generating a large number of barcodes in a short period of time might lead to no response from the API.

[Useful APIdoc](https://www.b1.lt/doc/api#api-reference-book-items-create) for different data parameters to be used in the labels.