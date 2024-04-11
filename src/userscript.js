// ==UserScript==
// @name         Label Generator for the items in b1.lt
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Generate labels for selected rows of the items in the reference book.
// @author       Martynas Miliauskas
// @match        https://www.b1.lt/*
// @downloadURL  https://raw.githubusercontent.com/martynas2200/b1-labels/master/src/userscript.js
// @updateURL    https://raw.githubusercontent.com/martynas2200/b1-labels/master/src/userscript.js
// @grant        unsafeWindow
// @license      GNU GPLv3
// ==/UserScript==

(function() {
    'use strict';

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
        const parts = price.toFixed(2).toString().split('.');
        const wholePart = parts[0];
        const decimalPart = parts[1];
        return { wholePart, decimalPart };
    }

    // Helper function to extract data from the Angular controller
    function extractDataFromAngular() {
        const selectedRows = angular.element(document.querySelector(".data-rows")).controller().grid.data.filter(a => a._select);
        const extractedData = selectedRows.map(row => {
            const { wholePart, decimalPart } = splitPrice(row.priceWithVat || 0);
            // Calculate the whole unit price, (a can of soda) 1.49/0.330 = 4.51eur/l
            // const unitPrice = (row.priceWithVat && row.minQuantity) ? (row.priceWithVat / row.minQuantity).toFixed(2) + "&euro;/" + row.measurementUnitName : "";
            return {
                title: row.name,
                barcode: row.barcode,
                code: row.code,
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
        item.textContent = data.title;
    
        if (data.barcode || data.code) {
            const barcode = document.createElement('div');
            barcode.className = 'barcode';
            const barcodeText = document.createElement('div');
            barcodeText.textContent = (data.barcode || "") + ((data.code && data.barcode) ? ' (' + data.code + ')' : " " + (data.code || ""));
            const barcodeImage = document.createElement('img');
            barcodeImage.src = `https://barcode.orcascan.com/?type=code128&data=${data.barcode || data.code}`;
            barcode.appendChild(barcodeText);
            barcode.appendChild(barcodeImage);
            label.appendChild(barcode);
        }
        
        const price = document.createElement('div');
        price.className = 'price';
        const whole = document.createElement('span');
        whole.className = 'whole';
        whole.textContent = data.price.wholePart;
        const sup = document.createElement('sup');
        sup.textContent = data.price.decimalPart;
        price.appendChild(whole);
        price.appendChild(sup);
    
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
        label.appendChild(price);

        return label;
    }
    

    function addPrintButton() {
        const buttonsLeft = document.querySelector('.buttons-left');
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
    }
    function waitAndAddPrintButton() {
        var interval = setInterval(function() {
            if (window.location.pathname === "/reference-book/items") {
                addPrintButton();
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
    });
})();