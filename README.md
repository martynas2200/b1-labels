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
1. Install a userscript manager for your browser (e.g. Tampermonkey)
2. Click on the userscript file `b1-labels.user.js`
3. Click on the `Raw` button
4. The userscript manager should open and ask for installation
5. Confirm the installation
6. The userscript should now be installed and ready to use

## Usage
1. Open the online accounting program b1.lt
2. Navigate to the item list
3. Select the items you want to generate labels for
4. Click on the violet print icon.
5. The userscript will open a new tab with the labels
6. Print the labels using the browser's print window
7. Done!

## Barcodeapi.org limitations
The userscript uses the barcodeapi.org API to generate barcodes for the labels. Be aware that it is a free service and has some limitations, it is not recommended to generate more than 80 barcodes per bulk. The service is rate-limited, so generating a large number of barcodes in a short period of time might lead to no response from the API.

[Useful APIdoc](https://www.b1.lt/doc/api#api-reference-book-items-create) for different data parameters to be used in the labels.