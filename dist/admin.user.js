// ==UserScript==
// @name              B1 additional functions
// @namespace         http://tampermonkey.net/
// @homepage          https://github.com/martynas2200/b1-labels
// @version           1.7.3
// @description       Markup calculator
// @author            Martynas Miliauskas
// @match             https://www.b1.lt/*
// @icon              https://b1.lt/favicon.ico
// @connect           b1.lt
// @connect           raw.githubusercontent.com
// @downloadURL       https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/admin.user.js
// @updateURL         https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/admin.user.js
// @grant             GM.setValue
// @grant             GM.getValue
// @grant             unsafeWindow
// @grant             GM_xmlhttpRequest
// @license           GNU GPLv3
// ==/UserScript==

(function () {
    'use strict';

    class ModalService {
        $uibModal;
        $rootScope;
        modalInstance = null;
        constructor() {
            const injector = angular.element(document.body).injector();
            this.$uibModal = injector.get('$uibModal');
            this.$rootScope = injector.get('$rootScope');
        }
        async showModal(config) {
            const modalScope = this.$rootScope.$new(true);
            if (config.scopeProperties) {
                Object.assign(modalScope, config.scopeProperties);
            }
            this.modalInstance = this.$uibModal.open({
                animation: true,
                template: config.template,
                scope: modalScope,
                size: config.size || 'lg',
                backdrop: config.backdrop || 'static',
            });
            modalScope.closeModal = () => {
                this.modalInstance.close();
                modalScope.$destroy();
                config.onClose?.();
            };
        }
    }

    const LANGUAGES = {
        en: {
            normal: 'Normal',
            half: 'Half',
            add: 'Add',
            addManufacturer: 'Add Manufacturer',
            addPackageFee: 'Add Package Fee',
            addToList: 'Add to List',
            ageLimit: 'Age Limit',
            ago: 'ago',
            barcodeOnly: 'Barcode only',
            fridge: 'Fridge',
            alcohol: 'Alcohol',
            asMentioned: 'As mentioned',
            attributeName: 'Attribute Name',
            autoLogin: 'Instant Login',
            barcode: 'Barcode',
            checked: 'Checked',
            chooseLabelType: 'Choose label type',
            chooseLabelTypeDescription: 'Choose the type of label you want to print',
            cleanAll: 'Clean All',
            close: 'Close',
            code: 'Code',
            cost: 'Cost',
            countryOfOriginName: 'Country of Origin Name',
            date: 'Date',
            defaultSaleService: 'Default Sale Service',
            departmentNumber: 'Department',
            description: 'Description',
            discount: 'Discount',
            discountPointsStatus: 'Discount Points Status',
            discountRate: 'Discount Rate',
            discountStatus: 'Discount Status',
            done: 'Done',
            enterBarcode: 'Enter the barcode',
            enterName: 'Enter Name',
            enterNewPrice: 'Enter new price',
            error: 'Error',
            expiryDate: 'Expiry Date',
            files: 'Files',
            fitRaso: 'Fit Raso',
            freePrice: 'Free Price',
            fullBarcode: 'Full Barcode',
            fullName: 'Full Name',
            grossWeight: 'Gross Weight',
            groupName: 'Group Name',
            help: 'If you have any problems, reach out via GitHub',
            inactiveItem: 'The item is inactive. Do you want to continue?',
            isActive: 'Is Active',
            isCommentRequired: 'Is Comment Required',
            isQuantitative: 'Is Quantitative',
            isRefundable: 'Is Refundable',
            itemAdded: 'Item added',
            itemCatalog: 'Item Catalog',
            itemCreated: 'Item created',
            itemDetails: 'Item Details',
            itemNotActive: 'Item not active',
            itemNotFound: 'Item not found!',
            itemsFound: 'Items found',
            itemUpdated: 'Item updated',
            kiloPrice: 'Price per kilo',
            label: 'Label',
            labelsAndPrices: 'Labels and Prices',
            leftover: 'Leftover',
            loading: 'Loading...',
            login: 'Login',
            loginDetailsNotFound: 'Login details not found',
            manufacturerName: 'Manufacturer Name',
            markdowns: 'Markdowns',
            maxDiscount: 'Max Discount',
            measurementUnitCanBeWeighed: 'Measurement Unit Can Be Weighed',
            measurementUnitName: 'Measurement Unit Name',
            minPriceWithVat: 'Min Price With VAT',
            minQuantity: 'Min Quantity',
            missingBarcode: 'Missing barcode',
            missingElements: 'Missing UI elements',
            missingName: 'Missing name',
            missingWeight: 'Missing weight',
            modifiedAt: 'Last modified',
            multipleItemsFound: 'Multiple items found!',
            name: 'Name',
            netWeight: 'Net Weight',
            newItem: 'New Item',
            newPriceIs: 'New price is: ',
            nItemsRemoved: ' items removed',
            nlabelsToBePrinted: ' labels to be printed',
            no: 'No',
            noActiveInput: 'No active input',
            noData: 'No data to print!',
            noItemsFound: 'No items found',
            noItemsScanned: 'No items scanned yet.',
            noItemsSelected: 'No items selected!',
            notAllItemsActive: 'Not all selected items are active. Do you want to continue?',
            number: 'Number',
            oddNumberOfItems: 'Odd number of labels. Do you want to continue?',
            onlyAvailableInPurchaseView: 'This is not a purchase view. This feature is only available in the purchase view',
            packageCode: 'Package',
            packageQuantity: 'Package Quantity',
            pcs: 'pcs',
            price: 'Price',
            priceFrom: 'Price From',
            priceMinQuantity: 'Price Min Quantity',
            priceNotSet: 'Price not set',
            pricePerKg: 'Price per kg',
            priceUntil: 'Price Until',
            priceWithoutVat: 'Price Without VAT',
            priceWithVat: 'Price With VAT',
            print: 'Print',
            printJobIsSent: 'Print job is sent',
            quantity: 'Quantity',
            readyForScan: 'Ready for scan',
            resetForm: 'Reset form',
            results: 'Results',
            retrievedAt: 'Retrieved at',
            save: 'Save',
            sayOutLoud: 'Say out loud',
            search: 'Search',
            searchByBarcode: 'Search by Barcode',
            searchByName: 'Search by Name',
            searchingFor: 'Searching for',
            searchSuccessful: 'Search successful',
            show: 'Show',
            showByDate: 'Show by Date',
            showLoginOptions: 'Other ways to login',
            showStock: 'Show Stock',
            simplifyForm: 'Simplify Form',
            stock: 'Stock',
            type: 'Label type',
            thisIs: 'This is',
            toggleKeyboard: 'Toggle Keyboard',
            tooManyItems: 'Too many items',
            total: 'Total',
            totalPrice: 'Total Price',
            validFrom: 'Valid From',
            validUntil: 'Valid Until',
            vatRate: 'VAT Rate',
            weeklyReports: 'Weekly Reports',
            weight: 'Weight',
            weightedItem: 'Weighted item',
            weightedItemAdded: 'Weighted item added',
            weightLabel: 'Weight Label',
            yes: 'Yes',
            zero: 'zero',
        },
        lt: {
            normal: 'Normali',
            half: 'Pusė',
            fridge: 'Trumpa (šaldytuvui)',
            barcodeOnly: 'Tik brūkšninis kodas',
            add: 'Pridėti',
            ago: '',
            addManufacturer: 'Pridėti gamintoją',
            addPackageFee: 'Pridėti fasavimo maišelį',
            addToList: 'Pridėti į sąrašą',
            ageLimit: 'Amžiaus limitas',
            alcohol: 'Alkoholis',
            asMentioned: 'Kaip minėjau',
            attributeName: 'Atributo pavadinimas',
            autoLogin: 'Prisijungti automatiškai',
            barcode: 'Brūkšninis kodas',
            checked: 'Tikrinta prieš',
            chooseLabelType: 'Pasirinkite etiketės tipą',
            chooseLabelTypeDescription: 'Pasirinkite etiketės tipą, kurį norite spausdinti',
            cleanAll: 'Išvalyti',
            close: 'Uždaryti',
            code: 'Kodas',
            cost: 'Savikaina',
            countryOfOriginName: 'Kilmės šalies pavadinimas',
            date: 'Data',
            defaultSaleService: 'Numatytoji pardavimo paslauga',
            departmentNumber: 'S',
            description: 'Aprašymas',
            discount: 'Nuolaida',
            discountPointsStatus: 'Nuolaidų taškų statusas',
            discountRate: 'Nuolaidos dydis',
            discountStatus: 'Nuolaidos statusas',
            done: 'Atlikta',
            enterBarcode: 'Įveskite brūkšninį kodą',
            enterName: 'Įveskite prekės pavadinimą',
            enterNewPrice: 'Įveskite naują kainą',
            error: 'Įvyko klaida',
            expiryDate: 'Galiojimo data',
            files: 'Failai',
            fitRaso: 'Tinkamas RASO importui',
            freePrice: 'Laisva kaina',
            fullBarcode: 'Pilnas brūkšninis kodas',
            fullName: 'Pilnas pavadinimas',
            grossWeight: 'Bendras svoris',
            groupName: 'Grupės pavadinimas',
            help: 'Jei kyla problemų, kreiptis pas Martyną',
            inactiveItem: 'Prekė yra neaktyvi. Ar norite tęsti?',
            isActive: 'Aktyvus',
            isCommentRequired: 'Komentaro reikalavimas',
            isQuantitative: 'Kiekinė',
            isRefundable: 'Grąžinimo galimybė',
            itemAdded: 'Prekė pridėta',
            itemCatalog: 'Prekių žinynas',
            itemCreated: 'Prekė išsaugota',
            itemDetails: 'Prekės informacija',
            itemNotActive: 'Prekė neaktyvi',
            itemNotFound: 'Prekė nerasta!',
            itemsFound: ' rasta',
            itemUpdated: 'Prekė atnaujinta',
            kiloPrice: 'Kilogramo kaina',
            label: 'Etiketė',
            labelsAndPrices: 'Etiketės ir kainos',
            leftover: 'Liko',
            loading: 'Kraunama...',
            login: 'Prisijungimas darbo vietoje',
            loginDetailsNotFound: 'Prisijungimo duomenys nerasti',
            manufacturerName: 'Gamintojo pavadinimas',
            markdowns: 'Nukainavimai',
            maxDiscount: 'Max nuolaida',
            measurementUnitCanBeWeighed: 'Prekė gali būti sveriama',
            measurementUnitName: 'Matavimo vieneto pavadinimas',
            minPriceWithVat: 'Min kaina su PVM',
            minQuantity: 'Min kiekis',
            missingBarcode: 'Trūksta brūkšninio kodo',
            missingElements: 'Trūksta UI elementų',
            missingName: 'Trūksta pavadinimo',
            missingWeight: 'Trūksta svorio',
            modifiedAt: 'Paskutinis keitimas',
            multipleItemsFound: 'Rasta daugiau nei viena prekė!',
            name: 'Pavadinimas',
            netWeight: 'Neto svoris',
            newItem: 'Nauja prekė',
            newPriceIs: 'Nauja kaina: ',
            nItemsRemoved: ' prekių įrašai pašalinti',
            nlabelsToBePrinted: ' etiketės bus spausdinamos',
            no: 'Ne',
            noActiveInput: 'Nėra aktyvaus lauko',
            noData: 'Nepakanka duomenų spausdinimui!',
            noItemsFound: 'Nieko nerasta',
            noItemsScanned: 'Dar nėra nuskaitytų prekių.',
            noItemsSelected: 'Nėra pasirinktų prekių',
            notAllItemsActive: 'Ne visos pasirinktos prekės yra aktyvios. Ar norite tęsti?',
            number: 'Numeris',
            oddNumberOfItems: 'Nelyginis etikečių skaičius. Ar norite tęsti?',
            onlyAvailableInPurchaseView: 'Tai ne pirkimo peržiūra. Ši funkcija yra prieinama tik Pirkimai, atidarius vieną iš jų',
            packageCode: 'Pakuotė',
            packageQuantity: 'Pakuotės kiekis',
            pcs: 'vnt.',
            price: 'Kaina',
            priceFrom: 'Kaina nuo',
            priceMinQuantity: 'Kaina min kiekis',
            priceNotSet: 'Kaina nėra nustatyta',
            pricePerKg: 'Kaina už 1 kg',
            priceUntil: 'Kaina iki',
            priceWithoutVat: 'Kaina be PVM',
            priceWithVat: 'Kaina su PVM',
            print: 'Spausdinti',
            printJobIsSent: 'Spausdinimo užduotis nusiųsta',
            quantity: 'Kiekis',
            readyForScan: 'Pasiruošęs skenavimui',
            resetForm: 'Atkurti formą',
            results: 'Rezultatai',
            retrievedAt: 'Gauta',
            save: 'Išsaugoti',
            sayOutLoud: 'Sakyti kainas balsu',
            search: 'Ieškoti',
            searchByBarcode: 'Ieškoti pagal brūkšninį kodą',
            searchByName: 'Ieškoti pagal pavadinimą',
            searchingFor: 'Ieškoma',
            searchSuccessful: 'Paieška sėkminga',
            show: 'Rodyti',
            showByDate: 'Rodyti pagal datą',
            showLoginOptions: 'Kiti prisijungimo būdai',
            showStock: 'Rodyti likutį',
            simplifyForm: 'Supaprastinti formą',
            stock: 'Likutis',
            type: 'Etiketės tipas',
            thisIs: 'Tai',
            toggleKeyboard: 'Klaviatūra',
            tooManyItems: 'Per daug prekių',
            total: 'Bendra suma',
            totalPrice: 'Apskaičiuota kaina',
            validFrom: 'Galioja nuo',
            validUntil: 'Galioja iki',
            vatRate: 'PVM tarifas',
            weeklyReports: 'Savaitės ataskaitos',
            weight: 'Svoris',
            weightedItem: 'Sveriama prekė',
            weightedItemAdded: 'Sveriama prekė pridėta',
            weightLabel: 'Svorio etiketė',
            yes: 'Taip',
            zero: 'nulis',
        },
    };
    let userLanguage = navigator.language.split('-')[0];
    const currentUrl = window.location.pathname;
    const languagePattern = /\/(en|ru)\//;
    if (languagePattern.test(currentUrl)) {
        userLanguage = 'en';
    }
    const currentLanguage = LANGUAGES[userLanguage] != null ? userLanguage : 'en';
    const i18n = (key) => LANGUAGES[currentLanguage][key] ?? LANGUAGES.en[key] ?? key;

    class Request {
        items = {};
        baseUrl = 'https://www.b1.lt';
        path = '/reference-book/items/search';
        csrfToken;
        headers;
        notifier;
        turnstileService;
        constructor(notifier) {
            const appElement = document.querySelector('[ng-app]');
            if (!appElement) {
                throw new Error('Angular app not found');
            }
            const injector = angular.element(appElement).injector();
            this.turnstileService = injector.get('turnstileService');
            const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
            this.csrfToken = csrfTokenElement != null ? csrfTokenElement.content : '';
            this.notifier = notifier;
            this.headers = {
                accept: 'application/json, text/plain, */*',
                'accept-language': 'en-GB,en;q=0.9,lt-LT;q=0.8,lt;q=0.7,en-US;q=0.6',
                'content-type': 'application/json;charset=UTF-8',
                origin: this.baseUrl,
                referer: this.baseUrl,
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-requested-with': 'XMLHttpRequest',
                'x-csrf-token': this.csrfToken,
                cookie: '',
            };
        }
        async fetchData(method, path, body) {
            if (this.csrfToken === '') {
                console.error('CSRF token is missing');
                this.notifier.error('CSRF token is missing');
                return;
            }
            const pathParts = path.split('/');
            pathParts.pop();
            this.headers.referer = `${this.baseUrl}${pathParts.join('/')}`;
            this.getCookies();
            try {
                const response = await fetch(`${this.baseUrl}${path}`, {
                    method,
                    headers: this.headers,
                    body: JSON.stringify(body),
                });
                if (response.ok) {
                    return await response.json();
                }
                else if ('challenge' === response.headers.get('cf-mitigated') ||
                    response.status === 403) {
                    if (await this.handleChallenge()) {
                        console.info('Challenge handled, repeat the request');
                        return await this.fetchData(method, path, body);
                    }
                }
                else {
                    console.error('Request failed with status:', response.status);
                    this.notifier.error({
                        title: i18n('error'),
                        message: response.statusText,
                    });
                }
            }
            catch (error) {
                console.error('Error:', error);
                this.notifier.error('Error: ' + error);
            }
        }
        getCookies() {
            const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
            cookies.forEach((cookie) => {
                const [name, value] = cookie.split('=');
                if ([
                    'YII_CSRF_TOKEN',
                    'b1-device_id',
                    'b1-session_id',
                    'b1-use-cookies',
                    'b1-wss_srv',
                    'b1-ref_url',
                    'cf_clearance',
                    '_ga',
                ].includes(name.trim())) {
                    this.headers.cookie =
                        this.headers.cookie.length > 0
                            ? `${this.headers.cookie}; ${name}=${value}`
                            : `${name}=${value}`;
                }
            });
        }
        isItDigits(barcode) {
            return /^\d+$/.test(barcode);
        }
        async getItem(barcode) {
            if (!this.isItDigits(barcode)) {
                this.notifier.error('Invalid barcode');
                return null;
            }
            if (Object.keys(this.items).includes(barcode)) {
                const retrievedAt = this.items[barcode].retrievedAt;
                if (retrievedAt != null &&
                    barcode.length > 10 &&
                    new Date().getTime() - retrievedAt.getTime() < 30000) {
                    return { ...this.items[barcode] };
                }
                else if (retrievedAt != null &&
                    barcode.length < 10 &&
                    new Date().getTime() - retrievedAt.getTime() < 60000) {
                    return { ...this.items[barcode] };
                }
            }
            const body = {
                pageSize: 20,
                filters: {
                    groupOp: 'AND',
                    rules: {
                        barcode: {
                            data: barcode,
                            field: 'barcode',
                            op: barcode[0] === '0' ? 'cn' : 'eq',
                        },
                    },
                },
                allSelected: false,
                asString: '',
                page: 1,
            };
            const data = await this.fetchData('POST', this.path, body);
            if (data == null || data.data[0] == null) {
                return null;
            }
            data.data[0].retrievedAt = new Date();
            this.items[barcode] = data.data[0];
            if (data.data.length > 1) {
                this.notifier.warning({
                    title: i18n('multipleItemsFound'),
                    delay: 20000,
                    message: i18n('barcode') +
                        ' ' +
                        barcode +
                        ' ' +
                        i18n('found') +
                        ' ' +
                        data.data.length +
                        ' ' +
                        i18n('items'),
                });
            }
            return data.data[0];
        }
        async saveItem(id, data) {
            if (!this.isItDigits(id)) {
                this.notifier.error(i18n('invalidId'));
                return false;
            }
            const response = await this.fetchData('POST', `/reference-book/items/update?id=${id}`, data);
            if (response.code === 200) {
                this.notifier.success({
                    title: i18n('itemUpdated'),
                    message: i18n('newPriceIs') + data.priceWithVat,
                    delay: 15000,
                });
            }
            else {
                this.notifier.error({
                    title: i18n('failedToUpdateItem'),
                    message: response.message,
                });
            }
            return response.code === 200;
        }
        async createItem(data) {
            const response = await this.fetchData('POST', '/reference-book/items/create', data);
            if (response.code === 200) {
                this.notifier.success(i18n('itemCreated'));
                setTimeout(() => {
                    void this.saveItem(response.data.id, { isActive: true });
                }, 400);
            }
            else {
                this.notifier.error({
                    title: i18n('failedToCreateItem'),
                    message: response.message,
                });
            }
            return response.code === 200;
        }
        async getSales(operationTypeName) {
            const body = {
                sort: { saleDate: 'desc' },
                page: 1,
                pageSize: 20,
                allSelected: false,
                asString: '',
                filters: {
                    rules: {
                        operationTypeName: {
                            data: operationTypeName,
                            field: 'operationTypeName',
                            op: 'cn',
                        },
                    },
                },
            };
            const path = '/warehouse/light-sales/search';
            return this.fetchData('POST', path, body);
        }
        getSaleItems(lightSaleId) {
            const body = {
                page: 1,
                pageSize: -1,
                filters: {
                    rules: {
                        lightSaleId: { field: 'lightSaleId', op: 'eq', data: lightSaleId },
                    },
                },
            };
            return this.fetchData('POST', '/warehouse/light-sale-items/search', body);
        }
        clearCache() {
            const nItems = Object.keys(this.items).length;
            this.items = {};
            this.notifier.info({
                title: i18n('cacheCleared'),
                message: nItems + i18n('nItemsRemoved'),
            });
        }
        async handleChallenge() {
            try {
                await this.turnstileService.render();
                console.info('Turnstile challenge passed!');
                return true;
            }
            catch (error) {
                console.error('Turnstile challenge failed.', error);
                return false;
            }
        }
    }

    var adminCSS = "ng-form textarea.form-control.input-sm.ng-pristine.ng-untouched.ng-valid{height:50px}ng-form label:has(input[name=isActive]){margin-left:-0.5em}ng-form input[name=isActive].ace+span{background-color:#b74635;color:#fff;padding:.75em 5em .75em .5em;border-radius:4px}ng-form input[name=isActive].ace:checked+span{background-color:#fff;color:inherit}ng-form.simplified-form h5.header.blue,ng-form .alert.alert-warning{display:none}.row[ng-controller=\"CashRegisterSaleEdit as c\"] .row .row .col-lg-6{display:none}";

    class UINotification {
        notificationService;
        constructor() {
            const appElement = document.querySelector('[ng-app]');
            if (appElement === null) {
                throw new Error('Angular app not found');
            }
            try {
                const injector = angular.element(appElement).injector();
                this.notificationService = injector.get('Notification');
            }
            catch (error) {
                console.error('Failed to get Notification service', error);
                alert('Failed to get Notification service');
                this.notificationService = {
                    info: (options) => alert(options),
                    error: (options) => alert(options),
                    success: (options) => alert(options),
                    warning: (options) => alert(options),
                    primary: (options) => alert(options)
                };
            }
        }
        info(options) {
            this.notificationService.info(options);
        }
        error(options) {
            this.notificationService.error(options);
        }
        success(options) {
            this.notificationService.success(options);
        }
        warning(options) {
            this.notificationService.warning(options);
        }
        primary(options) {
            this.notificationService.primary(options);
        }
    }

    class LabelsUserscript {
        wereButtonsAdded = false;
        notification = new UINotification();
        currentUrl;
        constructor() {
            this.currentUrl = window.location.pathname;
            this.init();
            void this.handleUrlChange(null, this.currentUrl);
            console.debug('LabelsUserscript initialized');
        }
        init() {
            void this.handleUrlChange(null, this.currentUrl);
            this.addStyles();
        }
        async handleUrlChange(previousUrl, currentUrl, tries = 0) {
            if (this.currentUrl != '/login' && !this.wereButtonsAdded) {
                this.wereButtonsAdded = this.addButton('Rodyti antkainius', this.listMarkup.bind(this)) && this.addButton('Peržiūrėti prekės judėjimą', this.goToItemMovement.bind(this));
                if (!this.wereButtonsAdded && tries < 5) {
                    setTimeout(() => {
                        void this.handleUrlChange(null, this.currentUrl, tries + 1);
                    }, 600);
                }
            }
        }
        getDataRows() {
            const dataRows = document.querySelector('.data-rows');
            if (dataRows == null) {
                this.notification.error("Įvyko klaida: nepavyko rasti duomenų eilučių");
                throw new Error('Data rows not found');
            }
            return dataRows;
        }
        goToItemMovement() {
            const dataRows = this.getDataRows();
            const controller = angular.element(dataRows).controller();
            const item = (controller.data ?? controller.grid.data).filter((item) => item._select).pop();
            if (item == null) {
                this.notification.error('Pasirinkite prekę');
                return;
            }
            if (item.id == null && item.itemId == null) {
                this.notification.error('Prekės ID nerastas');
                return;
            }
            const url = new URL('/warehouse/item-movement', window.location.origin);
            url.searchParams.append('itemId', item.itemId ?? item.id);
            url.searchParams.append('itemName', item.name ?? item.itemName);
            url.searchParams.append('warehouseId', '1');
            url.searchParams.append('warehouseName', 'Pagrindinis');
            window.open(url.toString(), '_blank');
        }
        calculateMarkup(price, cost) {
            return ((price - cost) / cost) * 100;
        }
        async listMarkup() {
            if (window.location.pathname !== '/en/warehouse/purchases/edit' && window.location.pathname !== '/warehouse/purchases/edit') {
                this.notification.error("Įvyko klaida: ši funkcija veikia tik pirkimo sąskaitų peržiūros lange");
                return;
            }
            const controller = angular.element(this.getDataRows()).controller();
            const modal = new ModalService();
            void modal.showModal({
                template: `
      <div class="modal-header">
        <button type="button" class="close" ng-click="closeModal()">&times;</button>
        <h4 class="modal-title">Antkainių sąrašas</h4>
      </div>
      <div class="modal-body extd-grid">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Pavadinimas</th>
              <th class="width-100-strict">Kaina be PVM</th>
              <th class="width-100-strict">Antkainis</th>
              <th class="width-130-strict">Pardavimo kaina su PVM</th>
              <th class="width-100-strict">Min. kaina 20%</th>
            </tr>
          </thead>
          <tbody>
            <tr ng-repeat="item in data">
              <td>{{ item.itemName }}</td>
              <td>{{ item.priceWithoutVatWithDiscount.toFixed(3) }}</td>
              <td ng-class="{ 'background-white-red': calculateMarkup(item.itemPriceWithVat, item.priceWithoutVatWithDiscount * (1 + (item.vatRate / 100))) < 19.5 }">{{ calculateMarkup(item.itemPriceWithVat, item.priceWithoutVatWithDiscount * (1 + (item.vatRate / 100))).toFixed(2) }}%</td>
              <td>
                <span>{{ item.itemPriceWithVat == null ? "-" : item.itemPriceWithVat }}</span>
                <button class="btn btn-xs btn-primary pull-right" style="margin-left: 10px;" ng-click="editPrice(item)">Keisti</button>
              </td>
              <td>{{ (item.priceWithoutVatWithDiscount * (1 + (item.vatRate / 100)) * 1.2).toFixed(3) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" ng-click="closeModal()">Uždaryti</button>
      </div>
      `,
                scopeProperties: {
                    data: controller.data,
                    calculateMarkup: this.calculateMarkup,
                    editPrice: this.editPrice.bind(this)
                },
                size: 'lg',
                backdrop: 'static',
                onClose: () => {
                    console.log('Modal closed');
                }
            });
        }
        addButton(text, callback) {
            const navbarShortcuts = document.querySelector('.breadcrumbs');
            if (navbarShortcuts != null) {
                const button = document.createElement('button');
                button.textContent = text;
                button.className = 'btn btn-sm';
                button.addEventListener('click', callback);
                navbarShortcuts.appendChild(button);
            }
            return navbarShortcuts != null;
        }
        async editPrice(item) {
            const prompt = window.prompt('Įveskite naują kainą', item.itemPriceWithVat?.toString() ?? '');
            if (prompt == null) {
                return;
            }
            const newPrice = parseFloat(prompt.replace(',', '.'));
            if (newPrice <= 0) {
                this.notification.error('Neteisinga kaina');
                return;
            }
            else {
                item.itemPriceWithVat = newPrice;
                let priceWithoutVat = newPrice / 1.21;
                priceWithoutVat = Math.round((priceWithoutVat + Number.EPSILON) * 10000) / 10000;
                const req = new Request(this.notification);
                const data = {
                    isActive: true,
                    priceWithVat: newPrice,
                    priceWithoutVat: priceWithoutVat
                };
                void req.saveItem(item.itemId.toString(), data);
            }
        }
        addStyles() {
            const styles = document.createElement('style');
            styles.innerHTML = adminCSS;
            document.head.appendChild(styles);
        }
    }
    window.addEventListener('load', () => {
        void new LabelsUserscript();
        setTimeout(() => {
            if (window.clarity != null) {
                window.clarity('stop');
            }
        }, 500);
    });

})();
