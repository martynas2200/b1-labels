import { i18n } from './services/i18n'
import { lettersToNumbers } from './services/utilities'

export class FormSimplifier {
  constructor() {
    const controlButtons = document.querySelector('.btn-ctrl')
    if (
      controlButtons !== null &&
      controlButtons.querySelector('.simplify-button') === null
    ) {
      controlButtons.appendChild(this.createHideFieldsButton())
    }

    const barcodeInput = document.querySelector<HTMLInputElement>(
      'input[name="barcode"]',
    )
    if (barcodeInput !== null) {
      barcodeInput.removeEventListener('input', (event) => {
        this.handleInputChange(event)
      })
      barcodeInput.addEventListener('input', (event) => {
        this.handleInputChange(event)
      })
    }
  }

  simplifyForm(): void {
    document
      .querySelector<HTMLFormElement>('ng-form')
      ?.classList.add('simplified-form')

    const fieldsToHide = [
      'vatRate',
      'minQuantity',
      'netWeight',
      'grossWeight',
      'expenseCorrespondenceAccountCode',
      'saleCorrespondenceAccountCode',
      'purchaseCorrespondenceAccountCode',
      'externalId',
      'isCommentRequired',
      'defaultSaleService',
      'countryOfOriginName',
      'intrastatShortDescription',
      'intrastatCode',
      'priceFrom',
      'priceUntil',
      'minPriceWithVat',
      'priceMinQuantity',
      'discountStatus',
      'maxDiscount',
      'discountPointsStatus',
      'ageLimit',
      'certificateDate',
      'certificateNumber',
      'validFrom',
      'validUntil',
      'attribute1',
      'attribute2',
      'attribute3',
    ]
    fieldsToHide.forEach((field) => {
      this.hideFormGroupByInputName(field)
    })

    const costFormGroup = this.findFormGroupByInputName('cost')?.parentElement
    const manufacturerFormGroup =
      this.findFormGroupByInputName('manufacturerName')?.parentElement
    if (costFormGroup != null && manufacturerFormGroup != null) {
      manufacturerFormGroup.parentElement?.appendChild(costFormGroup)
    }
  }

  findFormGroupByInputName(inputName: string): HTMLElement | null | undefined {
    const inputElement = inputName.includes('Status')
      ? document.querySelector<HTMLSelectElement>(`select[name="${inputName}"]`)
      : document.querySelector<HTMLInputElement>(`input[name="${inputName}"]`)
    return inputElement?.closest('.form-group')
  }

  hideFormGroupByInputName(inputName: string): void {
    const inputElement = this.findFormGroupByInputName(inputName)
    if (inputElement != null) {
      const formGroup = inputElement.closest('.form-group')
      if (formGroup != null) {
        ;(formGroup as HTMLElement).style.display = 'none'
        const parent = formGroup.parentElement
        if (
          parent != null &&
          !parent.classList.contains('col-lg-12') &&
          !parent.tagName.includes('FORM')
        ) {
          parent.style.display = 'none'
        }
      }
    }
  }

  createHideFieldsButton(): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = 'btn btn-sm margin-left-5 simplify-button'
    button.type = 'button'
    if (localStorage.getItem('simplifyForm') === 'true') {
      button.textContent = i18n('resetForm')
      this.simplifyForm()
    } else {
      button.textContent = i18n('simplifyForm')
    }
    button.addEventListener('click', this.toggleFormLayout.bind(this))
    return button
  }

  toggleFormLayout(): void {
    const simplifyButton =
      document.querySelector<HTMLButtonElement>('.simplify-button')
    const newSetting =
      localStorage.getItem('simplifyForm') === 'true' ? 'false' : 'true'
    localStorage.setItem('simplifyForm', newSetting)
    if (newSetting === 'true') {
      this.simplifyForm()
      if (simplifyButton != null) {
        simplifyButton.textContent = i18n('resetForm')
      }
    } else {
      document
        .querySelectorAll<HTMLElement>('.form-group')
        .forEach((formGroup) => {
          formGroup.style.display = 'block'
          const parent = formGroup.parentElement
          if (parent != null) {
            parent.style.display = 'block'
          }
        })
      if (simplifyButton != null) {
        simplifyButton.textContent = i18n('simplifyForm')
      }
    }
  }

  handleInputChange(event: Event): void {
    const inputField = event.target as HTMLInputElement
    const inputValue = (inputField.value = lettersToNumbers(inputField.value))

    if (!/^\d+$/.test(inputValue)) {
      inputField.style.backgroundColor = 'orangered'
    } else if (inputValue.length === 13 || inputValue.length === 8) {
      inputField.style.backgroundColor = 'lightgreen'
    } else if (inputValue.length < 13) {
      inputField.style.backgroundColor = 'beige'
    } else {
      inputField.style.backgroundColor = 'orangered'
    }
  }
}
