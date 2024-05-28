import { i18n } from "./i18n"

declare let angular: angular.IAngularStatic
declare let GM: any
export class UserSession {
  interfaceInUse: boolean
  isLoggedIn: boolean
  admin: boolean
  user: {
    name: string
    typeId: number
  } | null

  constructor () {
    this.interfaceInUse = false
    this.isLoggedIn = false
    this.admin = false
    this.user = null
    this.checkLoginStatus()
  }

  public checkLoginStatus (): boolean {
    const dropdownToggle: HTMLElement | null = document.querySelector('.dropdown-toggle')
    if (dropdownToggle === null) {
      this.isLoggedIn = false
      console.error('Dropdown toggle not found')
      return false
    }
    const controller = angular.element(dropdownToggle).controller()
    if (controller.user.name != null) {
      this.user = controller.user
      this.isLoggedIn = true
      // typeId is 1 for admin, 2 for accountant, 3 for manager, 4 for salesperson
      // No need to check for null, because we already checked for the length, but the linter doesn't know that ?...
      this.admin = (this.user != null) ? this.user.typeId <= 3 : false
    } else {
      this.isLoggedIn = false
    }
    return this.isLoggedIn
  }

  private addContainer (): boolean {
    const h5Elements = document.querySelectorAll('h5')
    h5Elements.forEach(element => { element.remove() })

    const formElement = document.querySelector('form')
    const html = `
      <h5 class="header blue">${ i18n('login') }</h5>
      <div class="form-group text-center">
      <button class="btn btn-success-2 btn-block " type="button" id="auto-login"><i class="fa fa-sign-in"></i>${ i18n('autoLogin') }</button>
      <button class="btn-primary btn btn-block margin-top-8" type="button" id="show-login-options">${ i18n('showLoginOptions') }</button>
      </div>`
    if (formElement !== null) {
      formElement.insertAdjacentHTML('beforebegin', html)
      formElement.style.display = 'none'
      return true
    } else {
      console.error('Form not found!')
      return false
    }
  }

  public addLoginOptions (): boolean {
    if (!this.addContainer()) {
      return false
    }
    const optionsButton: HTMLButtonElement | null = document.querySelector('#show-login-options')
    const autoLoginButton: HTMLButtonElement | null = document.querySelector('#auto-login')
    const form: HTMLFormElement | null = document.querySelector('form')
    if ((optionsButton === null) || (autoLoginButton === null) || (form === null)) {
      return false
    }
    optionsButton.addEventListener('click', function () {
      form.style.display = 'block'
      optionsButton.style.display = 'none'
    })
    // bind auto login button to autoLogin function
    autoLoginButton.addEventListener('click', () => {
      void this.autoLogin()
    })
    return true // success
  }

  private async autoLogin (): Promise<boolean> {
    const usernameInput: HTMLInputElement | null = document.querySelector('input[name="username"]')
    const passwordInput: HTMLInputElement | null = document.querySelector('input[name="password"]')
    if ((usernameInput === null) || (passwordInput === null)) {
      alert('Username or password input not found')
      return false
    }
    const username = await GM.getValue('username', '')
    const password = await GM.getValue('password', '')
    if (username === '' || password === '') {
      // crazy idea to check what is in the fields and if they contain x's then ask to save the login details
      alert('Login details not found')
      if (usernameInput.value === 'x' && passwordInput.value === 'x') {
        void this.saveLoginDetails()
      }
      return false
    }
    usernameInput.value = username
    passwordInput.value = password
    // trigger change event to make angular update the model
    usernameInput.dispatchEvent(new Event('input', { bubbles: true }))
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

    const form: HTMLFormElement | null = document.querySelector('form')
    if (form === null) {
      alert('Form not found')
      return false
    }
    let key = form.getAttribute('ng-submit')
    if (key === null) {
      alert('Recaptcha key not found')
      return false
    }
    const match = key.match(/"([^"]+)"/)
    if (match === null) {
      alert('Recaptcha key not found')
      return false
    }
    key = match[1]
    angular.element(form).controller().signIn(key)
    return true
  }

  // function to prompt user to save login details
  private async saveLoginDetails (): Promise<void> {
    if (window.confirm('Do you want to save these login details?')) {
      // prompt user to enter login details
      const username = window.prompt('Enter your username')
      const password = window.prompt('Enter your password')
      if (username != null && password != null) {
        await GM.setValue('username', username)
        await GM.setValue('password', password)
        alert('Login details saved')
      }
    }
    if (!window.confirm('Do you want to save API key?')) {
      return
    }
    const apiKey = window.prompt('Enter your API key')
    if (apiKey === null) {
      return
    }
    await GM.setValue('api-key', apiKey)
    alert('API key saved')
  }
};
