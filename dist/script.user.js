
// ==UserScript==
// @name         Label Generator for the items in b1.lt
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  Generate labels for the selected items on the b1.lt website
// @author       Martynas Miliauskas
// @match        https://www.b1.lt/*
// @downloadURL  https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/script.user.js
// @updateURL    https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/script.user.js
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        unsafeWindow
// @license      GNU GPLv3
// ==/UserScript==

(function () {
    'use strict';

    function lettersToNumbers(barcode) {
        return barcode.replace(/ą/g, '1')
            .replace(/č/g, '2')
            .replace(/ę/g, '3')
            .replace(/ė/g, '4')
            .replace(/į/g, '5')
            .replace(/š/g, '6')
            .replace(/ų/g, '7')
            .replace(/ū/g, '8')
            .replace(/ž/g, '9');
    }
    const LANGUAGES = {
        en: {
            alternativeLabelFormat: 'Enable alternative label format',
            askingForPackageCode: 'Are there any selected items that have a package code?',
            aboutToCheckPackageCode: 'A check for the package codes will be performed, this may take a while',
            close: 'Close',
            deposit: 'Deposit',
            enterBarcode: 'Enter the barcode',
            invalidBarcode: 'Invalid barcode',
            itemNotFound: 'Item not found!',
            itemUpdated: 'Item updated successfully!',
            missingBarcode: 'Barcode is required!',
            nlabelsToBePrinted: ' labels to be printed',
            print: 'Print',
            save: 'Save',
            notAllItemsActive: 'Not all selected items are active. Do you want to continue?',
            noItemsSelected: 'No items selected!',
            noData: 'No data to print!',
            simplifyForm: 'Simplify Form',
            resetForm: 'Reset form',
            inactiveItem: 'The item is inactive. Do you want to continue?',
            apiKeyMissing: 'API Key is missing!',
            labelsAndPrices: 'Labels and Prices',
            fullBarcode: 'Full Barcode',
            searchByBarcode: 'Search by Barcode',
            searchByName: 'Search by Name',
            enterName: 'Enter Name',
            search: 'Search',
            sayOutLoud: 'Say out loud',
            packagedGoodsWillBeScanned: 'Packaged goods will be scanned',
            kiloPrice: 'Kilogram Price',
            departmentNumber: 'Department',
            packageCode: 'Package',
            searchSuccessful: 'Search successful',
            itemsFound: 'Items found',
            clickToAdd: 'Click on the item to add it to the print list',
            itemAdded: 'Item added',
            noItemsFound: 'No items found',
            done: 'Done',
            packageQuantity: 'Package Quantity',
            weight: 'Weight',
            cleanAll: 'Clean All',
            weightedItem: 'Weighted item',
            login: 'Login',
            autoLogin: 'Auto Login',
            showLoginOptions: 'Other ways to login'
        },
        lt: {
            alternativeLabelFormat: 'Etiketėje tik brūkšninis kodas',
            askingForPackageCode: 'Ar yra pasirinktų prekių, kurios turi pakuotės kodą?',
            aboutToCheckPackageCode: 'Bus atliekamas pakuotės kodų tikrinimas, tai gali užtrukti',
            close: 'Uždaryti',
            deposit: 'Tara',
            enterBarcode: 'Įveskite brūkšninį kodą',
            invalidBarcode: 'Neteisingas brūkšninis kodas',
            itemNotFound: 'Prekė nerasta!',
            itemUpdated: 'Prekė sėkmingai atnaujinta!',
            missingBarcode: 'Brūkšninis kodas yra privalomas!',
            nlabelsToBePrinted: ' etiketės bus spausdinamos',
            print: 'Spausdinti',
            save: 'Išsaugoti',
            notAllItemsActive: 'Ne visos pasirinktos prekės yra aktyvios. Ar norite tęsti?',
            noItemsSelected: 'Nepasirinkta jokių prekių!',
            noData: 'Nepakanka duomenų spausdinimui!',
            simplifyForm: 'Supaprastinti formą',
            resetForm: 'Atkurti formą',
            inactiveItem: 'Prekė yra neaktyvi. Ar norite tęsti?',
            apiKeyMissing: 'Trūksta API rakto!',
            labelsAndPrices: 'Etiketės ir kainos',
            fullBarcode: 'Pilnas brūkšninis kodas',
            searchByBarcode: 'Ieškoti pagal brūkšninį kodą',
            searchByName: 'Ieškoti pagal pavadinimą',
            enterName: 'Įveskite prekės pavadinimą',
            search: 'Ieškoti',
            sayOutLoud: 'Sakyti kainas balsu',
            packagedGoodsWillBeScanned: 'Bus skenuojamos fasuotos/sveriamos prekės',
            kiloPrice: 'Kilogramo kaina',
            departmentNumber: 'S',
            packageCode: 'Pakuotė',
            searchSuccessful: 'Paieška sėkminga',
            itemsFound: ' rasta',
            clickToAdd: 'Paspauskite ant prekės, kad ją pridėtumėte į spausdinimo sąrašą',
            itemAdded: 'Prekė pridėta',
            noItemsFound: 'Nieko nerasta',
            done: 'Atlikta',
            packageQuantity: 'Pakuotės kiekis',
            weight: 'Svoris',
            cleanAll: 'Išvalyti',
            weightedItem: 'Sveriama prekė',
            login: 'Prisijungimas darbo vietoje',
            autoLogin: 'Prisijungti automatiškai',
            showLoginOptions: 'Kiti prisijungimo būdai'
        }
    };
    let userLanguage = navigator.language.split('-')[0];
    const currentUrl = window.location.pathname;
    const languagePattern = /\/(en|ru)\//;
    if (languagePattern.test(currentUrl)) {
        userLanguage = 'en';
    }
    const currentLanguage = LANGUAGES[userLanguage] != null ? userLanguage : 'en';
    const i18n = (key) => LANGUAGES[currentLanguage][key] ?? LANGUAGES.en[key] ?? key;

    class UserSession {
        interfaceInUse;
        isLoggedIn;
        admin;
        user;
        constructor() {
            this.interfaceInUse = false;
            this.isLoggedIn = false;
            this.admin = false;
            this.user = null;
            this.checkLoginStatus();
        }
        checkLoginStatus() {
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            if (dropdownToggle === null) {
                this.isLoggedIn = false;
                console.error('Dropdown toggle not found');
                return false;
            }
            const controller = angular.element(dropdownToggle).controller();
            if (controller.user.name != null) {
                this.user = controller.user;
                this.isLoggedIn = true;
                this.admin = (this.user != null) ? this.user.typeId <= 3 : false;
            }
            else {
                this.isLoggedIn = false;
            }
            return this.isLoggedIn;
        }
        addContainer() {
            const h5Elements = document.querySelectorAll('h5');
            h5Elements.forEach(element => { element.remove(); });
            const formElement = document.querySelector('form');
            const html = `
      <h5 class="header blue">${i18n('login')}</h5>
      <div class="form-group text-center">
      <button class="btn btn-success-2 btn-block " type="button" id="auto-login"><i class="fa fa-sign-in"></i>${i18n('autoLogin')}</button>
      <button class="btn-primary btn btn-block margin-top-8" type="button" id="show-login-options">${i18n('showLoginOptions')}</button>
      </div>`;
            if (formElement !== null) {
                formElement.insertAdjacentHTML('beforebegin', html);
                formElement.style.display = 'none';
                return true;
            }
            else {
                console.error('Form not found!');
                return false;
            }
        }
        addLoginOptions() {
            if (!this.addContainer()) {
                return false;
            }
            const optionsButton = document.querySelector('#show-login-options');
            const autoLoginButton = document.querySelector('#auto-login');
            const form = document.querySelector('form');
            if ((optionsButton === null) || (autoLoginButton === null) || (form === null)) {
                return false;
            }
            optionsButton.addEventListener('click', function () {
                form.style.display = 'block';
                optionsButton.style.display = 'none';
            });
            autoLoginButton.addEventListener('click', () => {
                void this.autoLogin();
            });
            return true;
        }
        async autoLogin() {
            const usernameInput = document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');
            if ((usernameInput === null) || (passwordInput === null)) {
                alert('Username or password input not found');
                return false;
            }
            const username = await GM.getValue('username', '');
            const password = await GM.getValue('password', '');
            if (username === '' || password === '') {
                alert('Login details not found');
                if (usernameInput.value === 'x' && passwordInput.value === 'x') {
                    void this.saveLoginDetails();
                }
                return false;
            }
            usernameInput.value = username;
            passwordInput.value = password;
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            const form = document.querySelector('form');
            if (form === null) {
                alert('Form not found');
                return false;
            }
            let key = form.getAttribute('ng-submit');
            if (key === null) {
                alert('Recaptcha key not found');
                return false;
            }
            const match = key.match(/"([^"]+)"/);
            if (match === null) {
                alert('Recaptcha key not found');
                return false;
            }
            key = match[1];
            angular.element(form).controller().signIn(key);
            return true;
        }
        async saveLoginDetails() {
            if (window.confirm('Do you want to save these login details?')) {
                const username = window.prompt('Enter your username');
                const password = window.prompt('Enter your password');
                if (username != null && password != null) {
                    await GM.setValue('username', username);
                    await GM.setValue('password', password);
                    alert('Login details saved');
                }
            }
            if (!window.confirm('Do you want to save API key?')) {
                return;
            }
            const apiKey = window.prompt('Enter your API key');
            if (apiKey === null) {
                return;
            }
            await GM.setValue('api-key', apiKey);
            alert('API key saved');
        }
    }

    class Request {
        items = {};
        baseUrl = 'https://www.b1.lt';
        path = '/reference-book/items/search';
        csrfToken;
        headers;
        constructor() {
            const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
            this.csrfToken = csrfTokenElement != null ? csrfTokenElement.content : '';
            this.headers = {
                accept: 'application/json, text/plain, */*',
                'accept-language': 'en-GB,en;q=0.9,lt-LT;q=0.8,lt;q=0.7,en-US;q=0.6',
                'content-type': 'application/json;charset=UTF-8',
                origin: this.baseUrl,
                referer: `${this.baseUrl}/reference-book/items`,
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-requested-with': 'XMLHttpRequest',
                'x-csrf-token': this.csrfToken,
                cookie: ''
            };
        }
        async fetchData(method, path, body = {}) {
            if (this.csrfToken === '') {
                console.error('CSRF token is missing');
                return;
            }
            this.getCookies();
            try {
                const response = await fetch(`${this.baseUrl}${path}`, {
                    method,
                    headers: this.headers,
                    body: JSON.stringify(body)
                });
                if (response.ok) {
                    const data = await response.json();
                    return data;
                }
                else {
                    console.error('Request failed with status:', response.status);
                }
            }
            catch (error) {
                console.error('Error:', error);
            }
        }
        getCookies() {
            const cookies = document.cookie.split(';').map(cookie => cookie.trim());
            cookies.forEach(cookie => {
                const [name, value] = cookie.split('=');
                if (['_fbp', 'YII_CSRF_TOKEN', 'b1-device_id', 'b1-session_id', 'b1-use-cookies', 'b1-wss_srv', '_ga', 'b1-ref_url', '_ga_F9V3KM1JRX'].includes(name.trim())) {
                    this.headers.cookie = (this.headers.cookie.length > 0) ? `${this.headers.cookie}; ${name}=${value}` : `${name}=${value}`;
                }
            });
        }
        isItDigits(barcode) {
            return /^\d+$/.test(barcode);
        }
        async getItem(barcode) {
            if (!this.isItDigits(barcode)) {
                return [];
            }
            if (Object.keys(this.items).includes(barcode)) {
                return this.items[barcode];
            }
            const body = {
                pageSize: 20,
                filters: {
                    groupOp: 'AND',
                    rules: { barcode: { data: barcode, field: 'barcode', op: 'eq' } }
                },
                allSelected: false,
                asString: '',
                page: 1
            };
            const data = await this.fetchData('POST', this.path, body);
            this.items[barcode] = data.data[0];
            return data.data[0];
        }
        async getItemsByName(name) {
            if (name.length < 3) {
                return [];
            }
            const body = {
                pageSize: 20,
                filters: {
                    groupOp: 'AND',
                    rules: {
                        name: { data: name, field: 'name', op: 'cn' },
                        isActive: { data: true, field: 'isActive', op: 'eq' }
                    }
                },
                allSelected: false,
                asString: '',
                page: 1
            };
            const data = await this.fetchData('POST', this.path, body);
            data.data.forEach((item) => {
                if (item.barcode != null) {
                    this.items[item.barcode] = item;
                }
            });
            return data.data;
        }
    }

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
    font-size: 16px;
    font-weight: 700;
    z-index: 10;
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

    class LabelGenerator {
        items = [];
        allItemsActive = true;
        alternativeLabelFormat;
        constructor(data = undefined, alternativeLabelFormat = false) {
            this.alternativeLabelFormat = alternativeLabelFormat;
            if (data == null) ;
            else if (data instanceof Promise) {
                void data.then(data => {
                    this.items = data;
                    this.print();
                });
            }
            else {
                this.items = data;
                this.print();
            }
        }
        print() {
            this.items = this.items.filter(item => item.isActive == true && item.barcode != null);
            if (!this.isAllItemsActive() && !confirm(i18n('notAllItemsActive'))) {
                return;
            }
            if (this.items.length > 0) {
                void this.printLabelsUsingBrowser(this.items);
            }
            else {
                alert(i18n('noData'));
            }
        }
        isAllItemsActive() {
            return this.items.every(item => item.isActive);
        }
        getBarcodeType(barcode) {
            if (barcode.length === 8) {
                return '8';
            }
            else if (barcode.length === 13) {
                return '13';
            }
            else {
                return 'code128';
            }
        }
        makeUpperCaseBold(text) {
            const regex = /("[^"]+"|[A-ZŽĄČĘĖĮŠŲŪ]{3,})/g;
            return text.replace(regex, '<b>$1</b>');
        }
        generateLabel(data) {
            const label = document.createElement('div');
            label.className = 'label';
            if (this.alternativeLabelFormat) {
                label.classList.add('alternative');
            }
            const item = document.createElement('div');
            item.className = 'item';
            item.innerHTML = this.makeUpperCaseBold(data.name);
            if ((data.barcode != null)) {
                const barcode = document.createElement('div');
                barcode.className = 'barcode';
                const barcodeText = document.createElement('div');
                barcodeText.innerHTML = ((data.code != null) ? '<small>' + data.code + '</small>' : '') +
                    (data.departmentNumber != null ? 'S' + data.departmentNumber + ' ' : '') + (data.barcode);
                const barcodeImage = document.createElement('img');
                barcodeImage.src = `https://barcodeapi.org/api/${this.getBarcodeType(data.barcode)}/${data.barcode}`;
                barcode.appendChild(barcodeText);
                barcode.appendChild(barcodeImage);
                label.appendChild(barcode);
            }
            if (data.priceWithVat !== 0) {
                const price = document.createElement('div');
                price.className = 'price';
                if (typeof data.priceWithVat === 'number') {
                    price.textContent = data.priceWithVat.toFixed(2);
                }
                else {
                    price.textContent = parseFloat(data.priceWithVat).toFixed(2).toString();
                }
                label.appendChild(price);
            }
            if (data.packageCode != null) {
                const deposit = document.createElement('div');
                deposit.className = 'deposit';
                deposit.textContent = 'Tara +0,10';
                label.appendChild(deposit);
            }
            else if (data.measurementUnitName === 'kg') {
                const deposit = document.createElement('div');
                deposit.className = 'deposit';
                deposit.textContent = '/ 1 ' + data.measurementUnitName;
                label.appendChild(deposit);
            }
            if (data.isActive === false) {
                const inactive = document.createElement('div');
                inactive.className = 'inactive';
                label.appendChild(inactive);
            }
            label.appendChild(item);
            return label;
        }
        async printLabelsUsingBrowser(data) {
            const labels = data.map(item => this.generateLabel(item));
            const popup = window.open('', '_blank', 'width=700,height=700');
            if (popup == null) {
                alert('Please allow popups for this site');
                return;
            }
            popup.document.title = `${labels.length} ${i18n('nlabelsToBePrinted')}`;
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
                    };
                });
                setTimeout(resolve, 5000);
            });
            popup.print();
            popup.addEventListener('afterprint', () => {
                popup.close();
            });
        }
    }

    class LabelerInterface {
        req;
        items;
        active;
        settings;
        searchResultsElement = null;
        nameInput = null;
        itemList = null;
        apiKey = null;
        constructor() {
            this.req = new Request();
            this.items = [];
            this.active = false;
            this.settings = {
                alternativeLabelFormat: false,
                sayOutLoud: true,
                packagedGoods: false
            };
            void this.checkApiKey();
        }
        async checkApiKey() {
            this.apiKey = await GM.getValue('api-key', null);
            if (this.apiKey != null && this.apiKey.length < 20) {
                this.apiKey = null;
            }
        }
        isActive() {
            this.active = (document.querySelector('.look-up-container') !== null);
            return this.active;
        }
        init() {
            if (this.isActive()) {
                return true;
            }
            const mainPage = document.querySelector('.main-container');
            const navbarShortcuts = document.querySelector('.navbar-shortcuts');
            const footer = document.querySelector('.footer');
            if ((mainPage == null) || (navbarShortcuts == null) || (footer == null)) {
                return false;
            }
            navbarShortcuts.remove();
            footer.remove();
            document.querySelectorAll('.dropdown-menu li').forEach((li, index) => {
                if (index < 9) {
                    li.style.display = 'none';
                }
            });
            mainPage.insertAdjacentHTML('beforebegin', `
        <style>
        .form-section {
          padding: 10px;
          border: 1px solid #ddd;
          margin-top: 10px;
          // background-color: #eee;
        }
        span.item-price {
          font-weight: bold;
          background: var(--theme-blue--dark-bg);
          color: white;
          padding: 2px 8px;
          margin-right: 4px;
          border-radius: 4px;
        }
        .item-list {
          padding: 10px;
          max-height: calc(100vh - 60px);
          overflow: auto;
        }
        .item {
          font-size: 1.1em;
          border: 1px solid #ddd;
          padding: 10px;
          margin-bottom: 10px;
          cursor: pointer;
          position: relative;
        }
        .item:hover {
          background-color: #f1f1f1;
        }
        .item-labels {
          font-size: 0.8em;
          color: #666;
        }
        .item *:empty:not(i) {
          display: none;
        }
        .item-labels span {
          margin-right: 10px;
        }
        .corner-button {
          position: absolute;
          bottom: 0;
          right: 0;
          border-radius: 4px;
          border: none;
          margin: 5px;
        }
        .modal-body .form-group {
            margin-bottom: 1rem;
        }
    </style>
    <div class="container look-up-container">
        <div class="row">
            <!-- Left Column: Form Section -->
            <div class="col-md-4 form-section">
            <h5 class="header blue">${i18n('labelsAndPrices')}</h5>
                <div class="form-group">
                    <label for="barcode" class="label-text">${i18n('fullBarcode')}</label>
                    <input type="text" class="form-control" id="barcode" placeholder="${i18n('enterBarcode')}">
                </div>
                <div class="form-group">
                <button type="button" class="btn btn-primary mb-2" id="searchBarcodeButton">${i18n('search')}</button>
                <button type="button" class="btn btn-secondary mb-2" data-toggle="modal" data-target="#searchByNameModal">${i18n('searchByName')}</button>
                </div>
                <div class="form-group">
                <!-- // Alternative Label Format -->
                <div class="checkbox-form">
                    <label>
                        <input type="checkbox" class="ace" id="alternativeLabelFormat">
                        <span class="lbl display-inline">&nbsp;${i18n('alternativeLabelFormat')}</span>
                    </label>
                </div>
                <div class="checkbox-form">
                    <label>
                        <input type="checkbox" class="ace" id="sayOutLoud" checked>
                        <span class="lbl display-inline">&nbsp;${i18n('sayOutLoud')}</span>
                    </label>
                </div>
                <div class="checkbox-form">
                    <label>
                        <input type="checkbox" class="ace" id="packagedGoods">
                        <span class="lbl display-inline">&nbsp;${i18n('packagedGoodsWillBeScanned')}</span>
                    </label>
                </div>
                </div>
                <div class="pull-right">
                <button type="button" class="btn btn-purple" id="printButton">
                <i class="fa fa-print"></i>&nbsp;${i18n('print')}</button>
                <button type="button" class="btn btn-danger" id="cleanAllButton">${i18n('cleanAll')}</button>
                </div>
            </div>
            
            <div class="col-md-8 item-list">
                <!-- Items will be dynamically added here -->
            </div>
        </div>
    </div>
    
    <!-- Modal for Search by Name -->
    <div class="modal fade" id="searchByNameModal" tabindex="-1" role="dialog" aria-labelledby="searchByNameModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title inline" id="searchByNameModalLabel">${i18n('searchByName')}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                        <div class="form-group">
                            <label for="nameInput">Name</label>
                            <input type="text" class="form-control" id="name" placeholder="${i18n('enterName')}">
                        </div>
                        <button type="button" class="btn btn-primary" id="searchNameButton">${i18n('search')}</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">${i18n('done')}</button>
                    <!-- Items will be dynamically added here -->
                    <div id="search-results" class="margin-top-10"></div>
                </div>
            </div>
        </div>
    </div>
        `);
            mainPage.remove();
            document.getElementById('searchBarcodeButton')?.addEventListener('click', this.searchByBarcode.bind(this));
            document.getElementById('searchNameButton')?.addEventListener('click', this.searchByName.bind(this));
            document.getElementById('cleanAllButton')?.addEventListener('click', this.cleanAll.bind(this));
            document.getElementById('barcode')?.addEventListener('keypress', (event) => {
                if (event.key == 'Enter') {
                    this.searchByBarcode();
                }
            });
            document.getElementById('barcode')?.addEventListener('focus', (event) => {
                if (event.target instanceof HTMLInputElement) {
                    event.target.style.backgroundColor = '#b0d877';
                }
            });
            document.getElementById('barcode')?.addEventListener('blur', (event) => {
                if (event.target instanceof HTMLInputElement) {
                    event.target.style.backgroundColor = 'white';
                }
            });
            document.getElementById('name')?.addEventListener('keypress', (event) => {
                if (event.key == 'Enter') {
                    void this.searchByName();
                }
            });
            document.getElementById('alternativeLabelFormat')?.addEventListener('change', (event) => {
                if (event.target instanceof HTMLInputElement) {
                    this.settings.alternativeLabelFormat = event.target.checked;
                }
            });
            document.getElementById('sayOutLoud')?.addEventListener('change', (event) => {
                if (event.target instanceof HTMLInputElement) {
                    this.settings.sayOutLoud = event.target.checked;
                }
            });
            document.getElementById('packagedGoods')?.addEventListener('change', (event) => {
                if (event.target instanceof HTMLInputElement) {
                    this.settings.packagedGoods = event.target.checked;
                }
            });
            document.getElementById('printButton')?.addEventListener('click', this.print.bind(this));
            this.itemList = document.querySelector('.item-list');
            this.searchResultsElement = document.getElementById('search-results');
            this.nameInput = document.getElementById('name');
            return true;
        }
        print() {
            this.items = this.items.filter(item => item);
            void new LabelGenerator(this.items, this.settings.alternativeLabelFormat);
        }
        cleanAll() {
            this.items = [];
            if (this.itemList == null) {
                console.error('itemList is not defined');
                return;
            }
            this.itemList.innerHTML = '';
        }
        async getAudioUrl(text) {
            if (this.apiKey == null) {
                return;
            }
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: { text },
                    voice: { languageCode: 'lt-LT', ssmlGender: 'MALE' },
                    audioConfig: { audioEncoding: 'MP3' }
                })
            });
            const data = await response.json();
            const audioContent = data.audioContent;
            const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
            return URL.createObjectURL(audioBlob);
        }
        createItemElement(item) {
            const newItem = document.createElement('div');
            newItem.className = 'item';
            newItem.id = item.id ?? '';
            const itemMain = document.createElement('div');
            itemMain.className = 'item-main';
            if (item.priceWithVat != 0) {
                const itemPrice = document.createElement('span');
                itemPrice.className = 'item-price';
                itemPrice.textContent = (item.finalPrice ?? item.priceWithVat).toFixed(2).toString();
                itemMain.appendChild(itemPrice);
            }
            const itemName = document.createElement('span');
            itemName.className = 'item-name';
            itemName.textContent = item.name;
            itemMain.appendChild(itemName);
            newItem.appendChild(itemMain);
            const itemLabels = document.createElement('div');
            itemLabels.className = 'item-labels';
            const labels = ['packageCode', 'weight', 'departmentNumber', 'packageQuantity'];
            if (item.weight != null) {
                const span = document.createElement('span');
                span.textContent = i18n('kiloPrice') + ': ' + item.priceWithVat;
                itemLabels.appendChild(span);
            }
            else if (item.measurementUnitName === 'kg') {
                const span = document.createElement('span');
                span.textContent = i18n('weightedItem');
                itemLabels.appendChild(span);
            }
            for (const label of labels) {
                if (item[label] != null) {
                    const span = document.createElement('span');
                    span.textContent = i18n(label) + ': ' + item[label];
                    itemLabels.appendChild(span);
                }
            }
            newItem.appendChild(itemLabels);
            const cornerButton = document.createElement('button');
            cornerButton.className = 'btn btn-sm corner-button btn-yellow';
            cornerButton.type = 'button';
            const i = document.createElement('i');
            i.className = 'fa fa-fw fa-trash';
            cornerButton.addEventListener('click', () => {
                newItem.remove();
                this.items = this.items.filter(i => i.id != item.id);
            });
            cornerButton.appendChild(i);
            newItem.appendChild(cornerButton);
            if (item.barcode == '' || item.isActive == false) {
                newItem.classList.add('background-light-red');
            }
            if (item.weight != null) {
                newItem.classList.add('mark');
            }
            return newItem;
        }
        addItemToView(item) {
            if (this.itemList == null) {
                console.error('itemList is not defined');
                return;
            }
            const newItem = this.createItemElement(item);
            item.id = item.id !== '' ? item.id : Math.random().toString(36).substring(7);
            this.itemList.appendChild(newItem);
            newItem.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        newItem(item) {
            if (item.priceWithVat == null) {
                console.error('priceWithVat is not defined');
                item.priceWithVat = 0;
                item.isActive = false;
            }
            if (this.items.length > 0 && (this.items[this.items.length - 1]).barcode == item.barcode) {
                void this.playAudio('Kaip ir sakiau, kaina yra ' + this.digitsToPrice(item.finalPrice ?? item.priceWithVat) + (item.weight !== undefined ? '. Svoris ' + this.numberToWords(item.weight) + ' g.' : '') + ' Tai ' + item.name);
            }
            else {
                this.items.push(item);
                if (item.priceWithVat !== 0) {
                    void this.playAudio('Kaina ' + this.digitsToPrice(item.finalPrice ?? item.priceWithVat));
                }
                else {
                    void this.playAudio('Kaina nėra nustatyta');
                }
            }
            this.addItemToView(item);
        }
        async playAudio(text) {
            if (!this.settings.sayOutLoud) {
                return;
            }
            const audio = new Audio(await this.getAudioUrl(text));
            void audio.play();
        }
        numberToWords(number) {
            const units = ['', 'vienas', 'du', 'trys', 'keturi', 'penki', 'šeši', 'septyni', 'aštuoni', 'devyni'];
            const teens = ['dešimt', 'vienuolika', 'dvylika', 'trylika', 'keturiolika', 'penkiolika', 'šešiolika', 'septyniolika', 'aštuoniolika', 'devyniolika'];
            const tens = ['', '', 'dvidešimt', 'trisdešimt', 'keturiasdešimt', 'penkiasdešimt', 'šešiasdešimt', 'septyniasdešimt', 'aštuoniasdešimt', 'devyniasdešimt'];
            const hundreds = ['', 'šimtas', 'du šimtai', 'trys šimtai', 'keturi šimtai', 'penki šimtai', 'šeši šimtai', 'septyni šimtai', 'aštuoni šimtai', 'devyni šimtai'];
            let words = [];
            if (number === 0) {
                words.push('nulis');
            }
            else {
                const unitsPart = number % 10;
                const tensPart = Math.floor(number / 10) % 10;
                const hundredsPart = Math.floor(number / 100);
                if (hundredsPart > 0) {
                    words.push(hundreds[hundredsPart]);
                }
                if (tensPart > 1) {
                    words.push(tens[tensPart]);
                }
                if (tensPart === 1) {
                    words.push(teens[unitsPart]);
                }
                else {
                    words.push(units[unitsPart]);
                }
            }
            words = words.filter(word => word);
            return words.join(' ');
        }
        digitsToPrice(number) {
            const integer = Math.floor(number);
            const decimal = Math.round((number - integer) * 100);
            let words = [];
            if (integer > 0) {
                words.push(this.numberToWords(integer));
            }
            if (decimal > 0) {
                if (integer !== 0) {
                    if (integer === 1 || (integer % 10 === 1 && integer % 100 !== 11)) {
                        words.push('euras');
                    }
                    else if (integer % 10 === 0 || integer % 10 >= 10 || (integer % 100 >= 10 && integer % 100 <= 20)) {
                        words.push('eurų');
                    }
                    else {
                        words.push('eurai');
                    }
                    words.push('ir');
                }
                words.push(this.numberToWords(decimal));
                if (decimal === 1 || (decimal % 10 === 1 && decimal % 100 !== 11)) {
                    words.push('centas');
                }
                else if (decimal % 10 === 0 || decimal % 10 >= 10 || (decimal % 100 >= 10 && decimal % 100 <= 20)) {
                    words.push('centų');
                }
                else {
                    words.push('centai');
                }
            }
            words = words.filter(word => word);
            return words.join(' ');
        }
        canItBePackaged(barcode) {
            return barcode.length === 13 && barcode.slice(8, 12) !== '0000' && parseInt(barcode.slice(8, 12), 10) < 4000;
        }
        searchByBarcode() {
            const inputField = document.getElementById('barcode');
            if (inputField.value == null) {
                console.error('inputField.value is not defined');
                return;
            }
            const barcode = lettersToNumbers(inputField.value);
            inputField.value = '';
            inputField.focus();
            if (barcode.toLowerCase() === 'stop') {
                this.print();
                return;
            }
            if (this.settings.packagedGoods) {
                void this.searchforAPackagedItem(barcode);
            }
            else {
                void this.searchItem(barcode);
            }
        }
        async searchByName() {
            const name = this.nameInput?.value;
            if (name == null) {
                alert(i18n('missingName'));
                return;
            }
            if ((this.nameInput == null) || (this.searchResultsElement == null)) {
                this.active = false;
                alert(i18n('error'));
                return;
            }
            this.nameInput.disabled = true;
            const items = await this.req.getItemsByName(name);
            if (items.length === 0) {
                this.searchResultsElement.innerHTML = `<div class="alert alert-warning">${i18n('noItemsFound')} "${name}"</div>`;
            }
            else {
                this.searchResultsElement.innerHTML = `<div class="alert alert-info">${i18n('searchSuccessful')} "${name}". ${items.length} ${i18n('itemsFound')} <br>${i18n('clickToAdd')}</div>`;
                items.forEach(item => {
                    const newItem = document.createElement('div');
                    newItem.className = 'item';
                    newItem.innerHTML = `<span class="item-name">${item.name}</span><span class="item-price
                pull-right">${item.priceWithVat}</span>`;
                    newItem.addEventListener('click', () => {
                        this.newItem(item);
                        newItem.style.backgroundColor = '#b0d877';
                    });
                    if (this.searchResultsElement != null) {
                        this.searchResultsElement.appendChild(newItem);
                    }
                    else {
                        console.error('searchResultsElement is not defined');
                    }
                });
            }
            this.nameInput.disabled = false;
            this.nameInput.value = '';
        }
        async searchforAPackagedItem(barcode) {
            let item = null;
            const barcodePart = barcode.slice(0, 8);
            const weightPart = parseInt(barcode.slice(8, 12), 10) / 1000;
            if (this.canItBePackaged(barcode)) {
                item = await this.req.getItem(barcodePart);
            }
            if (item != null) {
                const totalPrice = item.priceWithVat * weightPart;
                const totalFinalPrice = Math.round((totalPrice + Number.EPSILON) * 100) / 100;
                item.weight = weightPart;
                item.finalPrice = totalFinalPrice;
                this.newItem(item);
            }
            else {
                void this.searchItem(barcode);
            }
        }
        async searchItem(barcode) {
            let item = await this.req.getItem(barcode);
            if (item == null) {
                item = {
                    name: i18n('itemNotFound') + ': ' + barcode,
                    priceWithVat: 0,
                    isActive: false,
                    barcode
                };
                this.addItemToView(item);
            }
            else {
                this.newItem(item);
            }
        }
        addActivateButton() {
            const navbarShortcuts = document.querySelector('.breadcrumbs');
            if (navbarShortcuts != null) {
                const button = document.createElement('button');
                button.textContent = i18n('labelsAndPrices');
                button.className = 'btn btn-sm';
                button.addEventListener('click', this.init.bind(this));
                navbarShortcuts.appendChild(button);
            }
            return navbarShortcuts != null;
        }
    }

    class FormSimplifier {
        constructor() {
            const controlButtons = document.querySelector('.btn-ctrl');
            if (controlButtons !== null && controlButtons.querySelector('.simplify-button') === null) {
                controlButtons.appendChild(this.createHideFieldsButton());
            }
            const barcodeInput = document.querySelector('input[name="barcode"]');
            if (barcodeInput !== null) {
                barcodeInput.removeEventListener('input', (event) => { this.handleInputChange(event); });
                barcodeInput.addEventListener('input', (event) => { this.handleInputChange(event); });
                barcodeInput.classList.add('handle-input');
            }
        }
        simplifyForm() {
            const style = document.createElement('style');
            style.textContent = `
        textarea.form-control.input-sm.ng-pristine.ng-untouched.ng-valid {
            height: 50px;
        }
        input[name=isActive].ace:checked + span{
            background: white !important;
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
            display: none;
        }
        `;
            document.head.appendChild(style);
            const fieldsToHide = [
                'vatRate', 'minQuantity', 'netWeight', 'grossWeight', 'expenseCorrespondenceAccountCode',
                'saleCorrespondenceAccountCode', 'purchaseCorrespondenceAccountCode', 'externalId', 'isCommentRequired',
                'defaultSaleService', 'countryOfOriginName', 'intrastatShortDescription', 'intrastatCode',
                'freePrice', 'priceFrom', 'priceUntil', 'minPriceWithVat', 'priceMinQuantity', 'stock',
                'discountStatus', 'maxDiscount', 'discountPointsStatus', 'ageLimit', 'certificateDate',
                'certificateNumber', 'validFrom', 'validUntil', 'attribute1', 'attribute2', 'attribute3'
            ];
            fieldsToHide.forEach(field => { this.hideFormGroupByInputName(field); });
            const costFormGroup = this.findFormGroupByInputName('cost')?.parentElement;
            const manufacturerFormGroup = this.findFormGroupByInputName('manufacturerName')?.parentElement;
            if (costFormGroup != null && manufacturerFormGroup != null) {
                manufacturerFormGroup.parentElement?.appendChild(costFormGroup);
            }
        }
        findFormGroupByInputName(inputName) {
            const inputElement = inputName.includes('Status')
                ? document.querySelector(`select[name="${inputName}"]`)
                : document.querySelector(`input[name="${inputName}"]`);
            return inputElement?.closest('.form-group');
        }
        hideFormGroupByInputName(inputName) {
            const inputElement = this.findFormGroupByInputName(inputName);
            if (inputElement != null) {
                const formGroup = inputElement.closest('.form-group');
                if (formGroup != null) {
                    formGroup.style.display = 'none';
                    const parent = formGroup.parentElement;
                    if ((parent != null) && !parent.classList.contains('col-lg-12') && !parent.classList.contains('ng-pristine')) {
                        (parent).style.display = 'none';
                    }
                }
            }
        }
        createHideFieldsButton() {
            const button = document.createElement('button');
            button.className = 'btn btn-sm margin-left-5 simplify-button';
            button.type = 'button';
            if (localStorage.getItem('simplifyForm') === 'true') {
                button.textContent = i18n('resetForm');
                this.simplifyForm();
            }
            else {
                button.textContent = i18n('simplifyForm');
            }
            button.addEventListener('click', this.toggleFormLayout.bind(this));
            return button;
        }
        toggleFormLayout() {
            const simplifyButton = document.querySelector('.simplify-button');
            const newSetting = localStorage.getItem('simplifyForm') === 'true' ? 'false' : 'true';
            localStorage.setItem('simplifyForm', newSetting);
            if (newSetting === 'true') {
                this.simplifyForm();
                if (simplifyButton != null) {
                    simplifyButton.textContent = i18n('resetForm');
                }
            }
            else {
                document.querySelectorAll('.form-group').forEach(formGroup => {
                    formGroup.style.display = 'block';
                    const parent = formGroup.parentElement;
                    if (parent != null) {
                        parent.style.display = 'block';
                    }
                });
                if (simplifyButton != null) {
                    simplifyButton.textContent = i18n('simplifyForm');
                }
            }
        }
        handleInputChange(event) {
            const inputField = event.target;
            const inputValue = inputField.value;
            inputField.value = lettersToNumbers(inputValue);
            if (!/^\d+$/.test(inputValue)) {
                inputField.style.backgroundColor = 'orangered';
            }
            else if (inputValue.length === 13 || inputValue.length === 8) {
                inputField.style.backgroundColor = 'lightgreen';
            }
            else if (inputValue.length < 13) {
                inputField.style.backgroundColor = 'beige';
            }
            else {
                inputField.style.backgroundColor = 'orangered';
            }
        }
    }

    class LabelsUserscript {
        wasInterfaceButtonAdded = false;
        pageReady = false;
        user;
        interface;
        currentUrl;
        constructor() {
            this.user = new UserSession();
            this.interface = new LabelerInterface();
            this.currentUrl = window.location.pathname;
            this.init();
            void this.handleUrlChange(null, this.currentUrl);
            console.log('Label Generator for the items in b1.lt is ready!');
        }
        init() {
            this.overrideHistoryMethods();
            this.setupPopStateListener();
        }
        overrideHistoryMethods() {
            const originalPushState = history.pushState;
            history.pushState = (state, title, url) => {
                const previousUrl = this.currentUrl;
                const result = originalPushState.apply(history, [state, title, url]);
                this.currentUrl = window.location.pathname;
                void this.handleUrlChange(previousUrl, this.currentUrl);
                return result;
            };
            const originalReplaceState = history.replaceState;
            history.replaceState = (state, title, url) => {
                const previousUrl = this.currentUrl;
                const result = originalReplaceState.apply(history, [state, title, url]);
                this.currentUrl = window.location.pathname;
                void this.handleUrlChange(previousUrl, this.currentUrl);
                return result;
            };
        }
        setupPopStateListener() {
            window.addEventListener('popstate', () => {
                const previousUrl = this.currentUrl;
                this.currentUrl = window.location.pathname;
                void this.handleUrlChange(previousUrl, this.currentUrl);
            });
        }
        async handleUrlChange(previousUrl, currentUrl, tries = 0) {
            console.log('Url has changed');
            this.pageReady = false;
            if (this.user.isLoggedIn && this.user.admin && !this.interface.isActive()) {
                if (!this.wasInterfaceButtonAdded && this.interface.addActivateButton()) {
                    this.wasInterfaceButtonAdded = true;
                }
                void new Promise(resolve => setTimeout(resolve, 200));
                let success = false;
                switch (this.currentUrl) {
                    case '/en/reference-book/items':
                    case '/en/warehouse/purchases/edit':
                    case '/reference-book/items':
                    case '/warehouse/purchases/edit':
                        success = this.addPrintButton();
                        if (success) {
                            setTimeout(() => {
                                if (document.querySelector('.print') == null) {
                                    this.addPrintButton();
                                }
                            }, 1000);
                        }
                        break;
                    case '/reference-book/items/edit':
                        success = this.addPrintButton('.btn-ctrl', true);
                        if (success) {
                            void new FormSimplifier();
                        }
                        break;
                    default:
                        success = true;
                        break;
                }
                if (success) {
                    this.pageReady = true;
                }
            }
            else if (this.user.isLoggedIn && !this.user.admin && !this.interface.isActive()) {
                this.pageReady = this.interface.init();
            }
            else if (!this.user.isLoggedIn) {
                this.pageReady = this.user.addLoginOptions();
            }
            else {
                this.pageReady = true;
            }
            if (!this.pageReady && tries < 5) {
                setTimeout(() => {
                    void this.handleUrlChange(null, this.currentUrl, tries + 1);
                }, 600);
            }
        }
        getDataRows() {
            return document.querySelector('.data-rows');
        }
        extractDataFromAngular() {
            const dataRows = this.getDataRows();
            if (dataRows == null) {
                console.error('Data rows not found');
                return [];
            }
            const selectedRows = angular.element(dataRows).controller().grid.data.filter((a) => a._select);
            return selectedRows.map((row) => ({
                name: row.name,
                barcode: row.barcode,
                code: row.code,
                priceWithVat: row.priceWithVat,
                measurementUnitName: row.measurementUnitName,
                departmentNumber: row.departmentNumber,
                packageCode: row.packageCode,
                isActive: row.isActive,
                discountStatus: row.discountStatus
            }));
        }
        async extractDataFromAngularPurchaseView() {
            const dataRows = this.getDataRows();
            if (dataRows == null) {
                console.error('Data rows not found');
                return [];
            }
            const selectedRows = angular.element(dataRows).controller().data.filter((a) => a._select);
            const extractedData = [];
            if (confirm(i18n('askingForPackageCode'))) {
                window.alert(i18n('aboutToCheckPackageCode'));
                const barcodes = selectedRows.map((row) => row.itemBarcode);
                const req = new Request();
                for (const barcode of barcodes) {
                    const item = await req.getItem(barcode);
                    if (item != null) {
                        extractedData.push(item);
                    }
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
            }
            else {
                selectedRows.forEach((row) => {
                    extractedData.push({
                        name: row.itemName,
                        barcode: row.itemBarcode,
                        code: row.itemCode,
                        priceWithVat: row.itemPriceWithVat,
                        measurementUnitName: row.measurementUnitName,
                        isActive: true
                    });
                });
            }
            return extractedData;
        }
        extractDataFromAngularItemView() {
            const form = document.querySelector('ng-form');
            if (form == null) {
                console.error('Form not found!');
                return [];
            }
            const data = angular.element(form).controller().model;
            return [data];
        }
        processItemsfromAngular() {
            let data = [];
            switch (window.location.pathname) {
                case '/en/reference-book/items':
                case '/reference-book/items':
                    data = this.extractDataFromAngular();
                    break;
                case '/en/warehouse/purchases/edit':
                case '/warehouse/purchases/edit':
                    data = this.extractDataFromAngularPurchaseView();
                    break;
                case '/en/reference-book/items/edit':
                case '/reference-book/items/edit':
                    data = this.extractDataFromAngularItemView();
                    break;
            }
            void new LabelGenerator(data);
        }
        addPrintButton(parentSelector = '.buttons-left', withName = false) {
            const buttonsLeft = document.querySelector(parentSelector);
            if (buttonsLeft == null) {
                return false;
            }
            const printDiv = document.createElement('div');
            printDiv.className = 'print';
            const button = document.createElement('button');
            button.title = i18n('print');
            button.type = 'button';
            button.className = 'btn btn-sm btn-purple';
            const i = document.createElement('i');
            i.className = 'fa fa-fw fa-print';
            button.appendChild(i);
            if (withName) {
                const span = document.createElement('span');
                span.className = 'margin-left-5';
                span.textContent = i18n('print');
                button.appendChild(span);
            }
            printDiv.addEventListener('click', this.processItemsfromAngular.bind(this));
            printDiv.appendChild(button);
            buttonsLeft.appendChild(printDiv);
            return true;
        }
    }
    window.addEventListener('load', () => {
        void new LabelsUserscript();
    });

})();
