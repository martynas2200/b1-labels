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
    brightStyle: 'Make it bright',
    resetStyles: 'Reset styles',
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
    department: 'Department',
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
    weightedItem: 'Weighted item'
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
    simplifyForm: 'Paprasta forma',
    brightStyle: 'Ryškus stilius',
    resetStyles: 'Atkurti stilių',
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
    department: 'S',
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
