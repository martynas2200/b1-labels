import { i18n } from './i18n'
import { type item } from './item'
import { UINotification } from './ui-notification'

declare let angular: any

export class Request {
  items: Record<string, item> = {}
  baseUrl: string = 'https://www.b1.lt'
  path: string = '/reference-book/items/search'
  csrfToken: string
  headers: Record<string, string>
  notifier: UINotification
  turnstileService: {
    render: () => Promise<void>,
  }

  constructor(notifier: UINotification) {
    const appElement = document.querySelector('[ng-app]') // TODO: refactor, a class could be responsible to get the app element, and load `imported` services
    if (!appElement) {
      throw new Error('Angular app not found')
    }

    const injector = angular.element(appElement).injector()
    this.turnstileService = injector.get('turnstileService')

    const csrfTokenElement: HTMLMetaElement | null = document.querySelector(
      'meta[name="csrf-token"]',
    )
    this.csrfToken = csrfTokenElement != null ? csrfTokenElement.content : ''
    this.notifier = notifier
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
    }
  }

  async fetchData(
    method: string,
    path: string,
    body: Record<string, any>,
  ): Promise<any> {
    if (this.csrfToken === '') {
      console.error('CSRF token is missing')
      this.notifier.error('CSRF token is missing')
      return
    }

    const pathParts = path.split('/')
    pathParts.pop()
    this.headers.referer = `${this.baseUrl}${pathParts.join('/')}`
    this.getCookies()

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers,
        body: JSON.stringify(body),
      })

      if (response.ok) {
        return await response.json()
      } else if (
        'challenge' === response.headers.get('cf-mitigated') ||
        response.status === 403
      ) {
        if (await this.handleChallenge()) {
          console.info('Challenge handled, repeat the request')
          return await this.fetchData(method, path, body)
        }
      } else {
        console.error('Request failed with status:', response.status)
        this.notifier.error({
          title: i18n('error'),
          message: response.statusText,
        })
      }
    } catch (error: any) {
      console.error('Error:', error)
      this.notifier.error('Error: ' + error)
    }
  }

  getCookies(): void {
    const cookies = document.cookie.split(';').map((cookie) => cookie.trim())
    cookies.forEach((cookie) => {
      const [name, value] = cookie.split('=')
      if (
        [
          'YII_CSRF_TOKEN',
          'b1-device_id',
          'b1-session_id',
          'b1-use-cookies',
          'b1-wss_srv',
          'b1-ref_url',
          'cf_clearance',
          '_ga',
        ].includes(name.trim())
      ) {
        this.headers.cookie =
          this.headers.cookie.length > 0
            ? `${this.headers.cookie}; ${name}=${value}`
            : `${name}=${value}`
      }
    })
  }

  isItDigits(barcode: string): boolean {
    return /^\d+$/.test(barcode)
  }

  /**
   * Get item by barcode
   * @param barcode - barcode of the item
   * @returns item object
   * @example
   * const item = await req.getItem('1234567890123')
   */
  async getItem(barcode: string): Promise<any> {
    if (!this.isItDigits(barcode)) {
      this.notifier.error('Invalid barcode')
      return null
    }
    if (Object.keys(this.items).includes(barcode)) {
      const retrievedAt = this.items[barcode].retrievedAt
      if (
        retrievedAt != null &&
        barcode.length > 10 &&
        new Date().getTime() - retrievedAt.getTime() < 30000
      ) {
        return { ...this.items[barcode] }
      } else if (
        retrievedAt != null &&
        barcode.length < 10 &&
        new Date().getTime() - retrievedAt.getTime() < 60000
      ) {
        return { ...this.items[barcode] }
      }
    }

    // Prepare the request body
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
    }

    const data = await this.fetchData('POST', this.path, body)
    if (data == null || data.data[0] == null) {
      return null
    }
    data.data[0].retrievedAt = new Date()
    this.items[barcode] = data.data[0]
    // if there more than one item with the same barcode, return the first one, and notify the user
    if (data.data.length > 1) {
      this.notifier.warning({
        title: i18n('multipleItemsFound'),
        delay: 20000,
        message:
          i18n('barcode') +
          ' ' +
          barcode +
          ' ' +
          i18n('found') +
          ' ' +
          data.data.length +
          ' ' +
          i18n('items'),
      })
    }
    return data.data[0]
  }
  async saveItem(id: string, data: Record<string, any>): Promise<boolean> {
    // Check if the id is provided and it consists of digits only
    if (!this.isItDigits(id)) {
      this.notifier.error(i18n('invalidId'))
      return false
    }
    const response = await this.fetchData(
      'POST',
      `/reference-book/items/update?id=${id}`,
      data,
    )

    if (response.code === 200) {
      this.notifier.success({
        title: i18n('itemUpdated'),
        message: i18n('newPriceIs') + data.priceWithVat,
        delay: 15000,
      })
    } else {
      this.notifier.error({
        title: i18n('failedToUpdateItem'),
        message: response.message,
      })
    }
    return response.code === 200
  }
  async createItem(data: Record<string, any>): Promise<boolean> {
    const response = await this.fetchData(
      'POST',
      '/reference-book/items/create',
      data,
    )
    if (response.code === 200) {
      this.notifier.success(i18n('itemCreated'))
      setTimeout(() => {
        void this.saveItem(response.data.id, { isActive: true })
      }, 400)
    } else {
      this.notifier.error({
        title: i18n('failedToCreateItem'),
        message: response.message,
      })
    }
    return response.code === 200
  }

  async getSales(operationTypeName: string): Promise<any> {
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
    }
    const path = '/warehouse/light-sales/search'
    return this.fetchData('POST', path, body)
  }

  getSaleItems(lightSaleId: string): Promise<any> {
    const body = {
      page: 1,
      pageSize: -1,
      filters: {
        rules: {
          lightSaleId: { field: 'lightSaleId', op: 'eq', data: lightSaleId },
        },
      },
    }
    return this.fetchData('POST', '/warehouse/light-sale-items/search', body)
  }

  clearCache() {
    const nItems = Object.keys(this.items).length
    this.items = {}
    this.notifier.info({
      title: i18n('cacheCleared'),
      message: nItems + i18n('nItemsRemoved'),
    })
  }

  async handleChallenge(): Promise<boolean> {
    try {
      await this.turnstileService.render()
      console.info('Turnstile challenge passed!')
      return true
    } catch (error) {
      console.error('Turnstile challenge failed.', error)
      return false
    }
  }
}