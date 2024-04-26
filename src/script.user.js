// ==UserScript==
// @name         Label Generator for the items in b1.lt
// @namespace    http://tampermonkey.net/
// @version      0.6.5
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
            'save': 'Save',
            'notAllItemsActive': 'Not all selected items are active. Do you want to continue?',
            'noItemsSelected': 'No items selected!',
            'noData': 'No data to print!',
            'simplifyForm': 'Simplify Form',
            'brightStyle': 'Make it bright',
            'resetStyles': 'Reset styles',
            'resetForm': 'Reset form',
            'enterPriceItemIs': 'Enter the new price for the item that is ',
            'withThePrice': ' with the price ',
            'enterName': 'Enter the name',
            'enterManufacturerName': 'Enter the manufacturer name',
            'enterPrice': 'Enter the price',
            'inactiveItem': 'The item is inactive. Do you want to continue?',
            'invalidBarcodes': 'Invalid barcodes:'
        },
        'lt': {
            'alternativeLabelFormat': 'Įgalinti alternatyvų etiketės formatą',
            'askingForDepositAndAge': 'Ar yra pasirinktų prekių, kurios turi taros kodą arba amžiaus apribojimą?',
            'aboutToCheckDepositAndAge': 'Bus atliekamas tikrinimas dėl taros kodo ir amžiaus apribojimo, tai gali užtrukti',
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
            'save': 'Išsaugoti',
            'notAllItemsActive': 'Ne visos pasirinktos prekės yra aktyvios. Ar norite tęsti?',
            'noItemsSelected': 'Nepasirinkta jokių prekių!',
            'noData': 'Nepakanka duomenų spausdinimui!',
            'simplifyForm': 'Paprasta forma',
            'brightStyle': 'Ryškus stilius',
            'resetStyles': 'Atkurti stilių',
            'resetForm': 'Atkurti formą',
            'enterPriceItemIs': 'Įveskite naują kainą prekei, kuri yra ',
            'withThePrice': '. Sena kaina buvo ',
            'enterName': 'Įveskite pavadinimą',
            'enterManufacturerName': 'Įveskite gamintojo pavadinimą',
            'enterPrice': 'Įveskite kainą',
            'inactiveItem': 'Prekė yra neaktyvi. Ar norite tęsti?',
            'invalidBarcodes': 'Neteisingi ar neegzistuojantys brūkšniniai kodai:'
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
            console.error('No navbar shortcuts found. Retrying in 1 second.');
            setTimeout(addModalbuttons, 1000);
            return;
        }
        const settingsButton = document.createElement('button');
        settingsButton.textContent = i18n('printSettings');
        settingsButton.addEventListener('click', openSettingsModal);

        const fastPrintButton = document.createElement('button');
        fastPrintButton.textContent = i18n('fastPrintButton');
        fastPrintButton.addEventListener('click', prompOnRepeatAndPrintLabels);

        const fastNewPriceButton = document.createElement('button');
        fastNewPriceButton.textContent = i18n('fastNewPriceButton');
        fastNewPriceButton.addEventListener('click', updateThePrice);
        console.log("the buttons were added to the navbar shortcuts");
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
        body {
            margin: 0;
            padding: 0;
        }
        .label {
            position: relative;
            background:white;
            color: black;
            height: 31.75mm;
            width: 57.15mm;
            border: 0.5px solid #ffdfd4;
            margin: 0px;
            box-sizing: border-box;
            overflow: hidden;
        }
        .item {
            height: 19mm;
            overflow: hidden;
            padding: 4px;
            font-family: Arial,sans-serif;
        }

        .barcode {
            white-space: nowrap;
            position: absolute;
            bottom: 0;
            z-index: 3;
        }

        .barcode div {
            font-size: 10px;
            font-family: monospace;
            margin-left: 10px;
            line-height: 1em;
        }
        .barcode div small{
            color: #888;
            font-size: 8px;
            display: block;
        }
        .barcode img {
            width: 35mm;
            height: 4mm;
            object-fit: cover;
            object-position: top;
        }

        .alternative .barcode {
            left: 50%;
            transform: translateX(-50%);
        }
        
        .alternative .price {
            display: none;
        }
        
        .alternative .barcode img {
            width: 50mm;
            height: 12mm;
        }
        .alternative .barcode div {
        margin-left: 0;
        }
        .alternative .barcode div {
            font-size: 11px;
            display: flex;
            justify-content: space-between
        }
        .alternative .barcode div small {
            color: black;
            font-size: 9px;
        }

        .price {
            position: absolute;
            bottom: 22px;
            font-size: 50px;
            right: 0;
            overflow: hidden;
            object-position: center;
            margin-right: 3px;
            line-height: 1em;
            font-family: "Book Antiqua", serif;
            padding-right: 10px;
        }
        .deposit {
            position: absolute;
            right: 2px;
            bottom: 3px;
            font-family: math;
            font-size: 15px;
            font-weight: 700;
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

    function addFormStyles(){
        var style = document.createElement('style');
        style.textContent = `
        input[name=priceWithVat], 
        input[name=name], 
        input[name=manufacturerName], 
        input[name=barcode],
        input[name=packageCode],
        input[name=ageLimit]{
            background: beige;
        }
        textarea.form-control.input-sm.ng-pristine.ng-untouched.ng-valid.ng-not-empty {
            height: 50px;
        }
        
        input[name=isActive].ace:checked + span{
            background: beige !important;
            font-weight: bold;
            color: black;
        }
        input[name=isActive].ace + span{
            background: #ff1c00 !important;
            color: white;
            padding: 1em 10em 1em 0em;
            font-weight: bold;
        }
        h5.header.blue {
            background: red;
            display: none;
        }
        .shift-up{
            top: -65px;
            position: relative;
        }
        .shift-up-twice{
            top: --132px;
            position: relative;
        }
        input[name=packageCode],
        input[name=ageLimit] {
            width: 50px;
        }
        input[name=priceWithVat] {
            width: 80px;
        }
        .simplify-button {
            margin: 0 3px;
        }
        .flex-space-between {
            display: flex;
            gap: 15px;
        }
        `;
        document.head.appendChild(style);
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
        if (confirm(i18n('askingForDepositAndAge'))) {
            window.alert(i18n('aboutToCheckDepositAndAge'));
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
            barcodeText.innerHTML = ((data.code) ? '<small>' + data.code + "</small>" : "") +  (data.barcode || "");
            const barcodeImage = document.createElement('img');
            barcodeImage.src = `https://barcodeapi.org/api/${ getBarcodeType(data.barcode || data.code)}/${data.barcode || data.code}`;
            barcode.appendChild(barcodeText);
            barcode.appendChild(barcodeImage);
            label.appendChild(barcode);
        }
        if (data.priceWithVat) {
            const price = document.createElement('div');
            price.className = 'price';
            price.textContent = parseFloat(data.priceWithVat).toFixed(2).toString();
            label.appendChild(price);
        }

        if (data.packageCode?.length > 0) {
            const deposit = document.createElement('div');
            deposit.className = 'deposit';
            deposit.textContent = 'Tara +0,10';
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


    function addPrintButton(parentSelector = '.buttons-right') {
        const buttonsLeft = document.querySelector(parentSelector);
        if (!buttonsLeft || document.querySelector('.print')) return;
        const printDiv = document.createElement('div');
        printDiv.className = 'print';

        const button = document.createElement('button');
        button.title = i18n('print');
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
        popup.document.title = labels.length + i18n('nlabelsToBePrinted');

        const style = document.createElement('style');
        style.innerHTML = labelStyles;
        popup.document.head.appendChild(style);

        labels.forEach(label => {
            popup.document.body.appendChild(label);
        });

        await new Promise(resolve => {
            const images = popup.document.querySelectorAll('.barcode img');
            let counter = 0;
            images.forEach(image => {
                image.onload = () => {
                    counter++;
                    if (counter === images.length) {
                        resolve();
                    }
                }
            });
            //default timeout
            setTimeout(resolve, 5000);
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
            alert(i18n('noItemsSelected'));
            return;
        }
        if (!isEverythingActive && !confirm(i18n('notAllItemsActive'))) {
            return;
        }

        printLabels(data);
    }

    function processEditingView() {
        var data = angular.element(document.querySelector("ng-form")).controller().model;
        if (!data.name && (!data.barcode || !data.code) && !data.priceWithVat) {
            alert(i18n('noData'));
            return;
        }
        if (!data.isActive && !confirm(i18n('inactiveItem'))) {
            return;
        }
        printLabels([data]);
    }

    //axillary function to find the form-group element by the input name
    function findFormGroupByInputName(inputName) {
        if(inputName.includes("Status")){
        var inputElement = document.querySelector('select[name="' + inputName + '"]');
        }
        else{
        var inputElement = document.querySelector('input[name="' + inputName + '"]');
        }
        // can return null if the input element is not found
        return inputElement.closest('.form-group');
    }

    function hideFormGroupByInputName(inputName) {
        var inputElement = findFormGroupByInputName(inputName);
        if (inputElement) {
            // Get the parent .form-group element and hide it
            var formGroup = inputElement.closest('.form-group');
            if (formGroup) {
                formGroup.style.display = 'none';

                // also hide the parent of .form-group element if the parent doesnt contain col-lg-12 class
                var parent = formGroup.parentElement;
                if (parent && !parent.classList.contains('col-lg-12')) {
                    parent.style.display = 'none';
                }
            }
        }
    }

    // Call the function to hide the form-group containing the input field with name="vatRate"
    function hideFields() {
        hideFormGroupByInputName('attributeName');
        hideFormGroupByInputName('vatRate');
        hideFormGroupByInputName('priceWithoutVat');
        hideFormGroupByInputName('minQuantity');
        hideFormGroupByInputName('netWeight');
        hideFormGroupByInputName('grossWeight');
        hideFormGroupByInputName('expenseCorrespondenceAccountCode');
        hideFormGroupByInputName('saleCorrespondenceAccountCode');
        hideFormGroupByInputName('purchaseCorrespondenceAccountCode');
        hideFormGroupByInputName('externalId');
        hideFormGroupByInputName('isRefundable');
        hideFormGroupByInputName('isCommentRequired');
        hideFormGroupByInputName('defaultSaleService');
        hideFormGroupByInputName('countryOfOriginName');
        hideFormGroupByInputName('intrastatShortDescription');
        hideFormGroupByInputName('intrastatCode');
        hideFormGroupByInputName('freePrice');
        hideFormGroupByInputName('priceFrom');
        hideFormGroupByInputName('priceUntil');
        hideFormGroupByInputName('minPriceWithVat');
        hideFormGroupByInputName('priceMinQuantity');
        hideFormGroupByInputName('discountStatus');
        hideFormGroupByInputName('maxDiscount');
        hideFormGroupByInputName('discountPointsStatus');
        hideFormGroupByInputName('departmentNumber');
        hideFormGroupByInputName('certificateDate');
        hideFormGroupByInputName('certificateNumber');
        hideFormGroupByInputName('validFrom');
        hideFormGroupByInputName('validUntil');
        hideFormGroupByInputName('packageQuantity');
        hideFormGroupByInputName('cost');
        hideFormGroupByInputName('stock');
    }

    function simplifyForm(){
        hideFields();
        shiftElements();
    }

    function shiftElements(){
        var priceWithVat = document.querySelector('input[name="priceWithVat"]').parentElement.parentElement;
        priceWithVat.classList.add('flex-space-between');
        priceWithVat.appendChild(document.querySelector('input[name="packageCode"]').parentElement);
        priceWithVat.appendChild(document.querySelector('input[name="ageLimit"]').parentElement);
    }

    // function that returns created html button
    function createHideFieldsButton(){
        var button = document.createElement('button');
        button.className = 'btn btn-sm btn-purple simplify-button';
        button.type = 'button';
        if (localStorage.getItem('simplifyForm') === 'true') {
            button.textContent = i18n('resetForm');
            simplifyForm();
        }
        else {
            button.textContent = i18n('simplifyForm');
        }
        //onclick event listener, we will add the logic later
        button.addEventListener('click', function() {
            if (localStorage.getItem('simplifyForm') === 'true') {
                localStorage.setItem('simplifyForm', 'false');
                location.reload();
            }
            else {
                localStorage.setItem('simplifyForm', 'true');
                button.textContent = i18n('resetForm');
                simplifyForm();
            }
        });
        return button;
    }
    
    function createStylesButton(){
        var button = document.createElement('button');
        button.className = 'btn btn-sm btn-purple simplify-button';
        button.type = 'button';
        if (localStorage.getItem('addFormStyles') === 'true') {
            button.textContent = i18n('resetStyles');
            addFormStyles();
        }
        else {
            button.textContent = i18n('brightStyle');
        }
        //onclick event listener, we will add the logic later
        button.addEventListener('click', function() {
            //based on local storage value we will change the text of the button
            if (localStorage.getItem('addFormStyles') === 'true') {
                localStorage.setItem('addFormStyles', 'false');
                location.reload();
            }
            else {
                localStorage.setItem('addFormStyles', 'true');
                button.textContent = i18n('resetStyles');
                addFormStyles();
            }
        
        });
        return button;
    }


    function waitAndAddPrintButton() {
        var interval = setInterval(function() {
            if (window.location.pathname === "/reference-book/items") {
                addPrintButton();
            }
            else if (window.location.pathname === "/reference-book/items/edit") {
                addPrintButton('.btn-ctrl');
                if (!document.querySelector('.btn-ctrl .simplify-button')) {
                    document.querySelector('.btn-ctrl').appendChild(createHideFieldsButton());
                    document.querySelector('.btn-ctrl').appendChild(createStylesButton());
                }
            }
            else if (window.location.pathname === "/warehouse/purchases/edit") {
                addPrintButton();
            }
        }, 1500);
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
        async createIem(data) {
            this.path = '/reference-book/items/create';
            this.getCookies();
            const response = await this.fetchData('POST', this.path, data);
            return response.code === 200 ? console.log(i18n('itemCreated')) : console.error(i18n('failedToCreateItem'));
        }
    }

    async function updateThePrice() {
        var invalidBarcodes = [];
        while (true) {
            var req = new Request();
            var barcode = window.prompt(i18n('enterBarcode'));
            
            if (barcode.toLowerCase() === 'stop') {
                break;
            } else if (!barcode) {
                console.error(i18n('missingBarcode'));
                continue;
            }
            barcode = lettersToNumbers(barcode);
            
            if (!req.isItDigits(barcode)) {
                console.error(i18n('invalidBarcode'), barcode);
                continue;
            }
            var item = await req.searchItem(barcode);
            if (!item.name) {
                alert(i18n('itemNotFound') + ' ' + barcode);
                continue;
            }

            
            //print out the name and the price of the item
            console.log('Item:', item.name, item.priceWithVat);
            var newPrice = window.prompt(i18n("enterPriceItemIs") + (item.ageLimit > 0 ? "[18+] " : "") + (item.packageCode > 0 ? "[TARA] " : "") + item.name + ', sena kaina: ' + item.priceWithVat + ' €');
            // ensuring the dot notation for the decimal part
            if (!newPrice) continue;
            newPrice = parseFloat(newPrice.replace(',', '.'));
            console.log('New price:', newPrice);
            if (isNaN(newPrice) || newPrice > 1000 || newPrice < 0) {
                alert(i18n('invalidPrice'));
                continue;
            }
            await req.saveItem(item.id, { priceWithVat: newPrice, priceWithoutVat: newPrice / (1 + item.vatRate/100), isActive: true });
        }
        console.log('Invalid barcodes:\n' + invalidBarcodes.join('\n'));
    }
    function lettersToNumbers(barcode) {
        return barcode.replace(/ą/g, '1').replace(/č/g, '2').replace(/ę/g, '3').replace(/ė/g, '4').replace(/į/g, '5').replace(/š/g, '6').replace(/ų/g, '7').replace(/ū/g, '8').replace(/ž/g, '9');
    }

    async function prompOnRepeatAndPrintLabels() {
        var req = new Request();
        var barcodes = [];
        var items = [];
        var invalidBarcodes = [];
    
        // Prompt loop to collect barcodes
        while (true) {
            if (barcodes.length > 0) {
                var barcode = window.prompt(i18n('enterBarcode') + ' / ' + barcodes.length);
            } else {
                var barcode = window.prompt(i18n('enterBarcode'));
            }

            if (barcode === 'stop') {
                break;
            } else if (!req.isItDigits(barcode)) {
                console.error(i18n('incorrectBarcode'), barcode);
                // if barcode contains letters of ąčęėįšųūž, the layout is set to Lithuanian keyboard, then we will convert these letters to numbers
                // and add them to the barcodes array
                var barcode = barcode.replace(/ą/g, '1').replace(/č/g, '2').replace(/ę/g, '3').replace(/ė/g, '4').replace(/į/g, '5').replace(/š/g, '6').replace(/ų/g, '7').replace(/ū/g, '8').replace(/ž/g, '9');
                if (!req.isItDigits(barcode)) {
                    console.error(i18n('invalidBarcode'), barcode);
                    continue;
                }
            } else if (!barcode) {
                console.error(i18n('missingBarcode'));
                continue;
            }

            barcodes.push(barcode);
        }
        
        for (let barcode of barcodes) {
            var item = await req.searchItem(barcode);
            if (item) {
                items.push(item);
            }
            else {
                invalidBarcodes.push(barcode);
            }

            await new Promise(resolve => setTimeout(resolve, 100)); // 0.1 second delay
        }
        if (invalidBarcodes.length > 0) {
            console.log(i18n('invalidBarcodes') + '\n' + invalidBarcodes.join('\n'));
            alert(i18n('invalidBarcodes') + '\n' + invalidBarcodes.join('\n'));
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
        if (event.target.closest('.buttons-right .print')) {
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