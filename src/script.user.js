// ==UserScript==
// @name         Label Generator for the items in b1.lt
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Generate labels for selected rows of the items in the reference book.
// @author       Martynas Miliauskas
// @match        https://www.b1.lt/*
// @downloadURL  https://raw.githubusercontent.com/martynas2200/b1-labels/main/src/script.user.js
// @updateURL    https://raw.githubusercontent.com/martynas2200/b1-labels/main/src/script.user.js
// @grant        unsafeWindow
// @license      GNU GPLv3
// ==/UserScript==

(function() {
    'use strict';

    // Global variable indicating whether all selected items are active in POS system
    var isEverythingActive = true;

    // Append button to the block with class "navbar-shortcuts"
    const navbarShortcuts = document.querySelector('.navbar-shortcuts');
    const settingsButton = document.createElement('span');
    settingsButton.textContent = 'Spausdinimo nustatymai';
    settingsButton.addEventListener('click', openSettingsModal); 

    const liElement = document.createElement('li');
    const aElement = document.createElement('a');
    aElement.href = '#';
    aElement.appendChild(settingsButton);
    aElement.className = 'navbar-shortcut'; 

    liElement.appendChild(aElement);
    navbarShortcuts.querySelector('ul').appendChild(liElement);

    // Create modal to hold the settings
    const modal = document.createElement('div');
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #fff; padding: 20px; border-radius: 5px;">
            <h2>Silent Printing Settings</h2>
            <label>
                <input type="checkbox" id="enableSilentPrinting">Automatiškai uždaryti spaudinimo langą (kai įgalintas tylusis spausdinimas)
            </label>
            <br><br>
            <button id="saveSettings">Išsaugoti</button>
            <button id="closeModal">Uždaryti</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Function to open modal
    function openSettingsModal() {
        modal.style.display = 'block';
    }

    // Function to close modal
    function closeSettingsModal() {
        modal.style.display = 'none';
    }

    // Load saved settings from local storage when the page loads
    window.addEventListener('DOMContentLoaded', function() {
        this.setTimeout(() => { // Timeout is needed because the settings button is created after the DOMContentLoaded event, perhaps not efficient way to do this
            const savedEnableSilentPrinting = localStorage.getItem('enableSilentPrinting');
            document.getElementById('enableSilentPrinting').checked = (savedEnableSilentPrinting === 'true');
        }, 2000);
    });
    // Save button click event
    document.getElementById('saveSettings').addEventListener('click', function() {
        const enableSilentPrinting = document.getElementById('enableSilentPrinting').checked;        
        localStorage.setItem('enableSilentPrinting', enableSilentPrinting);

        console.log('Silent Printing Enabled:', enableSilentPrinting);
        closeSettingsModal();
    });

    // Close modal button click event
    document.getElementById('closeModal').addEventListener('click', closeSettingsModal);

    // Styles for the label printing
    const labelStyles = `
        .label {
            position: relative;
            background:white;
            color: black;
            height: 32mm;
            width: 57mm;
            border: 0.5px solid #ffdfd4;
            margin: 10px;
            box-sizing: border-box;
            position: relative;
        }        
        .item {
            height: 19mm;
            overflow: hidden;
            margin: 4px;
        }
        
        .barcode {
            white-space: nowrap;
            position: absolute;
            bottom: 0;
            z-index: 3;
        }
        
        .barcode div {
            font-size: 7;
            font-family: monospace;
            margin-left: 15px;
        }
        
        .barcode img {
            width: 35mm;
            height: 4mm;
            object-fit: cover;
        }
        .price {
            position: absolute;
            bottom: 2px;
            font-family: Open Sans,Arial,sans-serif;
            font-weight: bold;
            font-size: 60px;
            right: 0;
            overflow: hidden;
            object-position: center;
            margin-right: 3px;
        }
        .deposit {
            position: absolute;
            right: 3px;
            bottom: 3px;
            font-family: math;
            font-size: 11px;
        }        
        .age {
            border: 1.2px solid black;
            background: white;
            position: relative;
            height: 25px;
            width: 25px;
            border-radius: 50%;
            display: inline-block;
            text-align: center;
            line-height: 25px;
            box-sizing:border-box;
            font-family: monospace;
            position: absolute;
            bottom: 21px;
            margin: 5px;
        }
        .age:after {
            content: "+";
            position: absolute;
            width: 11px;
            height: 11px;
            right: -5px;
            line-height: 8px;
            font-family: sans-serif;
            font-weight: bold;
            background:white;
            border-radius: 50%;
        }
        .inactive {
            height: 5px;
            width: 80px;
            background-color: #e5e5f7;
            opacity: 0.8;
            background-image: repeating-linear-gradient(45deg, #E91E63 25%, transparent 25%, transparent 75%, #E91E63 75%, #E91E63), repeating-linear-gradient(45deg, #E91E63 25%, #e5e5f7 25%, #e5e5f7 75%, #E91E63 75%, #E91E63);
            background-position: 0 0, 10px 10px;
            background-size: 20px 20px;
            position: absolute;
            bottom: 0;
            right: 0;
        }
        
    `;

    // Helper function to split price into whole and decimal parts
    function splitPrice(price) {
        const parts = parseFloat(price).toFixed(2).toString().split('.');
        const wholePart = parts[0];
        const decimalPart = parts[1];
        return { wholePart, decimalPart };
    }

    // Helper function to extract data from the Angular controller
    // reference-book/items
    function extractDataFromAngular() {
        const selectedRows = angular.element(document.querySelector(".data-rows")).controller().grid.data.filter(a => a._select);
        isEverythingActive = true;
        const extractedData = selectedRows.map(row => {
            const { wholePart, decimalPart } = splitPrice(row.priceWithVat || 0);
            // Calculate the whole unit price, (a can of soda) 1.49/0.330 = 4.51eur/l
            // const unitPrice = (row.priceWithVat && row.minQuantity) ? (row.priceWithVat / row.minQuantity).toFixed(2) + "&euro;/" + row.measurementUnitName : "";
            if (!row.isActive) isEverythingActive = false;
            return {
                name: row.name,
                barcode: row.barcode,
                code: row.code,
                priceWithVat: row.priceWithVat,
                price: { wholePart, decimalPart },
                ageLimit: row.ageLimit,
                packageCode: row.packageCode,
                isActive: row.isActive,
                discountStatus: row.discountStatus
                // unitPrice
            };
        });
        return extractedData;
    }

    function getBarcodeType(barcode) {
        if (/^\d+$/.test(barcode)) {
            return 'code128';
        } else if (barcode.length === 8) {
            return '8';
        } else if (barcode.length === 13) {
            return '13';
        } else {
            return 'code128';
        }
    }

    // if the text is in quotes, or is a word with at least 3 capital letters, make it bold
    function makeUpperCaseBold(text) {
        const regex = /("[^"]+"|[A-ZŽĄČĘĖĮŠŲŪ]{3,})/g;
    
        return text.replace(regex, '<b>$1</b>');
    }

    // Helper function to generate a label for a single row
    // TODO: This function is too long, refactor it
    function generateLabel(data) {
        const label = document.createElement('div');
        label.className = 'label';
    
        if (data.discountStatus) {
            const theBallOuter = document.createElement('div');
            theBallOuter.className = 'theBall-outer';
            const theBall = document.createElement('div');
            theBall.className = 'theBall';
            theBallOuter.appendChild(theBall);
            label.appendChild(theBallOuter);
        }
    
        const item = document.createElement('div');
        item.className = 'item';
        // item.textContent = data.name;
        item.innerHTML = makeUpperCaseBold(data.name);
    
        if (data.barcode || data.code) {
            const barcode = document.createElement('div');
            barcode.className = 'barcode';
            const barcodeText = document.createElement('div');
            barcodeText.textContent = (data.barcode || "") + ((data.code && data.barcode) ? ' (' + data.code + ')' : " " + (data.code || ""));
            const barcodeImage = document.createElement('img');
            barcodeImage.src = `https://barcodeapi.org/api/${ getBarcodeType(data.barcode || data.code)}/${data.barcode || data.code}`;
            barcode.appendChild(barcodeText);
            barcode.appendChild(barcodeImage);
            label.appendChild(barcode);
        }
        if (data.priceWithVat) {
            const price = document.createElement('div');
            price.className = 'price';
            const whole = document.createElement('span');
            whole.className = 'whole';
            whole.textContent = data.price.wholePart;
            const sup = document.createElement('sup');
            sup.textContent = data.price.decimalPart;
            price.appendChild(whole);
            price.appendChild(sup);
            label.appendChild(price);
        }
    
        if (data.packageCode?.length > 0) {
            const deposit = document.createElement('div');
            deposit.className = 'deposit';
            deposit.textContent = 'Tara +0,10€';
            label.appendChild(deposit);
        }
        if (data.ageLimit > 0) {
            const age = document.createElement('div');
            age.className = 'age';
            age.textContent = data.ageLimit;
            label.appendChild(age);
        }
        if (!data.isActive) {
            const inactive = document.createElement('div');
            inactive.className = 'inactive';
            label.appendChild(inactive);
        }

        label.appendChild(item);

        return label;
    }
    

    function addPrintButton(parentSelector = '.buttons-left') {
        const buttonsLeft = document.querySelector(parentSelector);
        if (!buttonsLeft || document.querySelector('.print')) return;
        const printDiv = document.createElement('div');
        printDiv.className = 'print';

        const button = document.createElement('button');
        button.title = 'Spausdinti';
        button.type = 'button';
        button.className = 'btn btn-sm btn-purple';

        const i = document.createElement('i');
        i.className = 'fa fa-fw fa-print';

        const span = document.createElement('span');
        span.className = 'margin-left-5 hidden-xs hidden-sm ng-hide';

        button.appendChild(i);
        button.appendChild(span);
        printDiv.appendChild(button);

        buttonsLeft.appendChild(printDiv);
    }

    // Main function to process selected rows
    function processSelectedRows() {
        const data = extractDataFromAngular();

        if (data.length === 0) {
            alert('Nepasirinkote jokių prekių');
            return;
        }
        if (!isEverythingActive && !confirm('Nevisos spausdinamos etiketės aktyvios, ar tęsti?')) {
            return;
        }

        const labels = data.map(generateLabel);

        const popup = window.open('', '_blank', 'width=700,height=700');
        popup.document.title = labels.length + ' etiketės spausdinimui';


        const style = document.createElement('style');
        style.innerHTML = labelStyles;
        popup.document.head.appendChild(style);

        labels.forEach(label => {
            popup.document.body.appendChild(label);
        });

        popup.print();
        if (localStorage.getItem('enableSilentPrinting') === 'true') {
            setTimeout(() => {
                popup.close();
            }, 500);
        }
    }

    function processEditingView() {
        var data = angular.element(document.querySelector("ng-form")).controller().model;
        if (!data.name && (!data.barcode || !data.code) && !data.priceWithVat) {
            alert('Etiketė negali būti sugeneruota, nes trūksta duomenų');
            return;
        }
        data.price = splitPrice(data.priceWithVat || 0);

        const label = generateLabel(data);
        const style = document.createElement('style');
        style.innerHTML = labelStyles;

        const popup = window.open('', '_blank', 'width=700,height=700');
        popup.document.title = 'Etiketės spausdinimas';
        popup.document.head.appendChild(style);
        popup.document.body.appendChild(label);

        popup.print();
        if (localStorage.getItem('enableSilentPrinting') === 'true') {
            setTimeout(() => {
                popup.close();
            }, 500);
        }
    }

    function waitAndAddPrintButton() {
        var interval = setInterval(function() {
            if (window.location.pathname === "/reference-book/items") {
                addPrintButton();
            }
            else if (window.location.pathname === "/reference-book/items/edit") {
                addPrintButton('.btn-ctrl');
            }
        }, 2000);
    }

    window.addEventListener('load', function() {
        console.log('The user script for label generation has been loaded.');
        waitAndAddPrintButton()
    });

    document.addEventListener('click', function(event) {
        if (event.target.closest('.buttons-left .print')) { 
            event.preventDefault();
            processSelectedRows();
        }
        else if (event.target.closest('.btn-ctrl .print')) {
            event.preventDefault();
            processEditingView();
        }
    });
})();