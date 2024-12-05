// ==UserScript==
// @name              Label Generator for the items in b1.lt
// @namespace         http://tampermonkey.net/
// @homepage          https://github.com/martynas2200/b1-labels
// @version           1.6.0
// @description       Generate labels for the selected items on the b1.lt website
// @author            Martynas Miliauskas
// @match             https://www.b1.lt/*
// @icon              https://b1.lt/favicon.ico
// @connect           b1.lt
// @connect           raw.githubusercontent.com
// @downloadURL       https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/script.user.js
// @updateURL         https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/script.user.js
// @grant             GM.setValue
// @grant             GM.getValue
// @grant             unsafeWindow
// @grant             GM_xmlhttpRequest
// @license           GNU GPLv3
// ==/UserScript==

(function () {
  'use strict';

  var all = "body.labeler-interface{background-color:#eee}body.labeler-interface tr.sub-grid-row,body.labeler-interface td.sub-grid,body.labeler-interface [ng-if=\"config.subGrid\"],body.labeler-interface [ng-if=\"!config.hideTopPager\"],body.labeler-interface .sidebar{display:none !important;pointer-events:none}body.labeler-interface .input-group{display:flex}body.labeler-interface .modal h5.header.blue.header-temp-files-list{margin-top:0}body.labeler-interface .modal .btn,body.labeler-interface .modal select,body.labeler-interface .modal input[type=text]{border-radius:4px !important}body.labeler-interface .main-content *{border-radius:4px !important}body.labeler-interface .main-content table.table.table-bordered *{border-radius:unset !important}body.labeler-interface .main-content .btn-ctrl:has(.fa-print) button.btn.btn-sm:has(.fa-print),body.labeler-interface .main-content span.resizer,body.labeler-interface .main-content .extd-grid-control select{pointer-events:none;opacity:.3}body.labeler-interface .main-content .breadcrumbs,body.labeler-interface .main-content .no-border,body.labeler-interface .main-content .form-group:has(.fa-star),body.labeler-interface .main-content .table-responsive thead tr>:nth-child(4),body.labeler-interface .main-content .table-responsive thead tr>:nth-child(6),body.labeler-interface .main-content .table-responsive thead tr>:nth-child(7),body.labeler-interface .main-content .table-responsive tbody tr>:nth-child(4),body.labeler-interface .main-content .table-responsive tbody tr>:nth-child(6),body.labeler-interface .main-content .table-responsive tbody tr>:nth-child(7),body.labeler-interface .main-content .uib-typeahead-match .tt-suggestion>:nth-child(2),body.labeler-interface .main-content .uib-typeahead-match .tt-suggestion>:nth-child(3),body.labeler-interface .main-content .uib-typeahead-match .tt-suggestion>:nth-child(4),body.labeler-interface .main-content .uib-typeahead-match .tt-suggestion>:nth-child(5),body.labeler-interface .main-content .form-horizontal:nth-child(3)>:nth-child(2)>:nth-child(2),body.labeler-interface .main-content .form-horizontal:nth-child(3)>:nth-child(2)>:nth-child(3),body.labeler-interface .main-content .form-horizontal:nth-child(3)>:nth-child(5),body.labeler-interface .main-content .form-horizontal:nth-child(1)>:nth-child(2)>:nth-child(1)>:nth-child(2)>:nth-child(2),body.labeler-interface .main-content .form-horizontal:nth-child(1)>:nth-child(2)>:nth-child(3)>:nth-child(2)>:nth-child(2),body.labeler-interface .main-content .extd-grid-control .extd-grid-buttons.buttons-right,body.labeler-interface .main-content .extd-grid-title,body.labeler-interface .main-content td[ng-if=\"config.subGrid\"]{display:none !important;pointer-events:none}body.labeler-interface .main-content td[extd-touch-resize],body.labeler-interface .main-content a{-webkit-user-drag:none;user-drag:none}body.labeler-interface .main-content .input-group-addon,body.labeler-interface .main-content .input-group-btn{display:table-column}body.labeler-interface .main-content .sticky{background:rgba(0,0,0,0)}body.labeler-interface .main-content .sticky .btn-ctrl>div{border:unset;padding:unset}body.labeler-interface .main-content input[ng-model=\"filter.page\"]{width:30px}body.labeler-interface .main-content .pagination-wrap button.btn.btn-sm.btn-transparent{background:#fff !important}body.labeler-interface.dark,body.labeler-interface.dark .navbar{background-color:#000}body.labeler-interface .navbar{background-color:var(--theme-blue--dark-bg)}body.labeler-interface .navbar .navbar-header .navbar-brand{padding-left:1em;filter:brightness(0) invert(1)}body.labeler-interface .navbar .navbar-header .navbar-toggle{display:none}body.labeler-interface .navbar a.navbar-shortcut{color:#eee}body.labeler-interface .navbar a.navbar-shortcut i{font-size:1.2em;margin:0 2px;text-align:center}body.labeler-interface .navbar li:has(.navbar-shortcut):hover{background:rgba(0,0,0,.3607843137)}body.labeler-interface .navbar .navbar-nav>*:not(:last-child){display:none}body.labeler-interface .navbar .navbar-nav>*:nth-last-child(2),body.labeler-interface .navbar .navbar-nav>*:nth-last-child(4),body.labeler-interface .navbar .navbar-nav>*:nth-last-child(5),body.labeler-interface .navbar .navbar-nav>*:nth-last-child(7){display:block}body.labeler-interface .navbar .navbar-collapse-2 img,body.labeler-interface .navbar .navbar-collapse-2 .divider{display:none}body.labeler-interface .navbar .navbar-collapse-2 .nav-user-shortcut{height:100%}body.labeler-interface .navbar .navbar-nav li.nav-user-dropdown img,body.labeler-interface .navbar .navbar-nav li.nav-user-dropdown .divider{display:none}body.labeler-interface .navbar .navbar-nav li.nav-user-dropdown a .nav-user-company{font-size:unset !important;line-height:unset !important}body.labeler-interface .navbar .navbar-nav li.nav-user-dropdown a{padding:15px 10px}body.labeler-interface .navbar .nav-user-dropdown__title{color:#d9d9d9;padding-right:10px;font-size:15px;max-width:unset}body.labeler-interface .navbar .nav-user-dropdown__title .caret{color:#d9d9d9}body.labeler-interface .navbar .nav-user-dropdown__title *:first-child{display:none}.look-up-container *:not(.header){border-radius:4px}.look-up-container .load-data{padding:10px}@media screen and (max-width: 992px){.look-up-container .load-data{padding:10px 0 !important}}.look-up-container .load-overlay{background-color:rgba(238,238,238,.7490196078)}.look-up-container .form-section{border:1px solid #ddd;margin-top:10px;background-color:#fcfcfc}.look-up-container .item-list{max-height:calc(100vh - 70px);overflow:auto}.look-up-container .item-list .item:not(.mark):not(.inactive){background-color:#fff}.look-up-container .item-list .item{transition:.5s;animation:highlight .5s ease-out;display:grid;grid-template-columns:auto min-content min-content;column-gap:5px;font-size:1.1em;border:1px solid #ddd;padding:10px;margin-bottom:4px;cursor:pointer;position:relative}.look-up-container .item-list .item .item-price,.look-up-container .item-list .item .item-stock{font-weight:bold;background-color:var(--theme-blue--dark-bg);color:#fff;padding:2px 8px;margin-right:4px}.look-up-container .item-list .item .item-stock{background-color:#777}.look-up-container .item-list .item .item-main{grid-row:1;grid-column:1}.look-up-container .item-list .item .item-labels{grid-column:1;grid-row:2;align-self:center}.look-up-container .item-list .item .btn{grid-row:1/span 2;border:none}.look-up-container .item-list .item .btn-yellow{grid-column:3}.look-up-container .item-list .item:last-child{margin-bottom:30px;animation:highlight .5s ease-out,emphasizeItem .5s ease-in-out 5s backwards}.look-up-container .item-list .item.inactive{background-color:#f8d7da !important}.look-up-container .item-list .item.mark{background-color:#fcf8e3 !important}.look-up-container .item-list .item:hover{background-color:#f1f1f1 !important}.look-up-container .item-list .item *:empty:not(i){display:none}.look-up-container .item-list .item .item-price{margin-right:4px;border-radius:4px;transition:.5s}.look-up-container .item-list .item:last-child .item-price{animation:emphasizePrice .5s ease-in-out 5s backwards}.look-up-container .item-labels{font-size:.8em;color:#666}.look-up-container .item-labels span{margin-right:10px}.look-up-container .form-group{position:relative}.look-up-container .ready-for-scan{opacity:0;transition:.5s;position:absolute;right:0%;width:80px;text-align:right;color:var(--theme-orange--base-bg);padding-top:35px;text-transform:lowercase}.look-up-container #barcode:focus:placeholder-shown+.ready-for-scan{opacity:1}.container.width-auto>.row{padding:5px 0px;border-bottom:1px solid #eee}.keyboard{display:grid;background-color:#f5f5f5;padding:10px;grid-template-columns:repeat(3, 1fr);gap:10px;width:200px;margin:0px auto}.keyboard>*{padding:10px;font-size:18px}.modal-backdrop{display:none}.modal{background-color:rgba(0,0,0,.5)}@keyframes emphasizeItem{from{font-size:1.2em}}@keyframes emphasizePrice{from{margin-left:-10px;padding-left:10px;border-radius:0px 5px 5px 0px;background-color:#000}}@keyframes highlight{from{background-color:#1b6aaa;color:#fff;filter:opacity(0.5)}}";

  function lettersToNumbers(barcode) {
      return barcode
          .replace(/ą/g, '1')
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
          add: 'Add',
          addDescription: 'Add Description',
          addManufacturer: 'Add Manufacturer',
          addPackageFeeNote: 'Add Package Fee',
          ageLimit: 'Age Limit',
          ago: 'ago',
          alcohol: 'Alcohol',
          alternativeLabelFormat: 'Enable alternative label format',
          asMentioned: 'As mentioned',
          attributeName: 'Attribute Name',
          autoLogin: 'Instant Login',
          barcode: 'Barcode',
          barcodeOrName: 'Barcode or name',
          batchNumber: 'Batch Number',
          checked: 'Checked',
          cleanAll: 'Clean All',
          clearAfterPrint: 'Clear after print',
          clickToAdd: 'Click on the item to add it to the print list',
          close: 'Close',
          code: 'Code',
          cost: 'Cost',
          countryOfOriginName: 'Country of Origin Name',
          date: 'Date',
          defaultSaleService: 'Default Sale Service',
          departmentNumber: 'Department',
          deposit: 'Deposit',
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
          itemNotFound: 'Item not found!',
          itemsFound: 'Items found',
          itemUpdated: 'Item updated',
          kiloPrice: 'Price per kilo',
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
          noItemsScanned: 'No items scanned',
          noItemsSelected: 'No items selected!',
          notAllItemsActive: 'Not all selected items are active. Do you want to continue?',
          number: 'Number',
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
          thisIs: 'This is',
          toggleKeyboard: 'Toggle Keyboard',
          tooManyItems: 'Too many items',
          total: 'Total',
          totalPrice: 'Total Price',
          validFrom: 'Valid From',
          validUntil: 'Valid Until',
          vatRate: 'VAT Rate',
          weight: 'Weight',
          weightedItem: 'Weighted item',
          weightedItemAdded: 'Weighted item added',
          weightLabel: 'Weight Label',
          yes: 'Yes',
          zero: 'zero',
      },
      lt: {
          add: 'Pridėti',
          ago: '',
          addDescription: 'Pridėti aprašymą',
          addManufacturer: 'Pridėti gamintoją',
          addPackageFeeNote: 'Pridėti fasavimo maišelį',
          ageLimit: 'Amžiaus limitas',
          alcohol: 'Alkoholis',
          alternativeLabelFormat: 'Etiketėje tik brūkšninis kodas',
          asMentioned: 'Kaip minėjau',
          attributeName: 'Atributo pavadinimas',
          autoLogin: 'Prisijungti automatiškai',
          barcode: 'Brūkšninis kodas',
          barcodeOrName: 'Brūkšninis kodas arba pavadinimas',
          batchNumber: 'Partijos numeris',
          checked: 'Tikrinta prieš',
          cleanAll: 'Išvalyti',
          clearAfterPrint: 'Išvalyti po spausdinimo',
          clickToAdd: 'Paspauskite ant prekės, kad ją pridėtumėte į spausdinimo sąrašą',
          close: 'Uždaryti',
          code: 'Kodas',
          cost: 'Savikaina',
          countryOfOriginName: 'Kilmės šalies pavadinimas',
          date: 'Data',
          defaultSaleService: 'Numatytoji pardavimo paslauga',
          departmentNumber: 'S',
          deposit: 'Tara',
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
          itemCatalog: 'Prekių žinynas',
          itemAdded: 'Prekė pridėta',
          itemCreated: 'Prekė išsaugota',
          itemDetails: 'Prekės informacija',
          itemNotFound: 'Prekė nerasta!',
          itemsFound: ' rasta',
          itemUpdated: 'Prekė atnaujinta',
          kiloPrice: 'Kilogramo kaina',
          labelsAndPrices: 'Etiketės ir kainos',
          leftover: 'Liko',
          loading: 'Kraunama...',
          login: 'Prisijungimas darbo vietoje',
          loginDetailsNotFound: 'Prisijungimo duomenys nerasti',
          manufacturerName: 'Gamintojo pavadinimas',
          markdowns: 'Nukainojimai',
          maxDiscount: 'Max nuolaida',
          measurementUnitCanBeWeighed: 'Prekė gali būti sveriama',
          measurementUnitName: 'Matavimo vieneto pavadinimas',
          minPriceWithVat: 'Min kaina su PVM',
          minQuantity: 'Min kiekis',
          missingBarcode: 'Trūksta brūkšninio kodo',
          missingElements: 'Trūksta UI elementų',
          missingName: 'Trūksta pavadinimo',
          missingWeight: 'Trūksta svorio',
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
          noItemsScanned: 'Nėra skenuotų prekių',
          noItemsSelected: 'Nėra pasirinktų prekių',
          notAllItemsActive: 'Ne visos pasirinktos prekės yra aktyvios. Ar norite tęsti?',
          number: 'Numeris',
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
          thisIs: 'Tai',
          toggleKeyboard: 'Klaviatūra',
          tooManyItems: 'Per daug prekių',
          total: 'Bendra suma',
          totalPrice: 'Apskaičiuota kaina',
          validFrom: 'Galioja nuo',
          validUntil: 'Galioja iki',
          vatRate: 'PVM tarifas',
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

  class UserSession {
      notification = new UINotification();
      interfaceInUse = false;
      isLoggedIn = false;
      admin = false;
      user;
      defaultPermissions = {
          create: false,
          read: false,
          update: false,
          delete: false,
      };
      readPermissions = {
          create: false,
          read: true,
          update: false,
          delete: false,
      };
      constructor() {
          this.user = null;
          this.checkLoginStatus();
      }
      checkLoginStatus() {
          if (currentUser?.name != null) {
              this.isLoggedIn = true;
              this.user = currentUser;
              this.admin = this.user != null ? this.user.typeId <= 3 : false;
              if (!this.admin) {
                  this.limitPermissions();
              }
              return true;
          }
          else if (currentUser != null && currentUser.name == null) {
              this.isLoggedIn = false;
          }
          return false;
      }
      limitPermissions() {
          currentCompanyUser.permissions.crudBankaisaskait = {
              ...this.defaultPermissions,
          };
          currentCompanyUser.permissions.crudKlientai = { ...this.defaultPermissions };
          currentCompanyUser.permissions.crudDokSer = { ...this.defaultPermissions };
          currentCompanyUser.permissions.crudPardavim = { ...this.readPermissions };
          currentCompanyUser.permissions.crudPrekes = { ...this.readPermissions };
          currentCompanyUser.permissions['warehouse-tempFiles'].delete = false;
      }
      addContainer() {
          const h5Elements = document.querySelectorAll('h5');
          h5Elements.forEach((element) => {
              element.remove();
          });
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
          if (optionsButton === null || autoLoginButton === null || form === null) {
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
          if (usernameInput === null || passwordInput === null) {
              this.notification.error(i18n('loginDetailsNotFound'));
              return false;
          }
          const username = await GM.getValue('username', '');
          const password = await GM.getValue('password', '');
          if (username === '' || password === '') {
              this.notification.error(i18n('loginDetailsNotFound'));
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
              this.notification.error(i18n('error'));
              return false;
          }
          let key = form.getAttribute('ng-submit');
          if (key === null) {
              this.notification.error('Recaptcha key not found');
              return false;
          }
          const match = key.match(/"([^"]+)"/);
          if (match === null) {
              this.notification.error('Recaptcha key not found');
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

  var printStyles = "body{margin:0;padding:0}.label{position:relative;background:#fff;color:#000;height:31.75mm;width:57.15mm;border:.5px solid #ffdfd4;margin:0px;box-sizing:border-box;overflow:hidden}.item{height:19mm;overflow:hidden;padding:4px;font-family:Arial,sans-serif}.barcode{white-space:nowrap;position:absolute;bottom:0;z-index:3}.barcode div{font-size:10px;font-family:monospace;margin-left:6px;line-height:1em}.barcode p{margin:0}.deposit{position:absolute;right:2px;bottom:3px;font-family:serif;font-size:18px;font-weight:500;z-index:10}.price{position:absolute;bottom:22px;font-size:50px;right:0;overflow:hidden;object-position:center;margin-right:3px;line-height:1em;font-family:\"Book Antiqua\",serif;padding-right:10px}.alternative .barcode{left:50%;transform:translateX(-50%) scale(1.4);width:max-content}.alternative .barcode div{margin-left:0;font-size:7px}.alternative .price,.alternative .deposit{display:none}.weighted{display:grid;grid-template-columns:auto auto;align-items:center;justify-content:space-between;padding:5px;box-sizing:border-box;writing-mode:vertical-rl;grid-column-gap:4px;grid-row-gap:0px;font-family:\"Arial\";width:100%;height:100%}.weighted .barcode{grid-column:1;position:static;width:11mm;height:11mm}.weighted .item{grid-column:span 2;text-align:left;font-size:11pt;font-size:10pt;max-width:60pt;padding:0px;height:unset}.weighted .fprice{grid-row:2;grid-column:span 2;text-align:center;justify-self:center;align-self:end;font-size:16pt;font-weight:bold;line-height:1em;font-family:\"Book Antiqua\",serif;margin-right:4px}.weighted .kg-price{grid-column:2;justify-self:center;align-self:end}.weighted .kg-text{grid-column:2}.weighted .kg-text,.weighted .weight-text{justify-self:center;align-self:baseline;color:#999;font-size:.8em;line-height:.6}.weighted .weight-text{grid-column:1}.weighted .weight{grid-column:1;justify-self:center;align-self:end}.weighted .expiracy{grid-column:2;text-align:center;justify-self:center;align-self:center;line-height:.9;color:#444;font-size:.8em}.weighted .expiracy span{color:#000}.weighted .manufacturer,.weighted .description{font-size:.7em;grid-column:span 2}.weighted .package{font-size:.7em;grid-column:span 2}.weighted .package{grid-row:3;grid-column:span 2;text-align:center;justify-self:center;align-self:center;margin-right:-5px;margin-left:5px;color:#444;font-size:10px;line-height:.8em}";

  const getDataMatrixMat = (text, rect = false) => {
      var enc = [], cw = 0, ce = 0;
      function push(val) {
          cw = 40 * cw + val;
          if (ce++ == 2) {
              enc.push(++cw >> 8);
              enc.push(cw & 255);
              ce = cw = 0;
          }
      }
      var cost = [
          function (c) { return ((c - 48) & 255) < 10 ? 6 : c < 128 ? 12 : 24; },
          function (c) { return ((c - 48) & 255) < 10 || ((c - 65) & 255) < 26 || c == 32 ? 8 : c < 128 ? 16 : 16 + cost[1](c & 127); },
          function (c) { return ((c - 48) & 255) < 10 || ((c - 97) & 255) < 26 || c == 32 ? 8 : c < 128 ? 16 : 16 + cost[2](c & 127); },
          function (c) { return ((c - 48) & 255) < 10 || ((c - 65) & 255) < 26 || c == 32 || c == 13 || c == 62 || c == 42 ? 8 : 1e9; },
          function (c) { return c >= 32 && c < 95 ? 9 : 1e9; },
          function (c) { return 12; }
      ];
      var latch = [0, 24, 24, 24, 21, 25];
      var count = [0, 12, 12, 12, 12, 25];
      var c, i, p, cm = 0, nm = 0;
      var bytes = [];
      bytes[text.length] = count.slice();
      for (p = text.length; p-- > 0;) {
          for (c = 1e9, i = 0; i < count.length; i++) {
              count[i] += cost[i](text.charCodeAt(p));
              c = Math.min(c, Math.ceil(count[i] / 12) * 12);
          }
          if (cost[0](text.charCodeAt(p)) > 6)
              count[0] = Math.ceil(count[0] / 12) * 12;
          for (i = 0; i < count.length; i++)
              if (c + latch[i] < count[i])
                  count[i] = c + latch[i];
          bytes[p] = count.slice();
      }
      for (p = 0;; cm = nm) {
          c = bytes[p][cm] - latch[cm];
          if (p + [0, 2, 2, 2, 3, 0][cm] >= text.length)
              nm = 0;
          else
              for (i = cost.length; i-- > 0;)
                  if (Math.ceil((bytes[p + 1][i] + cost[i](text.charCodeAt(p))) / 12) * 12 == c)
                      nm = i;
          if (cm != nm && cm > 0)
              if (cm < 4)
                  enc.push(254);
              else if (cm == 4)
                  enc.push(31 | cw & 255);
              else {
                  if (ce > 249)
                      enc.push((ce / 250 + 250 + (149 * (enc.length + 1)) % 255) & 255);
                  enc.push((ce % 250 + (149 * (enc.length + 1)) % 255 + 1) & 255);
                  for (; ce > 0; ce--)
                      enc.push((text.charCodeAt(p - ce) + (149 * (enc.length + 1)) % 255 + 1) & 255);
              }
          if (p >= text.length)
              break;
          if (cm != nm)
              cw = ce = 0;
          if (cm != nm && nm > 0)
              enc.push([230, 239, 238, 240, 231][nm - 1]);
          if (nm == 0) {
              c = text.charCodeAt(p++);
              i = (c - 48) & 255;
              if (i < 10 && p < text.length && ((text.charCodeAt(p) - 48) & 255) < 10)
                  enc.push(i * 10 + text.charCodeAt(p++) - 48 + 130);
              else {
                  if (c > 127)
                      enc.push(235);
                  enc.push((c & 127) + 1);
              }
              if (cm == 4 || ce < 0)
                  ce--;
          }
          else if (nm < 4) {
              var set = [[31, 0, 32, 119, 47, 133, 57, 179, 64, 173, 90, 207, 95, 277, 127, 386, 255, 1],
                  [31, 0, 32, 119, 47, 133, 57, 179, 64, 173, 90, 258, 95, 277, 122, 335, 127, 386, 255, 1],
                  [13, 55, 32, 119, 42, 167, 57, 179, 62, 243, 90, 207, 255, 3]][nm - 1];
              do {
                  c = text.charCodeAt(p++);
                  if (c > 127) {
                      push(1);
                      push(30);
                      c &= 127;
                  }
                  for (i = 0; c > set[i]; i += 2)
                      ;
                  if ((set[i + 1] & 3) < 3)
                      push(set[i + 1] & 3);
                  push(c - (set[i + 1] >> 2));
              } while (ce > 0);
          }
          else if (nm == 4) {
              if (ce > 0)
                  enc.push(255 & cw + (text.charCodeAt(p++) & 63));
              for (cw = ce = 0; ce < 3; ce++)
                  cw = 64 * (cw + (text.charCodeAt(p++) & 63));
              enc.push(cw >> 16);
              enc.push((cw >> 8) & 255);
          }
          else {
              p++;
              ce++;
          }
      }
      var el = enc.length;
      var h, w, nc = 1, nr = 1, fw, fh;
      var j = -1, l, r, s, b = 1, k;
      if (ce == -1 || (cm && cm < 5))
          nm = 1;
      if (rect && el - nm < 50) {
          k = [16, 7, 28, 11, 24, 14, 32, 18, 32, 24, 44, 28];
          do {
              w = k[++j];
              h = 6 + (j & 12);
              l = w * h / 8;
          } while (l - k[++j] < el - nm);
          if (w > 25)
              nc = 2;
      }
      else {
          w = h = 6;
          i = 2;
          k = [5, 7, 10, 12, 14, 18, 20, 24, 28, 36, 42, 48, 56, 68, 84,
              112, 144, 192, 224, 272, 336, 408, 496, 620];
          do {
              if (++j == k.length)
                  return [];
              if (w > 11 * i)
                  i = 4 + i & 12;
              w = h += i;
              l = (w * h) >> 3;
          } while (l - k[j] < el - nm);
          if (w > 27)
              nr = nc = 2 * Math.floor(w / 54) + 2;
          if (l > 255)
              b = 2 * (l >> 9) + 2;
      }
      s = k[j];
      if (l - s + 1 == el && nm > 0) {
          el--;
          if (ce == -1)
              enc[el - 1] ^= 31 ^ (enc[el] - 1) & 63;
      }
      fw = w / nc;
      fh = h / nr;
      if (el < l - s)
          enc[el++] = 129;
      while (el < l - s)
          enc[el++] = (((149 * el) % 253) + 130) % 254;
      s /= b;
      var rs = new Array(70), rc = new Array(70);
      var lg = new Array(256), ex = new Array(255);
      for (j = 1, i = 0; i < 255; i++) {
          ex[i] = j;
          lg[j] = i;
          j += j;
          if (j > 255)
              j ^= 301;
      }
      for (rs[s] = 0, i = 1; i <= s; i++)
          for (j = s - i, rs[j] = 1; j < s; j++)
              rs[j] = rs[j + 1] ^ ex[(lg[rs[j]] + i) % 255];
      for (c = 0; c < b; c++) {
          for (i = 0; i <= s; i++)
              rc[i] = 0;
          for (i = c; i < el; i += b)
              for (j = 0, k = rc[0] ^ enc[i]; j < s; j++)
                  rc[j] = rc[j + 1] ^ (k ? ex[(lg[rs[j]] + lg[k]) % 255] : 0);
          for (i = 0; i < s; i++)
              enc[el + c + i * b] = rc[i];
      }
      var mat = Array(h + 2 * nr).fill(null).map(function () { return []; });
      for (i = 0; i < w + 2 * nc; i += fw + 2)
          for (j = 0; j < h; j++) {
              mat[j + (j / fh | 0) * 2 + 1][i] = 1;
              if ((j & 1) == 1)
                  mat[j + (j / fh | 0) * 2][i + fw + 1] = 1;
          }
      for (i = 0; i < h + 2 * nr; i += fh + 2)
          for (j = 0; j < w + 2 * nc; j++) {
              mat[i + fh + 1][j] = 1;
              if ((j & 1) == 0)
                  mat[i][j] = 1;
          }
      s = 2;
      c = 0;
      r = 4;
      for (i = 0; i < l; r -= s, c += s) {
          if (r == h - 3 && c == -1)
              k = [w, 6 - h, w, 5 - h, w, 4 - h, w, 3 - h, w - 1, 3 - h, 3, 2, 2, 2, 1, 2];
          else if (r == h + 1 && c == 1 && (w & 7) == 0 && (h & 7) == 6)
              k = [w - 2, -h, w - 3, -h, w - 4, -h, w - 2, -1 - h, w - 3, -1 - h, w - 4, -1 - h, w - 2, -2, -1, -2];
          else {
              if (r == 0 && c == w - 2 && (w & 3))
                  continue;
              if (r < 0 || c >= w || r >= h || c < 0) {
                  s = -s;
                  r += 2 + s / 2;
                  c += 2 - s / 2;
                  while (r < 0 || c >= w || r >= h || c < 0) {
                      r -= s;
                      c += s;
                  }
              }
              if (r == h - 2 && c == 0 && (w & 3))
                  k = [w - 1, 3 - h, w - 1, 2 - h, w - 2, 2 - h, w - 3, 2 - h, w - 4, 2 - h, 0, 1, 0, 0, 0, -1];
              else if (r == h - 2 && c == 0 && (w & 7) == 4)
                  k = [w - 1, 5 - h, w - 1, 4 - h, w - 1, 3 - h, w - 1, 2 - h, w - 2, 2 - h, 0, 1, 0, 0, 0, -1];
              else if (r == 1 && c == w - 1 && (w & 7) == 0 && (h & 7) == 6)
                  continue;
              else
                  k = [0, 0, -1, 0, -2, 0, 0, -1, -1, -1, -2, -1, -1, -2, -2, -2];
          }
          for (el = enc[i++], j = 0; el > 0; j += 2, el >>= 1) {
              if (el & 1) {
                  var x = c + k[j], y = r + k[j + 1];
                  if (x < 0) {
                      x += w;
                      y += 4 - ((w + 4) & 7);
                  }
                  if (y < 0) {
                      y += h;
                      x += 4 - ((h + 4) & 7);
                  }
                  mat[y + 2 * (y / fh | 0) + 1][x + 2 * (x / fw | 0) + 1] = 1;
              }
          }
      }
      for (i = w; i & 3; i--)
          mat[i][i] = 1;
      return mat;
  };
  const toPath = (mat) => {
      var path = "", x, y;
      mat.forEach(function (y) { y.unshift(0); });
      mat.push([]);
      mat.unshift([]);
      for (;;) {
          for (y = 0; y + 2 < mat.length; y++)
              if ((x = mat[y + 1].indexOf(1) - 1) >= 0 || (x = mat[y + 1].indexOf(5) - 1) >= 0)
                  break;
          if (y + 2 == mat.length || path.length > 1e7)
              return path;
          var c = mat[y + 1][x + 1] >> 2, p = "";
          for (var x0 = x, y0 = y, d = 1; p.length < 1e6;) {
              do
                  x += 2 * d - 1;
              while ((mat[y][x + d] ^ mat[y + 1][x + d]) & mat[y + d][x + d] & 1);
              d ^= mat[y + d][x + d] & 1;
              do
                  mat[d ? ++y : y--][x + 1] ^= 2;
              while ((mat[y + d][x] ^ mat[y + d][x + 1]) & mat[y + d][x + 1 - d] & 1);
              if (x == x0 && y == y0)
                  break;
              d ^= 1 ^ mat[y + d][x + 1 - d] & 1;
              if (c)
                  p = "V" + y + "H" + x + p;
              else
                  p += "H" + x + "V" + y;
          }
          path += "M" + x + " " + y + p + (c ? "V" + y : "H" + x) + "Z";
          for (d = 0, y = 1; y < mat.length - 1; y++)
              for (x = 1; x < mat[y].length; x++) {
                  d ^= (mat[y][x] >> 1) & 1;
                  mat[y][x] = 5 * d ^ mat[y][x] & 5;
              }
      }
  };
  class Code128 {
      text;
      constructor(text) {
          this.text = text;
      }
      encode() {
          var t = 3, enc = [], i, j, c, mat = [];
          for (i = 0; i < this.text.length; i++) {
              c = this.text.charCodeAt(i);
              if (t != 2) {
                  for (j = 0; j + i < this.text.length; j++)
                      if (this.text.charCodeAt(i + j) - 48 >>> 0 > 9)
                          break;
                  if ((j > 1 && i == 0) || (j > 3 && (i + j < this.text.length || (j & 1) == 0))) {
                      enc.push(i == 0 ? 105 : 99);
                      t = 2;
                  }
              }
              if (t == 2)
                  if (c - 48 >>> 0 < 10 && i + 1 < this.text.length && this.text.charCodeAt(i + 1) - 48 >>> 0 < 10)
                      enc.push(+this.text.substr(i++, 2));
                  else
                      t = 3;
              if (t != 2) {
                  if (t > 2 || ((c & 127) < 32 && t) || ((c & 127) > 95 && !t)) {
                      for (j = t > 2 ? i : i + 1; j < this.text.length; j++)
                          if ((this.text.charCodeAt(j) - 32) & 64)
                              break;
                      j = j == this.text.length || (this.text.charCodeAt(j) & 96) ? 1 : 0;
                      enc.push(i == 0 ? 103 + j : j != t ? 101 - j : 98);
                      t = j;
                  }
                  if (c > 127)
                      enc.push(101 - t);
                  enc.push(((c & 127) + 64) % 96);
              }
          }
          if (i == 0)
              enc.push(103);
          j = enc[0];
          for (i = 1; i < enc.length; i++)
              j += i * enc[i];
          enc.push(j % 103);
          enc.push(106);
          c = [358, 310, 307, 76, 70, 38, 100, 98, 50, 292, 290, 274, 206, 110, 103, 230, 118, 115, 313, 302, 295, 370, 314, 439, 422, 406, 403,
              434, 410, 409, 364, 355, 283, 140, 44, 35, 196, 52, 49, 324, 276, 273, 220, 199, 55, 236, 227, 59, 443, 327, 279, 372, 369, 375,
              428, 419, 395, 436, 433, 397, 445, 289, 453, 152, 134, 88, 67, 22, 19, 200, 194, 104, 97, 26, 25, 265, 296, 477, 266, 61, 158, 94,
              79, 242, 122, 121, 466, 458, 457, 367, 379, 475, 188, 143, 47, 244, 241, 468, 465, 239, 247, 431, 471, 322, 328, 334, 285];
          for (t = i = 0; i < enc.length; i++, t++) {
              mat[t++] = 1;
              for (j = 256; j > 0; j >>= 1, t++)
                  if (c[enc[i]] & j)
                      mat[t] = 1;
          }
          mat[t++] = mat[t] = 1;
          return [mat];
      }
      toHtml(mat, size = 3, blocks = 5) {
          if (!Array.isArray(size))
              size = [size || 3, size || 3];
          let s = "barcode" + size[0] + size[1], b, ss;
          let html = "<style> ." + s + " div {float:left; margin:0; height:" + size[1] + "px}";
          blocks = blocks || 5;
          for (var i = 0; i < blocks; i++)
              for (var j = 0; j < blocks; j++)
                  html += "." + s + " .bar" + j + i + " {border-left:" + j * size[0] + "px solid; margin-right:" + i * size[0] + "px}";
          html += "</style><div class=" + s + " style='line-height:" + size[1] + "px; display:inline-block'>";
          for (i = 0; i < mat.length; i++)
              for (j = 0; j < mat[i].length;) {
                  if (i && !j)
                      html += "<br style='clear:both' />";
                  for (b = 0; j < mat[i].length; b++, j++)
                      if (!mat[i][j] || b + 1 == blocks)
                          break;
                  for (ss = 0; j < mat[i].length; ss++, j++)
                      if (mat[i][j] || ss + 1 == blocks)
                          break;
                  html += "<div class=bar" + b + ss + "></div>";
              }
          return html + "</div>";
      }
  }

  class LabelGenerator {
      items = [];
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
          else if (data.weight != null) {
              return this.generateWeightLabel(data);
          }
          const item = document.createElement('div');
          item.className = 'item';
          item.innerHTML = this.makeUpperCaseBold(data.name);
          if (data.barcode != null) {
              const barcode = document.createElement('div');
              barcode.className = 'barcode';
              const barcodeText = document.createElement('div');
              barcodeText.innerHTML = (data.departmentNumber != null ? 'S' + data.departmentNumber + ' ' : '') + data.barcode;
              barcode.appendChild(barcodeText);
              const code128 = new Code128(data.barcode);
              const p = document.createElement('p');
              p.innerHTML = code128.toHtml(code128.encode(), this.alternativeLabelFormat ? [1, 50] : [1, 15]);
              barcode.appendChild(p);
              label.appendChild(barcode);
          }
          if (data.priceWithVat != 0) {
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
              deposit.textContent = 'Tara +0.10';
              label.appendChild(deposit);
          }
          else if (data.measurementUnitCanBeWeighed == true) {
              const deposit = document.createElement('div');
              deposit.className = 'deposit';
              deposit.textContent = '/ 1 ' + data.measurementUnitName;
              label.appendChild(deposit);
          }
          label.appendChild(item);
          return label;
      }
      generateWeightLabel(data) {
          const parent = document.createElement('div');
          if (data.weight == null || data.totalPrice == null || data.priceWithVat == null || data.barcode == null || data.barcode.length > 13) {
              return parent;
          }
          parent.className = 'label';
          const label = document.createElement('div');
          label.className = 'weighted';
          const item = document.createElement('div');
          item.className = 'item';
          item.innerHTML = data.name;
          label.appendChild(item);
          const price = document.createElement('div');
          price.className = 'fprice';
          price.textContent = (data.totalPrice != null) ? data.totalPrice.toFixed(2) + ' €' : '';
          label.appendChild(price);
          const weight = document.createElement('div');
          weight.className = 'weight';
          if (data.measurementUnitCanBeWeighed == true) {
              weight.textContent = data.weight.toFixed(3);
          }
          else {
              weight.textContent = data.weight.toString();
          }
          label.appendChild(weight);
          const kgPrice = document.createElement('div');
          kgPrice.className = 'kg-price';
          kgPrice.textContent = data.priceWithVat.toFixed(2);
          label.appendChild(kgPrice);
          const weightText = document.createElement('div');
          weightText.className = 'weight-text';
          weightText.textContent = data.measurementUnitName;
          label.appendChild(weightText);
          const kgText = document.createElement('div');
          kgText.className = 'kg-text';
          kgText.textContent = '€/' + data.measurementUnitName;
          label.appendChild(kgText);
          const barcode = document.createElement('div');
          barcode.className = 'barcode';
          const barcodeString = (data.addPackageFeeNote == true ? '1102\r\n' : '') + '2200' + '0'.repeat(13 - data.barcode.length) + data.barcode + '0'.repeat(5 - data.weight.toFixed(3).length) + data.weight.toFixed(3).replace('.', '');
          const svgNS = "http://www.w3.org/2000/svg";
          const svg = document.createElementNS(svgNS, 'svg');
          const path = document.createElementNS(svgNS, 'path');
          path.setAttribute('transform', 'scale(1)');
          svg.appendChild(path);
          barcode.appendChild(svg);
          path.setAttribute('d', toPath(getDataMatrixMat(barcodeString)));
          svg.setAttribute('class', 'datamatrix');
          svg.setAttribute('viewBox', '0 0 18 18');
          label.appendChild(barcode);
          if (data.expiryDate != null) {
              const expiryText = document.createElement('div');
              expiryText.className = 'expiracy';
              expiryText.textContent = 'Geriausia iki ';
              const expiryDate = document.createElement('span');
              expiryDate.textContent = new Date(data.expiryDate).toLocaleDateString('lt-LT', { month: '2-digit', day: '2-digit' });
              expiryText.appendChild(expiryDate);
              label.appendChild(expiryText);
          }
          if (data.addManufacturer == true && data.manufacturerName != null) {
              const manufacturer = document.createElement('div');
              manufacturer.className = 'manufacturer';
              manufacturer.textContent = data.manufacturerName;
              label.appendChild(manufacturer);
          }
          if (data.addPackageFeeNote == true) {
              const packageCode = document.createElement('div');
              packageCode.className = 'package';
              packageCode.textContent = '+ 0,01 (fas. maišelis)';
              label.appendChild(packageCode);
          }
          parent.appendChild(label);
          return parent;
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
          style.innerHTML = `${printStyles}`;
          popup.document.head.appendChild(style);
          labels.forEach(label => {
              popup.document.body.appendChild(label);
          });
          const images = popup.document.getElementsByTagName('img');
          const promises = Array.from(images).map(image => {
              return new Promise((resolve, reject) => {
                  image.onload = resolve;
                  image.onerror = reject;
              });
          });
          await Promise.all(promises);
          popup.addEventListener('afterprint', () => {
              popup.close();
          });
          popup.print();
      }
  }

  function mainHTML(i18n) { return `<div class="container look-up-container"> <div class="row"> <div class="col-md-4 form-section"> <h4 class="header">${i18n('labelsAndPrices')}</h4> <div class="form-group input-group"> <input type="text" class="form-control" id="barcode" placeholder="${i18n('enterBarcode')}" autocomplete="off"> <div class="ready-for-scan pull-right text-success">${i18n('readyForScan')}</div> <button type="button" class="btn btn-info" id="searchButton">${i18n('code')}</button> </div> <div class="form-group"> <div class="checkbox-form hidden-sm"> <label> <input type="checkbox" class="ace" id="alternativeLabelFormat"> <span class="lbl display-inline">&nbsp;${i18n('alternativeLabelFormat')}</span> </label> </div> <div class="checkbox-form"> <label> <input type="checkbox" class="ace" id="sayOutLoud" checked> <span class="lbl display-inline">&nbsp;${i18n('sayOutLoud')}</span> </label> </div> <div class="checkbox-form"> <label> <input type="checkbox" class="ace" id="showStock"> <span class="lbl display-inline">&nbsp;${i18n('showStock')}</span> </label> </div> </div> <div class="clearfix margin-bottom-10"> <div class="pull-right"> <button type="button" class="btn btn-purple" id="printButton"> <i class="fa fa-print"></i>&nbsp;${i18n('print')}</button> <button type="button" class="btn btn-danger" id="cleanAllButton">${i18n('cleanAll')}</button> </div> </div> </div> <div class="col-md-8 load-data"> <div class="load-overlay" style="display:none" id="loadingOverlay"> <div> <i class="fa fa-5x fa-b1-loader blue"></i> </div> </div> <div class="item-list"> <div class="alert alert-info text-center">${i18n('noItemsScanned')}</div> <div class="alert-xs grey text-center">${i18n('help')}</div> </div> </div> </div>
</div>`; }

  class TextToVoice {
      language;
      notifier;
      apiKey = null;
      numbers;
      languages = {
          'lt-LT': {
              units: ['', 'vienas', 'du', 'trys', 'keturi', 'penki', 'šeši', 'septyni', 'aštuoni', 'devyni'],
              teens: ['dešimt', 'vienuolika', 'dvylika', 'trylika', 'keturiolika', 'penkiolika', 'šešiolika', 'septyniolika', 'aštuoniolika', 'devyniolika'],
              tens: ['', '', 'dvidešimt', 'trisdešimt', 'keturiasdešimt', 'penkiasdešimt', 'šešiasdešimt', 'septyniasdešimt', 'aštuoniasdešimt', 'devyniasdešimt'],
              hundreds: ['', 'šimtas', 'du šimtai', 'trys šimtai', 'keturi šimtai', 'penki šimtai', 'šeši šimtai', 'septyni šimtai', 'aštuoni šimtai', 'devyni šimtai'],
          },
          'en-GB': {
              units: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
              teens: ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
              tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
              hundreds: ['', 'one hundred', 'two hundred', 'three hundred', 'four hundred', 'five hundred', 'six hundred', 'seven hundred', 'eight hundred', 'nine hundred'],
          }
      };
      constructor(notifier) {
          this.language = window.navigator.language.split('-')[0];
          if (this.language == 'lt') {
              this.language = 'lt-LT';
          }
          else {
              this.language = 'en-GB';
          }
          this.numbers = this.languages[this.language];
          this.notifier = notifier;
          this.checkApiKey();
      }
      async checkApiKey() {
          this.apiKey = await GM.getValue('api-key', null);
          if (this.apiKey != null && this.apiKey.length < 20) {
              this.apiKey = null;
              this.notifier.error(i18n('invalidApiKey'));
          }
      }
      async speak(text) {
          const audio = new Audio(await this.getAudioUrl(text));
          void audio.play();
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
                  voice: {
                      languageCode: this.language,
                      ssmlGender: 'MALE'
                  },
                  audioConfig: { audioEncoding: 'MP3' }
              })
          });
          const data = await response.json();
          if (data.audioContent == null) {
              this.notifier.error({ title: i18n('error'), message: JSON.stringify(data) });
              return;
          }
          const audioContent = data.audioContent;
          const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
          return URL.createObjectURL(audioBlob);
      }
      numberToWords(number) {
          let words = [];
          if (number === 0) {
              words.push(i18n('zero'));
          }
          else {
              const unitsPart = number % 10;
              const tensPart = Math.floor(number / 10) % 10;
              const hundredsPart = Math.floor(number / 100);
              if (hundredsPart > 0) {
                  words.push(this.numbers.hundreds[hundredsPart]);
              }
              if (tensPart > 1) {
                  words.push(this.numbers.tens[tensPart]);
              }
              if (tensPart === 1) {
                  words.push(this.numbers.teens[unitsPart]);
              }
              else {
                  words.push(this.numbers.units[unitsPart]);
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
              if (integer !== 0 && this.language == 'lt-LT') {
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
              else if (integer > 1 && this.language == 'en-GB') {
                  words.push('euros');
              }
              else if (integer === 1 && this.language == 'en-GB') {
                  words.push('euro');
              }
              words.push(this.numberToWords(decimal));
              if (this.language == 'en-GB' && decimal === 1) {
                  words.push('cent');
              }
              else if (this.language == 'en-GB') {
                  words.push('cents');
              }
              else if (decimal === 1 || (decimal % 10 === 1 && decimal % 100 !== 11)) {
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
  }

  class MarkdownModal {
      request;
      $uibModal;
      modalScope;
      instances = [];
      constructor(request) {
          this.request = request;
          const injector = angular.element(document.body).injector();
          const $rootScope = injector.get('$rootScope');
          this.$uibModal = injector.get('$uibModal');
          this.modalScope = $rootScope.$new(true);
          this.initializeScope();
      }
      initializeScope() {
          this.modalScope.title = i18n('markdowns');
          this.modalScope.tableData = [];
          this.modalScope.loadData = this.loadData.bind(this);
          this.modalScope.showSaleItems = this.showSaleItems.bind(this);
          this.modalScope.noDataMessage = i18n('loading');
          this.modalScope.closeModal = this.closeModal.bind(this);
      }
      open() {
          const modalInstance = this.$uibModal.open({
              animation: true,
              template: `
        <div class="modal-header">
        <button type="button" class="close" ng-click="closeModal()">
          <span>&times;</span>
        </button>
          <h4 class="modal-title">${i18n('markdowns')}</h4>
        </div>
        <div class="modal-body">
          <div ng-if="tableData.length === 0" class="alert alert-info">{{ noDataMessage }}</div>
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>${i18n('number')}</th>
                <th>${i18n('date')}</th>
                <th>${i18n('discount')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="row in tableData">
                <td>{{row.series}} {{row.number}}</td>
                <td>{{row.saleDate}}</td>
                <td>{{row.discount}}</td>
                <td>
                  <button class="btn btn-xs btn-block btn-primary" ng-click="showSaleItems(row.id, row.saleDate)">
                    ${i18n('show')}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
              scope: this.modalScope,
              size: 'lg',
          });
          this.instances.push(modalInstance);
          if (this.modalScope.tableData.length === 0) {
              void this.loadData();
          }
      }
      async loadData() {
          const sales = await this.request.getSales('nur');
          if (!sales) {
              this.modalScope.tableData = [];
              this.modalScope.noDataMessage = i18n('noDataFound');
          }
          else {
              this.modalScope.tableData = sales.data.map((sale) => ({
                  id: sale.id,
                  series: sale.series,
                  number: sale.number,
                  saleDate: sale.saleDate,
                  discount: sale.discount,
              }));
          }
          this.modalScope.$apply();
      }
      async showSaleItems(id, date) {
          const items = await this.request.getSaleItems(id);
          const modalInstance = this.$uibModal.open({
              animation: true,
              template: `
        <div class="modal-header">
        <button type="button" class="close" ng-click="closeModal()">
          <span>&times;</span>
        </button>
          <h4 class="modal-title">${i18n('markdowns')} <span class="text-primary">${date}</span></h4>
        </div>
        <div class="modal-body">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>${i18n('name')}</th>
                <th>${i18n('quantity')}</th>
                <th>${i18n('total')}</th>
                <th>${i18n('discount')}</th>
                <th>${i18n('discountRate')}</th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="item in saleItems">
                <td>{{item.itemId}}</td>
                <td>{{item.virtualName}}</td>
                <td>{{item.quantity}} {{item.virtualUnit.measurementUnitName}}</td>
                <td>{{item.total.toFixed(2)}}</td>
                <td>{{item.discount}}</td>
                <td>{{item.discountRate}}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" ng-click="closeModal()">${i18n('close')}</button>
        </div>
      `,
              scope: this.modalScope,
              size: 'lg',
          });
          this.modalScope.saleItems =
              items?.data.map((item) => ({
                  itemId: item.itemId,
                  virtualName: item.virtualName,
                  quantity: item.quantity,
                  total: item.sumWithoutVat + item.vat,
                  discount: item.discount,
                  discountRate: item.discountRate,
                  virtualUnit: item.virtualUnit,
              })) || [];
          this.modalScope.saleItems = this.modalScope.saleItems.filter((item) => item.discount < 0);
          this.instances.push(modalInstance);
      }
      closeModal() {
          if (this.instances.length > 0) {
              this.instances.pop().close();
          }
      }
  }

  function modalHTML(i18n) { return ` <div class="modal-header"> <button type="button" class="close" ng-click="close()" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> <h4 class="modal-title" id="weightLabelModalLabel">${i18n('weightLabel')}</h4> </div> <div class="modal-body {{ item.weight > 9999 ? 'background-white-red' : '' }}"> <div class="form"> <div class="form-group"> <label for="productName">${i18n('name')}</label> <input type="text" class="form-control" ng-model="item.name" readonly> </div> <div class="row"> <div class="form-group col-sm-4"> <label for="productWeight" >${i18n('weight')} (g)</label> <input type="text" class="form-control" ng-model="item.weight" ng-keyup="handleWeightChange(item.weight)" ng-keydown="hideVirtualKeyboard()"> </div> <div class="form-group col-sm-4"> <label for="totalPrice">${i18n('totalPrice')} (EUR)</label> <input type="number" step="0.01" class="form-control" readonly ng-model="item.totalPrice" > </div> <div class="form-group col-sm-4"> <label for="kgPrice">${i18n('pricePerKg')} (EUR)</label> <input type="number" step="0.01" class="form-control" readonly ng-model="item.priceWithVat"> </div> </div> <div class="row"> <div class="col-sm-6"> <div class="form-group"> <label for="expiryDate">${i18n('expiryDate')}</label> <input type="date" class="form-control" ng-model="item.expiryDate" ng-click="picker($event)"> </div> <div class="form-group"> <div class="checkbox-form"> <label> <input type="checkbox" class="ace" ng-model="item.addManufacturer"> <span class="lbl display-inline">&nbsp;${i18n('addManufacturer')}&nbsp; {{ item.manufacturerName }}</span> </label> </div> <div class="checkbox-form"> <label> <input type="checkbox" class="ace" ng-model="item.addPackageFeeNote" checked> <span class="lbl display-inline">&nbsp;${i18n('addPackageFeeNote')}</span> </label> </div> </div> </div> <div class="col-sm-6" ng-show="virtualKeyboardVisible"> <div class="keyboard"> <button class="key btn" ng-click="key('1')">1</button> <button class="key btn" ng-click="key('2')">2</button> <button class="key btn" ng-click="key('3')">3</button> <button class="key btn" ng-click="key('4')">4</button> <button class="key btn" ng-click="key('5')">5</button> <button class="key btn" ng-click="key('6')">6</button> <button class="key btn" ng-click="key('7')">7</button> <button class="key btn" ng-click="key('8')">8</button> <button class="key btn" ng-click="key('9')">9</button> <button class="key btn" ng-click="key('0')">0</button> <button class="key btn btn-grey" ng-click="key('c')">C</button> <button class="key btn btn-danger backspace" ng-click="key('d')">⌫</button> </div> </div> </div> </div> </div> <div class="modal-footer"> <button type="button" class="btn btn-secondary" ng-click="close()"> <i class="fa fa-times"></i>&nbsp;${i18n('close')}</button> <button type="button" class="btn btn-primary" ng-click="add()" > <i class="fa fa-plus"></i>&nbsp;${i18n('add')}</button> <button type="button" class="btn btn-purple" ng-click="print()" "> <i class="fa fa-print"></i>&nbsp;${i18n('print')}</button> </div>`; }

  class WeightLabelModal {
      notifier;
      interface;
      $uibModal;
      modalScope;
      constructor(notifier, labelerInterface) {
          this.notifier = notifier;
          this.interface = labelerInterface;
          const injector = angular.element(document.body).injector();
          const $rootScope = injector.get('$rootScope');
          this.$uibModal = injector.get('$uibModal');
          this.modalScope = $rootScope.$new(true);
          this.initializeModalScope();
      }
      initializeModalScope() {
          this.modalScope.item = null;
          this.modalScope.weight = '';
          this.modalScope.virtualKeyboardVisible = true;
          this.modalScope.hideVirtualKeyboard = this.hideVirtualKeyboard.bind(this);
          this.modalScope.handleWeightChange = this.handleWeightChange.bind(this);
          this.modalScope.key = this.key.bind(this);
          this.modalScope.add = this.add.bind(this);
          this.modalScope.print = this.print.bind(this);
          this.modalScope.picker = this.showPicker.bind(this);
      }
      hideVirtualKeyboard() {
          this.modalScope.virtualKeyboardVisible = false;
      }
      key(input) {
          if (input === 'd') {
              this.modalScope.item.weight = this.modalScope.item.weight.slice(0, -1);
          }
          else if (input === 'c') {
              this.modalScope.item.weight = '';
          }
          else {
              this.modalScope.item.weight += input;
          }
          this.modalScope.handleWeightChange();
      }
      openWeightModal(item) {
          if (!item || !item.name || !item.priceWithVat) {
              this.notifier.error(i18n('missingElements'));
              return;
          }
          this.setupModalItem(item);
          const modalInstance = this.$uibModal.open({
              template: modalHTML(i18n),
              scope: this.modalScope,
              windowClass: 'weight-label-modal',
          });
          this.modalScope.close = () => {
              modalInstance.close();
          };
      }
      setupModalItem(item) {
          this.modalScope.item = {
              ...item,
              weight: '',
              addManufacturer: false,
              addPackageFeeNote: true,
          };
          this.modalScope.packageWeight = 0;
      }
      getWeightItem() {
          const item = { ...this.modalScope.item };
          if (!item || !item.weight || isNaN(item.weight)) {
              this.notifier.error(i18n('missingWeight'));
              return null;
          }
          item.weight = this.gToKg(parseFloat(item.weight));
          if (item.weight > 9.999) {
              this.notifier.error(i18n('maxWeight'));
              return null;
          }
          item.addManufacturer =
              !!item.addManufacturer && !!item.manufacturerName?.length;
          return item;
      }
      add() {
          const item = this.getWeightItem();
          if (item) {
              this.notifier.success(i18n('weightedItemAdded'));
              this.interface.proccessItem(item);
          }
      }
      print() {
          const item = this.getWeightItem();
          if (item) {
              this.notifier.success({
                  title: i18n('printJobIsSent'),
                  message: `${item.weight}${item.measurementUnitName}`,
              });
              new LabelGenerator([item], this.interface.settings.alternativeLabelFormat);
          }
      }
      handleWeightChange() {
          if (!this.modalScope.item) {
              return;
          }
          this.modalScope.item.totalPrice = this.interface.calculateTotalPrice(this.modalScope.item.priceWithVat, this.gToKg(this.modalScope.item.weight));
      }
      gToKg(weight) {
          return weight / 1000;
      }
      showPicker(event) {
          const target = event.target;
          if (target?.showPicker) {
              target.showPicker();
          }
      }
  }

  class Request {
      items = {};
      baseUrl = 'https://www.b1.lt';
      path = '/reference-book/items/search';
      csrfToken;
      headers;
      notifier;
      constructor(notifier) {
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
                  const data = await response.json();
                  return data;
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
  }

  class ModalService {
      $uibModal;
      $rootScope;
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
          const modalInstance = this.$uibModal.open({
              animation: true,
              template: config.template,
              scope: modalScope,
              size: config.size || 'lg',
              backdrop: config.backdrop || 'static',
          });
          modalScope.closeModal = () => {
              modalInstance.close();
              modalScope.$destroy();
              config.onClose?.();
          };
      }
  }

  class LabelerInterface {
      notification = new UINotification();
      req = new Request(this.notification);
      textToVoice = new TextToVoice(this.notification);
      modalService = new ModalService();
      items = [];
      active = false;
      settings = {
          alternativeLabelFormat: false,
          sayOutLoud: true,
          showStock: false
      };
      modals;
      loadingIndicator = null;
      mainInput = null;
      itemList = null;
      constructor() {
          this.modals = {
              weight: new WeightLabelModal(this.notification, this),
              markdown: new MarkdownModal(this.req)
          };
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
          if ((navbarShortcuts == null) || (footer == null) || (mainPage == null)) {
              return false;
          }
          this.injectHtml(mainPage);
          this.removeElements(footer, mainPage);
          this.simplifyPage();
          this.cacheElements();
          this.bindEvents();
          return true;
      }
      simplifyPage(navAll = true) {
          this.hideDropdownMenuItems();
          this.changeDocumentTitle();
          this.addNavItems(navAll);
          document.body.classList.add('labeler-interface');
          return true;
      }
      hideDropdownMenuItems() {
          document.querySelectorAll('.dropdown-menu li').forEach((li, index) => {
              if (index < 9) {
                  li.style.display = 'none';
              }
          });
      }
      removeElements(...elements) {
          elements.forEach((el => { el.remove(); }));
      }
      injectHtml(mainPage) {
          mainPage.insertAdjacentHTML('beforebegin', mainHTML(i18n));
      }
      createNavItem(text, onClick, icon) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.className = 'navbar-shortcut';
          a.href = '#';
          a.addEventListener('click', onClick);
          const i = document.createElement('i');
          i.className = 'fa fa-fw ' + icon;
          a.appendChild(i);
          a.appendChild(document.createTextNode(text));
          li.appendChild(a);
          return li;
      }
      addNavItems(navAll = true) {
          const parentElement = document.querySelector('.navbar-shortcuts');
          const isNavInitialized = parentElement != null && parentElement.querySelector('.fa-upload') != null;
          if (parentElement == null) {
              return;
          }
          parentElement.innerHTML = '';
          const ul = document.createElement('ul');
          parentElement.appendChild(ul);
          if (navAll) {
              const markdown = this.createNavItem(i18n('markdowns'), () => {
                  this.modals?.markdown.open();
              }, 'fa-book');
              markdown.setAttribute('data-toggle', 'modal');
              markdown.setAttribute('data-target', '#markdownModal');
              ul.appendChild(markdown);
              const itemsList = this.createNavItem(i18n('itemCatalog'), () => { void this.showReferenceBookItemsModal(); }, 'fa-folder-open');
              ul.appendChild(itemsList);
          }
          else {
              const back = this.createNavItem(i18n('labelsAndPrices'), () => { window.location.href = '/'; }, 'fa-arrow-left');
              ul.appendChild(back);
          }
          const fileManager = this.createNavItem(i18n('files'), () => { void this.showTempFileListModal(); }, 'fa-files-o');
          ul.appendChild(fileManager);
          const logoutButtons = document.querySelectorAll('.nav-user-dropdown__title');
          if (logoutButtons != null && !isNavInitialized) {
              logoutButtons.forEach(button => {
                  const i = document.createElement('i');
                  i.className = 'fa fa-fw fa-power-off';
                  button.appendChild(i);
                  const company = button.querySelector('.nav-user-company');
                  company.style.display = 'none';
              });
          }
      }
      async showReferenceBookItemsModal() {
          await this.modalService.showModal({
              template: `
        <div class="modal-body">
          <div ng-controller="ReferenceBookItems as c" class="row">
            <div class="col-xs-12">
              <div class="margin-bottom-5 row sticky row-no-gutters">
                <button ng-show="!c.grid.config.isLoading" 
                        ng-disabled="selected(c.grid) == 0" 
                        type="button" 
                        class="btn btn-sm btn-purple" 
                        ng-click="print(c.grid.provider.getSelected())">
                  <i class="fa fa-fw fa-print"></i> ` + i18n('print') + `
                </button>
                <button ng-show="!c.grid.config.isLoading" 
                        ng-disabled="!isWeighted(c.grid)" 
                        type="button" 
                        class="btn btn-sm btn-pink" 
                        ng-click="weightLabel(c.grid.provider.getSelected())">
                  <i class="fa fa-fw fa-balance-scale"></i> ` + i18n('weightLabel') + `
                </button>
                <button class="btn btn-sm pull-right" ng-click="closeModal()">
                  <i class="fa fa-fw fa-times"></i> ` + i18n('close') + `
                </button>
              </div>
              <extd-grid
                config="c.grid.config"
                filter="c.grid.filter"
                data="c.grid.data">
              </extd-grid>
            </div>
          </div>
        </div>`,
              scopeProperties: {
                  weightLabel: (a) => {
                      if (!a || a.length !== 1 || !a[0].measurementUnitCanBeWeighed) {
                          this.notification.error(i18n('weightedItem') + '?');
                          return;
                      }
                      this.modals?.weight.openWeightModal(a[0]);
                  },
                  print: (e) => this.print(e),
                  selected: (a) => a.provider.getSelected().length,
                  isWeighted: (a) => {
                      const selected = a.provider.getSelected();
                      return selected.length === 1 && selected[0].measurementUnitCanBeWeighed;
                  },
              },
              size: 'ext',
          });
          await new Promise(resolve => setTimeout(resolve, 2000));
          const dataRows = document.querySelector('.data-rows');
          if (!dataRows) {
              return false;
          }
          const c = angular.element(dataRows).controller().grid;
          c.config.hideTopPager = true;
          c.filter.addRule('isActive', 1);
          c.filter.sort = { id: 'desc' };
          c.reload();
      }
      async showTempFileListModal() {
          await this.modalService.showModal({
              template: `
        <div class="modal-body">
          <temp-file-list type-id="{{typeId}}" open-for-select="openForSelect"></temp-file-list>
        </div>
        <div class="modal-footer">
          <button class="btn" ng-click="closeModal()">
            <i class="fa fa-times"></i> ` + i18n('close') + `
          </button>
        </div>`,
              scopeProperties: {
                  typeId: null,
                  openForSelect: false,
              },
          });
      }
      bindEvents() {
          document.getElementById('cleanAllButton')?.addEventListener('click', () => { this.cleanAll(); });
          document.getElementById('printButton')?.addEventListener('click', () => { this.print(); });
          if (this.mainInput != null) {
              this.mainInput.addEventListener('keypress', this.handleEnterPress(this.searchByBarcode.bind(this, this.mainInput)));
              document.getElementById('searchButton')?.addEventListener('click', this.searchByBarcode.bind(this, this.mainInput));
              this.mainInput.focus();
              document.addEventListener('click', (event) => {
                  let clickedInsideModal = false;
                  const modals = document.querySelectorAll('.modal.in');
                  modals.forEach(modal => {
                      if (modal.contains(event.target)) {
                          clickedInsideModal = true;
                      }
                  });
                  if (!clickedInsideModal && this.mainInput != null) {
                      this.mainInput.focus();
                  }
              });
          }
          this.bindCheckboxChange('alternativeLabelFormat', 'alternativeLabelFormat');
          this.bindCheckboxChange('sayOutLoud', 'sayOutLoud');
          this.bindCheckboxChange('showStock', 'showStock');
      }
      handleEnterPress(callback) {
          return (event) => {
              if (event.key == 'Enter') {
                  callback();
              }
          };
      }
      bindCheckboxChange(elementId, settingKey) {
          document.getElementById(elementId)?.addEventListener('change', (event) => {
              if (event.target instanceof HTMLInputElement) {
                  this.settings[settingKey] = event.target.checked;
              }
          });
      }
      cacheElements() {
          this.itemList = document.querySelector('.item-list');
          this.mainInput = document.getElementById('barcode');
          this.loadingIndicator = document.getElementById('loadingOverlay');
      }
      showLoading() {
          if (this.loadingIndicator != null) {
              this.loadingIndicator.style.display = 'flex';
          }
      }
      hideLoading() {
          if (this.loadingIndicator != null) {
              this.loadingIndicator.style.display = 'none';
          }
      }
      print(items = this.items.filter(item => item)) {
          if (items.length === 0) {
              this.notification.error(i18n('noData'));
              return;
          }
          if (!items.every(item => item.isActive == true && item.barcode != null)) {
              this.notification.warning(i18n('notAllItemsActive'));
          }
          void new LabelGenerator(items, this.settings.alternativeLabelFormat);
          this.cleanAll(true);
      }
      cleanAll(donePrinting = false) {
          this.items = [];
          if (this.itemList == null) {
              console.error('itemList is not defined');
              return;
          }
          if (donePrinting) {
              this.itemList.innerHTML = `<div class="alert alert-success text-center">${i18n('printJobIsSent')}. ${i18n('noItemsScanned')}</div>`;
          }
          else {
              this.itemList.innerHTML = `<div class="alert alert-info text-center">${i18n('noItemsScanned')}</div>`;
          }
      }
      createItemElement(item) {
          const itemElement = document.createElement('div');
          itemElement.className = 'item';
          itemElement.id = item.id ?? '';
          itemElement.innerHTML = this.getItemHtml(item, true);
          if (item.barcode == null || item.isActive == false) {
              itemElement.classList.add('inactive');
          }
          else if (item.weight != null) {
              itemElement.classList.add('mark');
          }
          const cornerButton = this.createItemButton('btn-yellow', 'fa-trash', () => {
              this.removeItem(itemElement, item.id);
          });
          itemElement.appendChild(cornerButton);
          if (item.measurementUnitCanBeWeighed && item.priceWithVat > 0) {
              const tagButton = this.createItemButton('btn-pink', 'fa-balance-scale', () => { this.modals?.weight.openWeightModal(item); });
              itemElement.appendChild(tagButton);
          }
          if (item.priceWithVat > 0) {
              itemElement.querySelector('.item-price')?.addEventListener('click', () => { this.showDetails(item); });
          }
          else if (item.id != null) {
              const priceButton = this.createItemButton('btn-danger', 'fa-euro', () => { void this.quickPriceChange(item); });
              itemElement.appendChild(priceButton);
          }
          return itemElement;
      }
      getItemHtml(item, addLabels) {
          return `
      <div class="item-main">
        ${(item.priceWithVat > 0 ? `<span class="item-price">${(item.totalPrice ?? item.priceWithVat).toFixed(2)}</span>` : '') + (this.settings.showStock ? `<span class="item-stock text-primary"><i class="fa fa-home margin-right-5"></i>${(item.stock || '0')}</span>` : '')}
        <span class="item-name">${item.name}</span>
      </div>` + (addLabels ? `<div class="item-labels">${this.getItemLabelsHtml(item)}</div>` : '');
      }
      getItemLabelsHtml(item) {
          const labels = ['packageCode', 'weight', 'departmentNumber', 'packageQuantity'];
          const ago = this.getSeconds(item.retrievedAt ?? new Date());
          const labelHtml = labels.map(label => item[label] != null ? `<span>${i18n(label)}: ${item[label]}</span>` : '').join('');
          return labelHtml + (item.weight != null && item.priceWithVat != null ? `<span>${i18n('kiloPrice')}: <b>${item.priceWithVat.toFixed(2)}</b></span>` : '')
              + (item.measurementUnitCanBeWeighed ? `<span>${i18n('weightedItem')}</span>` : '')
              + `<span class="text-primary">${this.getAgoText(ago)}</span>`;
      }
      getSeconds(date) {
          if (date == null) {
              return 0;
          }
          const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
          return seconds;
      }
      getAgoText(s) {
          if (s === 0) {
              return '';
          }
          return i18n('checked') + ' ' + s + ' s ' + i18n('ago');
      }
      createItemButton(buttonClass, iconClass, onClick) {
          const button = document.createElement('button');
          button.addEventListener('click', onClick);
          button.className = 'btn btn-sm ' + buttonClass;
          button.type = 'button';
          const i = document.createElement('i');
          i.className = 'fa ' + iconClass;
          button.appendChild(i);
          return button;
      }
      removeItem(element, itemId) {
          element.remove();
          this.items = this.items.filter(item => item.id !== itemId);
      }
      showDetails(item) {
          const filteredItem = Object.fromEntries(Object.entries(item).filter(([key, value]) => value !== null && !key.toString().toLowerCase().includes('id') && !key.toString().toLowerCase().includes('account')));
          const resultString = Object.entries(filteredItem)
              .map(([key, value]) => `
        <div class="row col-xs-12">
          <div class="col-sm-5" >${i18n(key)}:</div>
          <div class="col-sm-7" ${key.includes('price') ? 'ng-click="change(item)"' : ''}>${value}</div>
        </div>
      `)
              .join('');
          const modalTemplate = `
      <div class="modal-header">
        <h5 class="modal-title inline">${i18n('itemDetails')}</h5>
        <button type="button" class="close" aria-label="Close" ng-click="closeModal()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="container width-auto">${resultString}</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-sm" ng-click="closeModal()"
        >${i18n('close')}</button>
      </div>
    `;
          void this.modalService.showModal({
              template: modalTemplate,
              scopeProperties: {
                  item: item,
                  change: (item) => {
                      void this.quickPriceChange(item);
                  }
              }
          });
      }
      async quickPriceChange(item) {
          const price = prompt(i18n('enterNewPrice'), (item.priceWithVat ?? 0).toString());
          if (price == null || item.id == null) {
              this.notification.info(i18n('error'));
              return;
          }
          const data = new Object();
          data.id = item.id.split('-')[0];
          data.isActive = true;
          data.priceWithVat = parseFloat(price.replace(',', '.'));
          if (data.priceWithVat <= 0) {
              this.notification.error(i18n('missingPrice'));
              return;
          }
          data.priceWithoutVat = (data.priceWithVat / 1.21);
          data.priceWithoutVat = Math.round((data.priceWithoutVat + Number.EPSILON) * 10000) / 10000;
          item.priceWithVat = data.priceWithVat;
          item.priceWithoutVat = data.priceWithoutVat;
          await this.req.saveItem(data.id, data);
          this.cleanAll();
      }
      addItemToView(item) {
          const itemElement = this.createItemElement(item);
          if (this.itemList != null) {
              this.itemList.appendChild(itemElement);
              itemElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
          else {
              this.notification.error(i18n('missingElements'));
          }
      }
      proccessItem(item) {
          item.id = this.generateItemId(item.id);
          if (!this.settings.sayOutLoud) ;
          else if (this.settings.showStock && this.settings.sayOutLoud && item.stock != null) {
              void this.textToVoice.speak(item.stock.toString());
              console.info('\t' + item.barcode + '\t' + item.stock);
          }
          else if (this.items.length > 0 && item.priceWithVat > 0 && (this.items[this.items.length - 1]).barcode == item.barcode && item.weight == this.items[this.items.length - 1].weight) {
              void this.textToVoice.speak(i18n('asMentioned') + ', ' + i18n('price') + ' ' + this.textToVoice.digitsToPrice(item.totalPrice ?? item.priceWithVat) + (item.weight !== undefined ? '. ' + i18n('weight') + this.textToVoice.numberToWords(item.weight) + item.measurementUnitName : '') + ' ' + i18n('thisIs') + ' ' + item.name);
          }
          else if (item.priceWithVat > 0) {
              void this.textToVoice.speak(i18n('price') + ' ' + this.textToVoice.digitsToPrice(item.totalPrice ?? item.priceWithVat));
          }
          else {
              void this.textToVoice.speak(i18n('priceNotSet'));
          }
          if (this.items.length === 0 && this.itemList != null) {
              this.itemList.innerHTML = '';
          }
          this.items.push(item);
          this.addItemToView(item);
      }
      canItBePackaged(barcode) {
          const prefix = parseInt(barcode.slice(0, 2), 10);
          return (barcode.toString().length === 13 || barcode.toString().length === 21) && prefix > 20 && prefix < 30;
      }
      searchByBarcode(inputField) {
          const barcode = lettersToNumbers(inputField.value);
          inputField.value = '';
          inputField.focus();
          if (barcode.length == 0) {
              this.notification.error(i18n('missingBarcode'));
              return;
          }
          if (this.canItBePackaged(barcode)) {
              void this.searchforAPackagedItem(barcode);
          }
          else {
              void this.searchItem(barcode);
          }
      }
      async searchforAPackagedItem(barcode) {
          let item = null;
          let barcodePart = barcode;
          if (barcode.length === 13 && barcode.slice(0, 2) === '23' || barcode.slice(0, 2) === '24') {
              barcodePart = barcode.slice(0, 8);
          }
          else if (barcode.length === 13 && barcode.slice(0, 2) === '25' || barcode.slice(0, 2) === '29') {
              barcodePart = barcode.slice(0, 7);
          }
          else if (barcode.length === 21) {
              barcodePart = barcode.slice(4, 17);
          }
          item = await this.req.getItem(barcodePart);
          this.hideLoading();
          if (item != null) {
              item.weight = parseInt((barcode.length > 13) ? barcode.slice(17, 21) : barcode.slice(8, 12), 10) / 1000;
              item.totalPrice = this.calculateTotalPrice(item.priceWithVat, item.weight);
              this.proccessItem(item);
          }
          else {
              this.notFound(barcode);
          }
      }
      async searchItem(barcode) {
          this.showLoading();
          const item = await this.req.getItem(barcode);
          this.hideLoading();
          if (item != null) {
              this.proccessItem(item);
          }
          else {
              this.notFound(barcode);
          }
      }
      notFound(barcode) {
          const item = new Object();
          item.name = i18n('itemNotFound') + ' (' + i18n('barcode') + ': ' + barcode + ')';
          item.barcode = barcode;
          item.isActive = false;
          this.addItemToView(item);
      }
      calculateTotalPrice(priceWithVat, weight) {
          if (priceWithVat == null || weight == null) {
              return 0;
          }
          const totalPrice = priceWithVat * weight;
          return Math.round((totalPrice + Number.EPSILON) * 100) / 100;
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
      generateItemId(id) {
          return id + '-' + Math.random().toString(36).substring(7);
      }
      changeDocumentTitle() {
          document.title = i18n('labelsAndPrices');
      }
  }

  class LabelsUserscript {
      wereButtonsAdded = false;
      pageReady = false;
      notification = new UINotification();
      user = new UserSession();
      interface = new LabelerInterface();
      currentUrl;
      constructor() {
          this.currentUrl = window.location.pathname;
          this.init();
          void this.handleUrlChange(null, this.currentUrl);
          console.debug('LabelsUserscript initialized');
      }
      init() {
          this.overrideHistoryMethods();
          this.setupPopStateListener();
          this.addStyles();
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
          console.info('Url has changed');
          this.pageReady = false;
          if (this.user.isLoggedIn && this.user.admin && !this.interface.isActive()) {
              if (!this.wereButtonsAdded && this.interface.addActivateButton()) {
                  this.wereButtonsAdded = true;
              }
              void new Promise(resolve => setTimeout(resolve, 200));
              let success = false;
              switch (this.currentUrl) {
                  case '/en/reference-book/items':
                  case '/en/warehouse/purchases/edit':
                  case '/reference-book/items':
                  case '/warehouse/purchases/edit':
                      success = await this.addPrintButton();
                      if (success) {
                          setTimeout(() => {
                              if (document.querySelector('.print') == null) {
                                  void this.addPrintButton();
                              }
                          }, 1000);
                      }
                      break;
                  case '/en/reference-book/items/edit':
                  case '/reference-book/items/edit':
                      success = await this.addPrintButton('.btn-ctrl', true);
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
              switch (this.currentUrl) {
                  case '/en/warehouse/light-sales/edit':
                  case '/warehouse/light-sales/edit':
                      this.pageReady = this.interface.simplifyPage(false);
                      break;
                  case '/en/reference-book/items':
                  case '/en/warehouse/purchases/edit':
                  case '/reference-book/items':
                  case '/en/reference-book/items/edit':
                  case '/reference-book/items/edit':
                      this.pageReady = this.interface.simplifyPage(false) && await this.addPrintButton('.buttons-left', true);
                      break;
                  default:
                      this.pageReady = this.interface.init();
                      break;
              }
          }
          else if (!this.user.isLoggedIn && this.currentUrl === '/login') {
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
          const dataRows = document.querySelector('.data-rows');
          if (dataRows == null) {
              this.notification.error(i18n('error'));
              throw new Error('Data rows not found');
          }
          return dataRows;
      }
      extractDataFromAngularItemList() {
          const dataRows = this.getDataRows();
          return angular.element(dataRows).controller().grid.data.filter((a) => a._select);
      }
      async extractDataFromAngularPurchaseView() {
          const dataRows = this.getDataRows();
          const selectedRows = angular.element(dataRows).controller().data.filter((a) => a._select);
          const items = [];
          selectedRows.forEach((row) => {
              items.push({
                  name: row.itemName,
                  barcode: row.itemBarcode,
                  code: row.itemCode,
                  id: row.itemId,
                  priceWithVat: row.itemPriceWithVat,
                  priceWithoutVat: row.itemPriceWithoutVat,
                  measurementUnitName: row.measurementUnitName,
                  isActive: true
              });
          });
          return items;
      }
      extractDataFromAngularItemView() {
          const form = document.querySelector('ng-form');
          if (form == null) {
              this.notification.error(i18n('error'));
              return [];
          }
          const data = angular.element(form).controller().model;
          return [data];
      }
      async getViewItems() {
          let items = [];
          switch (window.location.pathname) {
              case '/en/reference-book/items':
              case '/reference-book/items':
                  items = this.extractDataFromAngularItemList();
                  break;
              case '/en/warehouse/purchases/edit':
              case '/warehouse/purchases/edit':
                  items = await this.extractDataFromAngularPurchaseView();
                  break;
              case '/en/reference-book/items/edit':
              case '/reference-book/items/edit':
                  items = this.extractDataFromAngularItemView();
                  break;
          }
          return items;
      }
      async addPrintButton(parentSelector = '.buttons-left', withName = false) {
          const buttonsLeft = document.querySelector(parentSelector);
          if (buttonsLeft == null) {
              return false;
          }
          const icon = document.querySelector('i.fa-cloud-upload');
          if (icon != null) {
              const grandParent = icon.parentElement?.parentElement;
              if (grandParent != null) {
                  grandParent.remove();
              }
          }
          let printDiv = document.createElement('div');
          printDiv.className = 'print';
          let button = document.createElement('button');
          button.title = i18n('print');
          button.type = 'button';
          button.className = 'btn btn-sm btn-purple';
          let i = document.createElement('i');
          i.className = 'fa fa-fw fa-print';
          button.appendChild(i);
          if (withName) {
              const span = document.createElement('span');
              span.className = 'margin-left-5';
              span.textContent = i18n('print');
              button.appendChild(span);
          }
          button.addEventListener('click', () => {
              void this.printLabels();
          });
          printDiv.appendChild(button);
          buttonsLeft.appendChild(printDiv);
          button = document.createElement('button');
          button.title = i18n('weightLabel');
          button.type = 'button';
          button.className = 'btn btn-sm btn-pink';
          i = document.createElement('i');
          i.className = 'fa fa-fw fa-balance-scale';
          button.appendChild(i);
          if (withName) {
              const span = document.createElement('span');
              span.className = 'margin-left-5';
              span.textContent = i18n('weightLabel');
              button.appendChild(span);
          }
          button.addEventListener('click', () => { void this.goToWeightLabelModal(); });
          printDiv = document.createElement('div');
          printDiv.appendChild(button);
          buttonsLeft.appendChild(printDiv);
          return true;
      }
      async goToWeightLabelModal() {
          const items = await this.getViewItems();
          this.interface.modals?.weight.openWeightModal(items[0]);
      }
      async printLabels() {
          const items = await this.getViewItems();
          if (items.length < 1) {
              this.notification.error(i18n('noItemsSelected'));
              return;
          }
          void new LabelGenerator(items);
      }
      addStyles() {
          const styles = document.createElement('style');
          styles.innerHTML = `${all}`;
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
