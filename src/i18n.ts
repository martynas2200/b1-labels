function lettersToNumbers (barcode: string): string {
  return barcode.replace(/ą/g, '1')
    .replace(/č/g, '2')
    .replace(/ę/g, '3')
    .replace(/ė/g, '4')
    .replace(/į/g, '5')
    .replace(/š/g, '6')
    .replace(/ų/g, '7')
    .replace(/ū/g, '8')
    .replace(/ž/g, '9')
}

const LANGUAGES: Record<string, Record<string, string>> = {
  en: {
    aboutToCheckPackageCode: 'A check for the package codes will be performed, this may take a while',
    alternativeLabelFormat: 'Enable alternative label format',
    apiKeyMissing: 'API Key is missing!',
    askingForPackageCode: 'Are there any selected items that have a package code?',
    autoLogin: 'Auto Login',
    cleanAll: 'Clean All',
    clickToAdd: 'Click on the item to add it to the print list',
    close: 'Close',
    departmentNumber: 'Department',
    deposit: 'Deposit',
    done: 'Done',
    enterBarcode: 'Enter the barcode',
    enterName: 'Enter Name',
    error: 'Error',
    fullBarcode: 'Full Barcode',
    help: 'If you have any problems, contact Martynas',
    inactiveItem: 'The item is inactive. Do you want to continue?',
    invalidBarcode: 'Invalid barcode',
    itemAdded: 'Item added',
    itemDetails: 'Item Details',
    itemNotFound: 'Item not found!',
    itemsFound: 'Items found',
    kiloPrice: 'Kilogram Price',
    labelsAndPrices: 'Labels and Prices',
    login: 'Login',
    loginDetailsNotFound: 'Login details not found',
    missingBarcode: 'Missing barcode',
    missingElements: 'Missing UI elements',
    missingName: 'Missing name',
    nlabelsToBePrinted: ' labels to be printed',
    noData: 'No data to print!',
    noItemsFound: 'No items found',
    noItemsScanned: 'No items scanned',
    noItemsSelected: 'No items selected!',
    notAllItemsActive: 'Not all selected items are active. Do you want to continue?',
    packageCode: 'Package',
    packagedGoodsWillBeScanned: 'Packaged goods will be scanned',
    packageQuantity: 'Package Quantity',
    print: 'Print',
    resetForm: 'Reset form',
    save: 'Save',
    sayOutLoud: 'Say out loud',
    search: 'Search',
    searchByBarcode: 'Search by Barcode',
    searchByName: 'Search by Name',
    searchingFor: 'Searching for',
    searchSuccessful: 'Search successful',
    showLoginOptions: 'Other ways to login',
    simplifyForm: 'Simplify Form',
    weight: 'Weight',
    weightedItem: 'Weighted item'
  },
  lt: {
    aboutToCheckPackageCode: 'Bus atliekamas pakuotės kodų tikrinimas, tai gali užtrukti',
    alternativeLabelFormat: 'Etiketėje tik brūkšninis kodas',
    apiKeyMissing: 'Trūksta API rakto!',
    askingForPackageCode: 'Ar yra pasirinktų prekių, kurios turi pakuotės kodą?',
    autoLogin: 'Prisijungti automatiškai',
    cleanAll: 'Išvalyti',
    clickToAdd: 'Paspauskite ant prekės, kad ją pridėtumėte į spausdinimo sąrašą',
    close: 'Uždaryti',
    departmentNumber: 'S',
    deposit: 'Tara',
    done: 'Atlikta',
    enterBarcode: 'Įveskite brūkšninį kodą',
    enterName: 'Įveskite prekės pavadinimą',
    error: 'Įvyko klaida',
    fullBarcode: 'Pilnas brūkšninis kodas',
    help: 'Jei kyla problemų, kreiptis pas Martyną',
    inactiveItem: 'Prekė yra neaktyvi. Ar norite tęsti?',
    invalidBarcode: 'Neteisingas brūkšninis kodas',
    itemAdded: 'Prekė pridėta',
    itemDetails: 'Prekės informacija',
    itemNotFound: 'Prekė nerasta!',
    itemsFound: ' rasta',
    kiloPrice: 'Kilogramo kaina',
    labelsAndPrices: 'Etiketės ir kainos',
    login: 'Prisijungimas darbo vietoje',
    loginDetailsNotFound: 'Prisijungimo duomenys nerasti',
    missingBarcode: 'Trūksta brūkšninio kodo',
    missingElements: 'Trūksta UI elementų',
    missingName: 'Trūksta pavadinimo',
    nlabelsToBePrinted: ' etiketės bus spausdinamos',
    noData: 'Nepakanka duomenų spausdinimui!',
    noItemsFound: 'Nieko nerasta',
    noItemsScanned: 'Nėra skenuotų prekių',
    noItemsSelected: 'Nėra pasirinktų prekių',
    notAllItemsActive: 'Ne visos pasirinktos prekės yra aktyvios. Ar norite tęsti?',
    packageCode: 'Pakuotė',
    packagedGoodsWillBeScanned: 'Bus skenuojamos fasuotos/sveriamos prekės',
    packageQuantity: 'Pakuotės kiekis',
    print: 'Spausdinti',
    resetForm: 'Atkurti formą',
    save: 'Išsaugoti',
    sayOutLoud: 'Sakyti kainas balsu',
    search: 'Ieškoti',
    searchByBarcode: 'Ieškoti pagal brūkšninį kodą',
    searchByName: 'Ieškoti pagal pavadinimą',
    searchingFor: 'Ieškoma',
    searchSuccessful: 'Paieška sėkminga',
    showLoginOptions: 'Kiti prisijungimo būdai',
    simplifyForm: 'Supaprastinti formą',
    weight: 'Svoris',
    weightedItem: 'Sveriama prekė'
  }
}

let userLanguage: string = navigator.language.split('-')[0]
// If the user is on the English version of the website, we should use the English language
const currentUrl = window.location.pathname
const languagePattern = /\/(en|ru)\//
if (languagePattern.test(currentUrl)) {
  userLanguage = 'en'
}

const currentLanguage: string = LANGUAGES[userLanguage] != null ? userLanguage : 'en'
const i18n = (key: string): string => LANGUAGES[currentLanguage][key] ?? LANGUAGES.en[key] ?? key

export { i18n, lettersToNumbers }
