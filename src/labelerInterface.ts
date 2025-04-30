import { i18n } from './services/i18n'
import mainHTML from './html/main.html'
import { LabelerController } from './labelerController'

declare let angular: angular.IAngularStatic

export class LabelerInterface {
  private active: boolean = false

  public isActive(): boolean {
    this.active = (document.querySelector('.item-search-container') !== null)
    return this.active
  }

  public init(): boolean {
    if (this.isActive()) {
      return true
    }
    const mainPage = document.querySelector('.main-container')
    const navbar = document.querySelector('.navbar-dark')
    const footer = document.querySelector('.footer')
    if ((navbar == null) || (footer == null) || (mainPage == null)) {
      return false
    }
    this.removeElements(navbar)
    this.injectHtml(mainPage)
    this.removeElements(footer, mainPage)
    this.changeDocumentTitle()
    document.body.classList.add('label-print-interface')
    this.bindEvents()
    return true
  }

  removeElements(...elements: Element[]): void {
    elements.forEach((el => { el.remove() }))
  }

  injectHtml(mainPage: Element): void {
    const app = angular.module('b1', [])
    app.controller('DynamicController', ['$scope', LabelerController])
    angular.module('b1').filter('i18n', () => {
      return (key: string): string => i18n(key)
    })

    const template = mainHTML(i18n)
    const container = document.createElement('div')
    container.setAttribute('ng-controller', 'DynamicController')
    container.innerHTML = template
    mainPage.insertAdjacentElement('beforebegin', container)

    angular.injector(['ng', 'b1']).invoke(['$compile', '$rootScope', function($compile, $rootScope) {
        const scope = $rootScope.$new()
        $compile(container)(scope)
        scope.$digest()
    }])
  }

  bindEvents(): void {
    const mainInput = document.getElementById('barcodeInput') as HTMLInputElement
    if (mainInput != null) {
      mainInput.focus()
      document.addEventListener('click', (event) => {
        let clickedInsideModal = false
        const modals = document.querySelectorAll('.modal.in')
        modals.forEach(modal => {
          if (modal.contains(event.target as Node))
            {clickedInsideModal = true}
        })
        if (!clickedInsideModal && mainInput != null) {
          mainInput.focus()
        }
      })
    }
  }
  
  changeDocumentTitle(): void {
    document.title = i18n('labels')
  }
}
