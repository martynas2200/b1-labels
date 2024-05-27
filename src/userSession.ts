declare let angular: angular.IAngularStatic

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
            <h5 class="header blue">Prisijungimas darbo vietoje</h5>
            <div class="form-group text-center">
            <button class="btn btn-success-2 btn-block " type="button" id="auto-login"><i class="fa fa-sign-in"></i> Prisijungti automatiškai</button>
            <button class="btn-primary btn btn-block margin-top-8" type="button" id="show-login-options">Kiti būdai</button>
            </div>
        `
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

    autoLoginButton.addEventListener('click', function () {
      const usernameInput: HTMLInputElement | null = form.querySelector('input[name="username"]')
      const passwordInput: HTMLInputElement | null = form.querySelector('input[name="password"]')

      if ((usernameInput === null) || (passwordInput === null)) {
        console.error('Username or password input not found')
        return
      }

      const username = localStorage.getItem('auto-username')
      const password = localStorage.getItem('auto-password')

      if ((username === null) || (password === null)) {
        console.error('The data has been lost. Please enter your credentials manually.')
        return
      }
      usernameInput.value = username
      passwordInput.value = password
      form.submit()
    })
    return true // success
  }
};
