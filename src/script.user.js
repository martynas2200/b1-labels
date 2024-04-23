// ==UserScript==
// @name         Label Generator for the items in b1.lt
// @namespace    http://tampermonkey.net/
// @version      0.2
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
    const LANGUAGES = {
        'en': {
            'alternativeLabelFormat': 'Enable alternative label format',
            'askingForDepositAndAge': 'Are there selected items with deposit code or age limit?',
            'aboutToCheckDepositAndAge': 'Deposit code and age limit will be checked, this may take a while',
            'close': 'Close',
            'deposit': 'Deposit',
            'enterBarcode': 'Enter the barcode or type stop:',
            'failedToUpdateItem': 'Failed to update the item!',
            'fastNewPriceButton': 'Quick Price Change',
            'fastPrintButton': 'Quick Print',
            'invalidBarcode': 'Invalid barcode',
            'itemNotFound': 'Item not found!',
            'itemUpdated': 'Item updated successfully!',
            'missingBarcode': 'Barcode is required!',
            'nlabelsToBePrinted': ' labels to be printed',
            'newPrice': 'Enter the new price',
            'oldPrice': 'Old price',
            'print': 'Print',
            'printSettings': 'Print Settings',
            'save': 'Save'
        },
        'lt': {
            'alternativeLabelFormat': 'Įgalinti alternatyvų etiketės formatą',
            'askingForDepositAndAge': 'Ar yra pasirinktų prekių, kurios turi taros kodą arba amžiaus apribojimą?',
            'aboutToCheckDepositAndAge': 'Bus atliekamas tikrinimas dėl taros kodo ir amžiaus apribojimo, tai gali užtrukti',
            // 'Nevisos spausdinamos etiketės aktyvios, ar tęsti?'
            // 'Etiketė negali būti sugeneruota, nes trūksta duomenų'
            // 'Ši prekė neaktyvi, ar tęsti?'
            // 'inactiv
            'close': 'Uždaryti',
            'deposit': 'Tara',
            'enterBarcode': 'Įveskite brūkšninį kodą arba rašykite stop:',
            'failedToUpdateItem': 'Nepavyko atnaujinti prekės!',
            'fastNewPriceButton': 'Greitas kainos keitimas',
            'fastPrintButton': 'Greitas spausdinimas',
            'invalidBarcode': 'Neteisingas brūkšninis kodas',
            'itemNotFound': 'Prekė nerasta!',
            'itemUpdated': 'Prekė sėkmingai atnaujinta!',
            'missingBarcode': 'Brūkšninis kodas yra privalomas!',
            'nlabelsToBePrinted': ' etiketės bus spausdinamos',
            'newPrice': 'Įveskite naują kainą',
            'oldPrice': 'Senas kainos',
            'print': 'Spausdinti',
            'printSettings': 'Spausdinimo nustatymai',
            'save': 'Išsaugoti'
        }
    };
    
    const userLanguage = navigator.language.split('-')[0]; 
    const currentLanguage = LANGUAGES[userLanguage] ? userLanguage : 'en';
    const i18n = (key) => LANGUAGES[currentLanguage][key] || LANGUAGES['en'][key] || key;

    // Global variable indicating whether all selected items are active in POS system
    var isEverythingActive = true;

    function addModalbuttons() {
        const navbarShortcuts = document.querySelector('.breadcrumbs');
        if (!navbarShortcuts) {
            console.error('Navbar shortcuts not found!');
            setTimeout(addModalbuttons, 1000);
            return;
        }
        const settingsButton = document.createElement('button');
        settingsButton.textContent = i18n('printSettings');
        settingsButton.addEventListener('click', openSettingsModal);

        const fastPrintButton = document.createElement('button');
        fastPrintButton.textContent = i18n('fastPrintButton');
        fastPrintButton.addEventListener('click', prompOnRepeatAndPrintLabel);

        const fastNewPriceButton = document.createElement('button');
        fastNewPriceButton.textContent = i18n('fastNewPriceButton');
        fastNewPriceButton.addEventListener('click', updateThePrice);
        console.log("the buttons are added to the navbar shortcuts");
        navbarShortcuts.appendChild(settingsButton);
        navbarShortcuts.appendChild(fastPrintButton);
        navbarShortcuts.appendChild(fastNewPriceButton);

    }
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
            <h2>${i18n('printSettings')}</h2>
            <label>
                <input type="checkbox" id="alternativeLabelFormat"> ${i18n('alternativeLabelFormat')}
            </label>
            <br>
            <button id="saveSettings">${i18n('save')}</button>
            <button id="closeModal">${i18n('close')}</button>
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
            if (!row.isActive) isEverythingActive = false;
            return {
                name: row.name,
                barcode: row.barcode,
                code: row.code,
                priceWithVat: row.priceWithVat,
                ageLimit: row.ageLimit,
                packageCode: row.packageCode,
                isActive: row.isActive,
                discountStatus: row.discountStatus
            };
        });
        return extractedData;
    }
    async function extractDataFromAngularPurchaseView() {
        const selectedRows = angular.element(document.querySelector(".data-rows")).controller().data.filter(a => a._select);
        const extractedData = [];
        if (confirm('Ar yra pasirinktų prekių, kurios turi taros kodą arba amžiaus apribojimą?')) {
            window.alert('Bus atliekamas tikrinimas dėl taros kodo ir amžiaus apribojimo, tai gali užtrukti');
            isEverythingActive = true;
            // get only barcodes
            const barcodes = selectedRows.map(row => row.itemBarcode);
            const req = new Request();
            for (let barcode of barcodes) {
                const item = req.searchItem(barcode);
                if (item) {
                    extractedData.push({
                        name: item.name,
                        barcode: item.barcode,
                        code: item.code,
                        priceWithVat: item.priceWithVat,
                        ageLimit: item.ageLimit,
                        packageCode: item.packageCode,
                        isActive: item.isActive,
                        discountStatus: item.discountStatus
                    });
                    if (!item.isActive) isEverythingActive = false;
                }
                await new Promise(resolve => setTimeout(resolve, 100)); // 0.1 second delay
            }
        }
        else {
            isEverythingActive = true;
            extractedData = selectedRows.map(row => {
                if (!row.isActive) isEverythingActive = false;
                return {
                    name: row.itemName,
                    barcode: row.itemBarcode,
                    code: row.itemCode,
                    priceWithVat: row.itemPriceWithVat,
                    // ageLimit: row.ageLimit,
                    // packageCode: row.packageCode,
                    isActive: false,
                    discountStatus: false
                };
            });
        }
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
        if (localStorage.getItem('alternativeLabelFormat') === 'true') {
            label.classList.add('alternative');
        }

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
            const { wholePart, decimalPart } = splitPrice(data.priceWithVat);
            const price = document.createElement('div');
            price.className = 'price';
            const whole = document.createElement('span');
            whole.className = 'whole';
            whole.textContent = wholePart;
            const sup = document.createElement('sup');
            sup.textContent = decimalPart;
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

    async function printLabels(data) {
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

        return new Promise(resolve => {
            popup.addEventListener('afterprint', function() {
                popup.close();
                resolve();
            });
        });
    }
    
    function processSelectedRows() {
        const data = window.location.pathname === "/warehouse/purchases/edit" ? extractDataFromAngularPurchaseView() : extractDataFromAngular();

        if (data.length === 0) {
            alert('Nepasirinkote jokių prekių');
            return;
        }
        if (!isEverythingActive && !confirm('Nevisos spausdinamos etiketės aktyvios, ar tęsti?')) {
            return;
        }

        printLabels(data);
    }

    function processEditingView() {
        var data = angular.element(document.querySelector("ng-form")).controller().model;
        if (!data.name && (!data.barcode || !data.code) && !data.priceWithVat) {
            alert('Etiketė negali būti sugeneruota, nes trūksta duomenų');
            return;
        }
        if (!data.isActive && !confirm('Ši prekė neaktyvi, ar tęsti?')) {
            return;
        }
        printLabels([data]);
    }

    function waitAndAddPrintButton() {
        var interval = setInterval(function() {
            if (window.location.pathname === "/reference-book/items") {
                addPrintButton();
            }
            else if (window.location.pathname === "/reference-book/items/edit") {
                addPrintButton('.btn-ctrl');
            }
            else if (window.location.pathname === "/warehouse/purchases/edit") {
                addPrintButton();
            }
        }, 2000);
    }

    class Request {
        constructor() {
            this.baseUrl = 'https://www.b1.lt';
            this.path = '/reference-book/items/search';
            this.csrfToken = document.querySelector('meta[name="csrf-token"]').content;
            this.headers = {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-GB,en;q=0.9,lt-LT;q=0.8,lt;q=0.7,en-US;q=0.6',
                'content-type': 'application/json;charset=UTF-8',
                'origin': this.baseUrl,
                'referer': `${this.baseUrl}/reference-book/items`,
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-requested-with': 'XMLHttpRequest',
                'x-csrf-token': this.csrfToken
            };
        }

        async fetchData(method, path, body = null) {
            try {
              const response = await fetch(`${this.baseUrl}${path}`, {
                method: method,
                headers: this.headers,
                body: body ? JSON.stringify(body) : null
              });

              if (response.ok) {
                const data = await response.json();
                return data;
              } else {
                console.error('Request failed with status:', response.status);
              }
            } catch (error) {
              console.error('Error:', error);
            }
          }

        getCookies() {
            const cookies = document.cookie.split(';').map(cookie => cookie.trim());
            cookies.forEach(cookie => {
                const [name, value] = cookie.split('=');
                if (['_fbp', 'YII_CSRF_TOKEN', 'b1-device_id', 'b1-session_id', 'isStudentUser-v1', 'b1-wss_srv', '_ga', 'b1-ref_url', '_ga_F9V3KM1JRX'].includes(name.trim())) {
                    this.headers.cookie = this.headers.cookie ? `${this.headers.cookie}; ${name}=${value}` : `${name}=${value}`;
                }
            });
        }

        isItDigits(barcode) {
            return /^\d+$/.test(barcode);
        }

        async searchItem(barcode) {
            if (!this.isItDigits(barcode)) {
                console.error('Invalid barcode:', barcode);
                return { data: [] };
            }
            // Prapare the request
            this.path = '/reference-book/items/search';
            this.getCookies();
            const body = {
                pageSize: 20,
                filters: {
                groupOp: 'AND',
                rules:
                    { barcode: { data: barcode, field: 'barcode', op: 'eq' } }
                },
                allSelected: false,
                asString: `[Barkodas:${ barcode }]`,
                page: 1
            };
            //operator: cn or eq


            const data = await this.fetchData('POST', this.path, body);
            return data.data[0];
        }
        async saveItem(id, data) {
            // Check if the id is provided and it consists of digits only
            if (!this.isItDigits(id)) {
                console.error('Invalid ID for saving:', id);
                return;
            }

            // Prepare the request
            this.path = `/reference-book/items/update?id=${id}`;
            this.headers.referer = `${this.baseUrl}/reference-book/items/edit?id=${id}`;

            this.getCookies();

            const response = await this.fetchData('POST', this.path, data);

            return response.code === 200 ? console.log(i18n('itemUpdated')) : console.error(i18n('failedToUpdateItem'));
        }
    }


    async function updateThePrice() {
        while (true) {
            var req = new Request();
            var barcode = window.prompt(i18n('enterBarcode'));
            if (barcode == 'stop') {
                break;
            } else if (!barcode) {
              console.error(i18n('missingBarcode'));
              continue;
            }
            var item = await req.searchItem(barcode);
            if (!item) {
              console.error(i18n('itemNotFound'));
                continue;
            }
            
            //print out the name and the price of the item
            console.log('Item:', item.name);
            console.log('Sena:', item.priceWithVat);
            var newPrice = window.prompt('Įveskite naują kainą. Prekė  ' + (item.ageLimit > 0 ? "[18+] " : "") + (item.packageCode > 0 ? "[TARA] " : "") + item.name + ', sena kaina: ' + item.priceWithVat + ' €');
            // ensuring the dot notation for the decimal part
            if (!newPrice) continue;
            newPrice = parseFloat(newPrice.replace(',', '.'));
            console.log('Nauja:', newPrice);
            await req.saveItem(item.id, { priceWithVat: newPrice, priceWithoutVat: newPrice / (1 + item.vatRate/100), isActive: true });
        }
    }
    async function prompOnRepeatAndPrintLabel() {
        var req = new Request();
        var barcodes = [];
        var items = [];
    
        // Prompt loop to collect barcodes
        while (true) {
            var barcode = window.prompt(i18n('enterBarcode'));
            if (barcode === 'stop') {
                break;
            } else if (!barcode || !req.isItDigits(barcode)) {
                console.error(i18n('incorrectBarcode'), barcode);
                continue;
            }
            barcodes.push(barcode);
        }
    
        for (let barcode of barcodes) {
            var item = await req.searchItem(barcode);
            if (item) {
                items.push(item);
            }
            await new Promise(resolve => setTimeout(resolve, 100)); // 0.1 second delay
        }
        if (items.length > 0) {
            await printLabels(items);
        }
    }
    
    window.addEventListener('load', function() {
        waitAndAddPrintButton();
        addModalbuttons();
        document.getElementById('alternativeLabelFormat').checked = (localStorage.getItem('alternativeLabelFormat') === 'true');
        console.log('The user script for label generation has been loaded.');
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


    // Save button click event
    document.getElementById('saveSettings').addEventListener('click', function() {
        const alternativeLabelFormat = document.getElementById('alternativeLabelFormat').checked;
        localStorage.setItem('alternativeLabelFormat', alternativeLabelFormat);
        closeSettingsModal();
    });

    // Close modal button click event
    document.getElementById('closeModal').addEventListener('click', closeSettingsModal);



})();