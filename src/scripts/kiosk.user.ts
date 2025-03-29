import all from '../styles/all.scss'
import { i18n } from '../services/i18n'
import { UserSession } from '../userSession'
import { LabelerInterface } from '../labelerInterface'
declare let window: Window

class LabelsUserscript { //TODO: title 
  private readonly user = new UserSession()
  private readonly interface = new LabelerInterface()

  constructor () {
    this.init()
    console.debug('LabelsUserscript initialized')
  }

  private init (): void {
    this.addStyles()
    if (this.user.isLoggedIn && this.user.admin) {
      this.addActivateButton()
    } else if (this.user.isLoggedIn && !this.user.admin) {
      this.interface.init()
    } else if (!this.user.isLoggedIn &&  window.location.pathname === '/login') {
      this.user.addLoginOptions()
    }
  }

  private addStyles (): void {
    const style = document.createElement('style') as HTMLStyleElement
    style.textContent = all
    document.head.appendChild(style)
  }

  addActivateButton(): boolean {
    const navbarShortcuts = document.querySelector('.breadcrumbs')
    if (navbarShortcuts != null) {
      const button = document.createElement('button')
      button.textContent = i18n('labelsAndPrices')
      button.className = 'btn btn-sm'
      button.addEventListener('click', () => {
        this.interface.init()
      })
      navbarShortcuts.appendChild(button)
    }
    return navbarShortcuts != null
  }

}

window.addEventListener('load', () => {
  void new LabelsUserscript()
})